/**
 * Simple in-memory rate limiter for authentication endpoints.
 * For production at scale, consider using Redis-based rate limiting (@upstash/ratelimit).
 */

type RateLimitRecord = {
  count: number
  timestamp: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let cleanupTimer: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupTimer) return

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.timestamp > 60000) {
        rateLimitMap.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Check if a request should be rate limited.
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns Object with success status and remaining attempts
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetIn: number } {
  startCleanup()

  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // First request or window expired
  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now })
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowMs
    }
  }

  // Within window
  if (record.count >= limit) {
    const resetIn = windowMs - (now - record.timestamp)
    return {
      success: false,
      remaining: 0,
      resetIn
    }
  }

  // Increment count
  record.count++
  return {
    success: true,
    remaining: limit - record.count,
    resetIn: windowMs - (now - record.timestamp)
  }
}

/**
 * Get client IP from request headers.
 * Works with proxies that set X-Forwarded-For header.
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback for development
  return '127.0.0.1'
}
