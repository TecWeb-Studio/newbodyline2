/**
 * Simple in-memory rate limiter using a sliding window approach.
 * For serverless: the map resets on cold start, which is acceptable
 * because the rate limit protects against burst abuse, not persistent DoS.
 */

interface RateEntry {
  timestamps: number[]
}

const store = new Map<string, RateEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 60_000)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}, 300_000)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (IP, email, etc.)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = windowMs - (now - oldestInWindow)
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  }
}

/**
 * Extract a rate-limit key from a request.
 * Uses X-Forwarded-For header (common behind proxies), falls back to a generic key.
 */
export function getRateLimitKey(request: Request, prefix: string = ''): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
  return `${prefix}:${ip}`
}
