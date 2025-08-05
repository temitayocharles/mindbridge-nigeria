import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

// Cache health check results for better performance
interface CachedHealthResult {
    status: 'healthy' | 'unhealthy' | 'degraded'
    timestamp: string
    uptime: number
    responseTime: string
    environment: string
    version: string
    services: {
        database: 'up' | 'down' | 'degraded'
        api: 'up' | 'down'
    }
    memory: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
    }
    pid: number
    database?: {
        status: string
        responseTime: number
        error?: string
    }
}

let cachedHealthResult: CachedHealthResult | null = null
let lastHealthCheck = 0
const CACHE_DURATION = 30000 // 30 seconds cache

async function healthHandler(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now()

    try {
        const now = Date.now()

        // Use cached result if available and recent
        if (cachedHealthResult && (now - lastHealthCheck) < CACHE_DURATION) {
            return NextResponse.json({
                ...cachedHealthResult,
                responseTime: `${Date.now() - startTime}ms`,
                cached: true
            })
        }

        // Check database health with improved error handling
        const dbHealth = await checkDatabaseHealth()

        // Check memory usage
        const memoryUsage = process.memoryUsage()
        const memoryInMB = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
        }

        // Determine overall service status and HTTP status code
        let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
        let httpStatus = 200
        
        if (dbHealth.status === 'unhealthy') {
            overallStatus = 'unhealthy'
            httpStatus = 503
        } else if (dbHealth.status === 'degraded') {
            overallStatus = 'degraded'
            httpStatus = 200 // Still operational, but with issues
        }

        const responseTime = Date.now() - startTime

        const healthStatus: CachedHealthResult = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '0.1.0',
            services: {
                database: dbHealth.status === 'healthy' ? 'up' : 
                         dbHealth.status === 'degraded' ? 'degraded' : 'down',
                api: 'up'
            },
            memory: memoryInMB,
            pid: process.pid,
            database: {
                status: dbHealth.status,
                responseTime: dbHealth.responseTime,
                error: dbHealth.error
            }
        }

        // Cache the result
        cachedHealthResult = healthStatus
        lastHealthCheck = now

        return NextResponse.json(healthStatus, { 
            status: httpStatus,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
    } catch (error) {
        console.error('Health check failed:', error)

        const responseTime = Date.now() - startTime
        const errorResponse: CachedHealthResult = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '0.1.0',
            services: {
                database: 'down',
                api: 'down'
            },
            memory: {
                rss: 0,
                heapTotal: 0,
                heapUsed: 0,
                external: 0
            },
            pid: process.pid
        }

        return NextResponse.json(errorResponse, { 
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache', 
                'Expires': '0'
            }
        })
    }
}

// Apply improved rate limiting: 200 requests per minute for health checks (test-friendly)
export const GET = withRateLimit(healthHandler, {
    limit: 200,
    windowMs: 60000,
    message: 'Too many health check requests'
})
