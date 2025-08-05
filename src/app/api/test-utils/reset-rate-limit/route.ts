import { NextRequest, NextResponse } from 'next/server'
import { resetRateLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest): Promise<NextResponse> {
    // Only allow in development or test environments
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Not available in production' },
            { status: 403 }
        )
    }

    try {
        resetRateLimiter()
        return NextResponse.json({ success: true, message: 'Rate limiter reset' })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to reset rate limiter' },
            { status: 500 }
        )
    }
}
