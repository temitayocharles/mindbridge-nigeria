import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import validator from 'validator';

// Input validation schema
const registerSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
    email: z.string()
        .email('Invalid email format')
        .max(100, 'Email must be less than 100 characters'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    phone: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    userType: z.enum(['user', 'therapist']).default('user'),
    license: z.string().optional(),
    specialization: z.string().optional(),
    experience: z.string().optional(),
});

// Rate limiting for registration
const registrationAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_REGISTRATION_ATTEMPTS = 3;
const REGISTRATION_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRegistrationRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = registrationAttempts.get(ip);

    if (!record) {
        registrationAttempts.set(ip, { count: 1, lastAttempt: now });
        return false;
    }

    if (now - record.lastAttempt > REGISTRATION_WINDOW) {
        registrationAttempts.set(ip, { count: 1, lastAttempt: now });
        return false;
    }

    record.count++;
    return record.count > MAX_REGISTRATION_ATTEMPTS;
}

// Sanitize input to prevent XSS and injection
function sanitizeString(input: string): string {
    return validator.escape(input.trim());
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'anonymous';

        // Check registration rate limit
        if (checkRegistrationRateLimit(clientIP)) {
            return NextResponse.json(
                {
                    error: 'Too Many Requests',
                    message: 'Too many registration attempts. Please try again later.',
                    retryAfter: 3600 // 1 hour
                },
                { status: 429 }
            );
        }

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Invalid JSON format' },
                { status: 400 }
            );
        }

        // Sanitize string inputs
        const sanitizedBody = { ...body };
        if (sanitizedBody.firstName) sanitizedBody.firstName = sanitizeString(sanitizedBody.firstName);
        if (sanitizedBody.lastName) sanitizedBody.lastName = sanitizeString(sanitizedBody.lastName);
        if (sanitizedBody.email) sanitizedBody.email = sanitizeString(sanitizedBody.email.toLowerCase());
        if (sanitizedBody.phone) sanitizedBody.phone = sanitizeString(sanitizedBody.phone);
        if (sanitizedBody.state) sanitizedBody.state = sanitizeString(sanitizedBody.state);
        if (sanitizedBody.city) sanitizedBody.city = sanitizeString(sanitizedBody.city);
        if (sanitizedBody.license) sanitizedBody.license = sanitizeString(sanitizedBody.license);
        if (sanitizedBody.specialization) sanitizedBody.specialization = sanitizeString(sanitizedBody.specialization);
        if (sanitizedBody.experience) sanitizedBody.experience = sanitizeString(sanitizedBody.experience);

        // Validate input data
        const validation = registerSchema.safeParse(sanitizedBody);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation Failed',
                    message: 'Invalid input data',
                    details: validation.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        const { firstName, lastName, email, password, phone, state, city, userType, license, specialization, experience } = validation.data;

        // Connect to database
        const { db } = await connectToDatabase();

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Conflict', message: 'User already exists with this email' },
                { status: 409 }
            );
        }

        // Hash password with salt
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const userData = {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email: email.toLowerCase(),
            hashedPassword,
            phone,
            state,
            city,
            role: userType,
            isVerified: userType === 'user', // Auto-verify regular users, therapists need manual verification
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            loginAttempts: 0,
            lockUntil: null,
            registrationIP: clientIP,
        };

        // Add therapist-specific fields if applicable
        if (userType === 'therapist') {
            Object.assign(userData, {
                license,
                specialization,
                experience,
                verified: false,
                verificationSubmittedAt: new Date(),
            });
        }

        // Insert user into appropriate collection
        const collection = userType === 'therapist' ? 'therapists' : 'users';
        const result = await db.collection(collection).insertOne(userData);

        // Log successful registration
        await db.collection('security_logs').insertOne({
            type: 'user_registration',
            userId: result.insertedId,
            email,
            userType,
            ip: clientIP,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date(),
            success: true
        });

        // Return success response (without password)
        const { hashedPassword: _, ...userResponse } = userData;

        return NextResponse.json(
            {
                success: true,
                user: {
                    ...userResponse,
                    id: result.insertedId,
                    _id: result.insertedId
                },
                message: userType === 'therapist'
                    ? 'Account created! Please wait for verification.'
                    : 'Account created successfully!'
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);

        // Log failed registration attempt
        try {
            const { db } = await connectToDatabase();
            await db.collection('security_logs').insertOne({
                type: 'registration_error',
                ip: request.headers.get('x-forwarded-for') || 'anonymous',
                userAgent: request.headers.get('user-agent'),
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
                success: false
            });
        } catch (logError) {
            console.error('Failed to log registration error:', logError);
        }

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Registration failed. Please try again later.'
            },
            { status: 500 }
        );
    }
}
