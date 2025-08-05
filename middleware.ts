import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'anonymous';
    return ip;
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record) {
        rateLimitMap.set(key, { count: 1, lastRequest: now });
        return false;
    }

    // Reset count if window has passed
    if (now - record.lastRequest > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(key, { count: 1, lastRequest: now });
        return false;
    }

    // Increment count
    record.count++;
    record.lastRequest = now;

    return record.count > RATE_LIMIT_MAX_REQUESTS;
}

// Protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/api/users/profile',
    '/api/admin',
    '/api/sessions',
    '/api/messages',
    '/api/mood-entries'
];

// Admin routes that require admin role
const adminRoutes = [
    '/api/admin',
    '/dashboard/admin'
];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Create response
    const response = NextResponse.next();

    // Remove X-Powered-By header for security
    response.headers.delete('x-powered-by');

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=self, microphone=self, geolocation=self');

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.openai.com https://api.stripe.com; " +
        "frame-src 'self' https://js.stripe.com; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
        const rateLimitKey = getRateLimitKey(request);

        if (isRateLimited(rateLimitKey)) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: 60
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                        ...Object.fromEntries(response.headers.entries())
                    }
                }
            );
        }
    }

    // Authentication check for protected routes
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // Check if user is authenticated
        if (!token) {
            if (pathname.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Unauthorized',
                        message: 'Authentication required'
                    }),
                    {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json',
                            ...Object.fromEntries(response.headers.entries())
                        }
                    }
                );
            } else {
                // Redirect to login for web pages
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        // Check admin access for admin routes
        if (isAdminRoute && token.role !== 'admin') {
            if (pathname.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Forbidden',
                        message: 'Admin access required'
                    }),
                    {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json',
                            ...Object.fromEntries(response.headers.entries())
                        }
                    }
                );
            } else {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // Input validation for query parameters to prevent injection attacks
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Check for suspicious patterns in query parameters
    const suspiciousPatterns = [
        /(['"])(.*?)\1\s*(OR|AND|UNION|SELECT|DROP|INSERT|UPDATE|DELETE)\s/i,
        /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
        /(<script|javascript:|vbscript:|onload=|onerror=)/i
    ];

    for (const [_key, value] of searchParams.entries()) {
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Bad Request',
                        message: 'Invalid request parameters'
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            ...Object.fromEntries(response.headers.entries())
                        }
                    }
                );
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
