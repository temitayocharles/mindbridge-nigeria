import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database'

// Cache health check results for better performance
let cachedHealthResult: any = null
let lastHealthCheck = 0
const CACHE_DURATION = 30000 // 30 seconds cache

// Simple in-memory rate limiting for health endpoint
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 50 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIp(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown'
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Rate limiting check
        const clientIp = getClientIp(request)
        const now = Date.now()
        const clientData = rateLimitMap.get(clientIp)

        if (clientData) {
            if (now - clientData.timestamp < RATE_WINDOW) {
                if (clientData.count >= RATE_LIMIT) {
                    return NextResponse.json(
                        { error: 'Rate limit exceeded', retryAfter: Math.ceil((RATE_WINDOW - (now - clientData.timestamp)) / 1000) },
                        { status: 429 }
                    )
                }
                clientData.count++
            } else {
                rateLimitMap.set(clientIp, { count: 1, timestamp: now })
            }
        } else {
            rateLimitMap.set(clientIp, { count: 1, timestamp: now })
        }

        // Use cached result if available and recent
        if (cachedHealthResult && (now - lastHealthCheck) < CACHE_DURATION) {
            return NextResponse.json({
                ...cachedHealthResult,
                responseTime: `${Date.now() - startTime}ms`,
                cached: true
            })
        }

        // Check database connectivity with shorter timeout for better performance
        let dbHealthy = true
        if (process.env.NODE_ENV !== 'production' || process.env.SKIP_DB_CHECK !== 'true') {
            try {
                dbHealthy = await Promise.race([
                    checkDatabaseHealth(),
                    new Promise<boolean>((_, reject) =>
                        setTimeout(() => reject(new Error('Database check timeout')), 1000) // Reduced to 1 second
                    )
                ])
            } catch (error) {
                console.warn('Database health check failed:', error)
                dbHealthy = false
            }
        }

        // Check memory usage
        const memoryUsage = process.memoryUsage()
        const memoryUsageMB = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
        }

        const responseTime = Date.now() - startTime

        const healthStatus = {
            status: dbHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: dbHealthy ? 'up' : 'down',
                api: 'up'
            },
            memory: memoryUsageMB,
            pid: process.pid
        }

        // Cache the result
        cachedHealthResult = healthStatus
        lastHealthCheck = now

        return NextResponse.json(
            healthStatus,
            { status: dbHealthy ? 200 : 503 }
        )
    } catch (error) {
        console.error('Health check failed:', error)

        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                services: {
                    database: 'unknown',
                    api: 'up'
                },
                responseTime: `${Date.now() - startTime}ms`
            },
            { status: 503 }
        )
    }
}
