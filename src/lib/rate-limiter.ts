import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  public check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store[identifier];

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      this.store[identifier] = {
        count: 1,
        resetTime: now + windowMs
      };
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs
      };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime
    };
  }

  public getClientIdentifier(request: NextRequest): string {
    // Try to get real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    let ip = forwarded?.split(',')[0] || realIp || cfConnectingIp;
    
    if (!ip) {
      // Fallback to default IP
      ip = 'unknown';
    }
    
    return ip.trim();
  }

  public reset() {
    this.store = {};
  }

  public destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

// Export reset function for testing
export const resetRateLimiter = () => rateLimiter.reset();

// Rate limiting middleware function
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    limit?: number;
    windowMs?: number;
    message?: string;
  } = {}
) {
  const { limit = 10, windowMs = 60000, message = 'Too many requests' } = options;

  return async (request: NextRequest): Promise<Response> => {
    // Skip rate limiting in test environments or when explicitly disabled
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
      return await handler(request);
    }

    // More generous limits for development
    const devLimit = process.env.NODE_ENV === 'development' ? Math.max(limit * 3, 200) : limit;
    const devWindow = process.env.NODE_ENV === 'development' ? Math.min(windowMs, 30000) : windowMs;
    
    const identifier = rateLimiter.getClientIdentifier(request);
    const result = rateLimiter.check(identifier, devLimit, devWindow);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': devLimit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const response = await handler(request);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', devLimit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}
