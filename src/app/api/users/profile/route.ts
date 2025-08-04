import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Input validation schemas
const getUserSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
});

const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    bio: z.string().max(500).optional(),
});

// Sanitize input to prevent injection attacks
function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        return input.replace(/[<>'"\\;]/g, '').trim();
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[sanitizeInput(key)] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
}

// Rate limiting per user
const userRateLimit = new Map<string, { count: number; lastRequest: number }>();
const USER_RATE_LIMIT = 50;
const RATE_WINDOW = 60 * 1000;

function checkUserRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = userRateLimit.get(userId);

    if (!record) {
        userRateLimit.set(userId, { count: 1, lastRequest: now });
        return false;
    }

    if (now - record.lastRequest > RATE_WINDOW) {
        userRateLimit.set(userId, { count: 1, lastRequest: now });
        return false;
    }

    record.count++;
    return record.count > USER_RATE_LIMIT;
}

// GET /api/users/profile - Get current user profile
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check user rate limit
        if (checkUserRateLimit(token.sub || '')) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        // Connect to database
        const { db } = await connectToDatabase();

        // Use ObjectId to prevent injection
        const { ObjectId } = require('mongodb');
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(token.sub) },
            { projection: { password: 0, hashedPassword: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'Not Found', message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('GET /api/users/profile error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(request: NextRequest) {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check rate limit
        if (checkUserRateLimit(token.sub || '')) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const sanitizedBody = sanitizeInput(body);

        // Validate input
        const validation = updateUserSchema.safeParse(sanitizedBody);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Validation failed',
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date()
        };

        // Connect to database
        const { db } = await connectToDatabase();

        // Use ObjectId to prevent injection
        const { ObjectId } = require('mongodb');
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(token.sub) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Not Found', message: 'User not found' },
                { status: 404 }
            );
        }

        // Get updated user
        const updatedUser = await db.collection('users').findOne(
            { _id: new ObjectId(token.sub) },
            { projection: { password: 0, hashedPassword: 0 } }
        );

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('PUT /api/users/profile error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
