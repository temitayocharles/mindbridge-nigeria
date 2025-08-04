import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

// Input validation schemas
const adminActionSchema = z.object({
    action: z.enum(['list_users', 'verify_therapist', 'delete_user', 'system_stats']),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(10),
});

// Rate limiting for admin actions
const adminRateLimit = new Map<string, { count: number; lastRequest: number }>();
const ADMIN_RATE_LIMIT = 20; // 20 admin actions per minute
const RATE_WINDOW = 60 * 1000;

function checkAdminRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = adminRateLimit.get(userId);

    if (!record) {
        adminRateLimit.set(userId, { count: 1, lastRequest: now });
        return false;
    }

    if (now - record.lastRequest > RATE_WINDOW) {
        adminRateLimit.set(userId, { count: 1, lastRequest: now });
        return false;
    }

    record.count++;
    return record.count > ADMIN_RATE_LIMIT;
}

// GET /api/admin - Admin dashboard data
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // Check authentication and admin role
        if (!token || token.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Admin access required' },
                { status: 403 }
            );
        }

        // Check admin rate limit
        if (checkAdminRateLimit(token.sub || '')) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Admin rate limit exceeded' },
                { status: 429 }
            );
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'system_stats';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));

        // Validate input
        const validation = adminActionSchema.safeParse({
            action,
            page,
            limit
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Invalid parameters',
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        // Connect to database
        const { db } = await connectToDatabase();

        switch (validation.data.action) {
            case 'system_stats':
                const stats = await Promise.all([
                    db.collection('users').countDocuments(),
                    db.collection('therapists').countDocuments(),
                    db.collection('sessions').countDocuments(),
                    db.collection('users').countDocuments({ isVerified: false }),
                    db.collection('therapists').countDocuments({ isVerified: false }),
                ]);

                return NextResponse.json({
                    stats: {
                        totalUsers: stats[0],
                        totalTherapists: stats[1],
                        totalSessions: stats[2],
                        unverifiedUsers: stats[3],
                        unverifiedTherapists: stats[4],
                        lastUpdated: new Date().toISOString()
                    }
                });

            case 'list_users':
                const skip = (validation.data.page - 1) * validation.data.limit;

                const users = await db.collection('users')
                    .find(
                        {},
                        {
                            projection: { password: 0, hashedPassword: 0 },
                            limit: validation.data.limit,
                            skip,
                            sort: { createdAt: -1 }
                        }
                    )
                    .toArray();

                const totalUsers = await db.collection('users').countDocuments();

                return NextResponse.json({
                    users,
                    pagination: {
                        page: validation.data.page,
                        limit: validation.data.limit,
                        total: totalUsers,
                        pages: Math.ceil(totalUsers / validation.data.limit)
                    }
                });

            default:
                return NextResponse.json(
                    { error: 'Bad Request', message: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('GET /api/admin error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Admin operation failed' },
            { status: 500 }
        );
    }
}

// POST /api/admin - Admin actions
export async function POST(request: NextRequest) {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // Check authentication and admin role
        if (!token || token.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Admin access required' },
                { status: 403 }
            );
        }

        // Check admin rate limit
        if (checkAdminRateLimit(token.sub || '')) {
            return NextResponse.json(
                { error: 'Too Many Requests', message: 'Admin rate limit exceeded' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = adminActionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Invalid request data',
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        // Connect to database
        const { db } = await connectToDatabase();
        const ObjectId = require('mongodb').ObjectId;

        switch (validation.data.action) {
            case 'verify_therapist':
                if (!validation.data.userId) {
                    return NextResponse.json(
                        { error: 'Bad Request', message: 'User ID required for verification' },
                        { status: 400 }
                    );
                }

                const verifyResult = await db.collection('therapists').updateOne(
                    { _id: new ObjectId(validation.data.userId) },
                    {
                        $set: {
                            isVerified: true,
                            verifiedAt: new Date(),
                            verifiedBy: token.sub
                        }
                    }
                );

                if (verifyResult.matchedCount === 0) {
                    return NextResponse.json(
                        { error: 'Not Found', message: 'Therapist not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    message: 'Therapist verified successfully',
                    action: 'verify_therapist',
                    userId: validation.data.userId
                });

            case 'delete_user':
                if (!validation.data.userId) {
                    return NextResponse.json(
                        { error: 'Bad Request', message: 'User ID required for deletion' },
                        { status: 400 }
                    );
                }

                // Prevent admin from deleting themselves
                if (validation.data.userId === token.sub) {
                    return NextResponse.json(
                        { error: 'Bad Request', message: 'Cannot delete your own account' },
                        { status: 400 }
                    );
                }

                const deleteResult = await db.collection('users').deleteOne(
                    { _id: new ObjectId(validation.data.userId) }
                );

                if (deleteResult.deletedCount === 0) {
                    return NextResponse.json(
                        { error: 'Not Found', message: 'User not found' },
                        { status: 404 }
                    );
                }

                // Log admin action
                await db.collection('admin_logs').insertOne({
                    adminId: token.sub,
                    action: 'delete_user',
                    targetUserId: validation.data.userId,
                    timestamp: new Date(),
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip
                });

                return NextResponse.json({
                    message: 'User deleted successfully',
                    action: 'delete_user',
                    userId: validation.data.userId
                });

            default:
                return NextResponse.json(
                    { error: 'Bad Request', message: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('POST /api/admin error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Admin action failed' },
            { status: 500 }
        );
    }
}
