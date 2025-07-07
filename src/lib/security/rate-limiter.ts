import { NextRequest } from 'next/server'
import { logSecurityEvent } from './security-headers'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
  onLimitReached?: (request: NextRequest, remaining: number) => void
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

// In-memory store for development/testing
// In production, use Redis or similar distributed cache
class MemoryStore {
  private hits: Map<string, { count: number; resetTime: number }> = new Map()

  async get(key: string): Promise<{ count: number; resetTime: number } | undefined> {
    return this.hits.get(key)
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.hits.set(key, value)
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const existing = this.hits.get(key)

    if (!existing || now > existing.resetTime) {
      const newEntry = { count: 1, resetTime: now + windowMs }
      this.hits.set(key, newEntry)
      return newEntry
    }

    existing.count += 1
    this.hits.set(key, existing)
    return existing
  }

  async cleanup(): Promise<void> {
    const now = Date.now()
    for (const [key, value] of this.hits.entries()) {
      if (now > value.resetTime) {
        this.hits.delete(key)
      }
    }
  }
}

export class RateLimiter {
  private store: MemoryStore
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.store = new MemoryStore()

    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.store.cleanup()
    }, 5 * 60 * 1000)
  }

  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.defaultKeyGenerator(request)

    const result = await this.store.increment(key, this.config.windowMs)
    const allowed = result.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - result.count)

    if (!allowed && this.config.onLimitReached) {
      this.config.onLimitReached(request, remaining)
    }

    return {
      allowed,
      remaining,
      resetTime: result.resetTime,
      totalHits: result.count
    }
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = this.getClientIP(request)
    const path = request.nextUrl.pathname
    return `${ip}:${path}`
  }

  private getClientIP(request: NextRequest): string {
    // Try various headers for the real IP
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const xRealIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')

    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim()
    }
    if (xRealIP) {
      return xRealIP
    }
    if (cfConnectingIP) {
      return cfConnectingIP
    }

    return 'unknown'
  }
}

// Predefined rate limit configurations for medical application
export const rateLimitConfigs = {
  // General API requests
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        description: 'API rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    skipSuccessfulRequests: true,
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        description: 'Authentication rate limit exceeded - potential brute force attack',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Patient intake form
  intake: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 intake submissions per hour
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        description: 'Intake form rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Appointment booking
  booking: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 5, // 5 booking attempts per 30 minutes
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        description: 'Appointment booking rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset attempts per hour
    keyGenerator: (request: NextRequest) => {
      // Rate limit by email if provided, otherwise by IP
      const email = request.nextUrl.searchParams.get('email')
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      return email ? `password-reset:${email}` : `password-reset:${ip}`
    },
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        description: 'Password reset rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Email/SMS notifications
  notifications: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 notifications per hour
    keyGenerator: (request: NextRequest) => {
      // Rate limit by user ID if authenticated
      const userId = request.headers.get('x-user-id')
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      return userId ? `notifications:${userId}` : `notifications:${ip}`
    }
  },

  // File uploads
  uploads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 file uploads per hour
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        description: 'File upload rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname
      })
    }
  },

  // Admin operations (stricter limits)
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 admin operations per 15 minutes
    keyGenerator: (request: NextRequest) => {
      const userId = request.headers.get('x-user-id') || 'anonymous'
      return `admin:${userId}`
    },
    onLimitReached: (request: NextRequest) => {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        description: 'Admin operations rate limit exceeded',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        path: request.nextUrl.pathname,
        metadata: {
          userId: request.headers.get('x-user-id')
        }
      })
    }
  }
}

// Rate limiter instances
export const rateLimiters = {
  api: new RateLimiter(rateLimitConfigs.api),
  auth: new RateLimiter(rateLimitConfigs.auth),
  intake: new RateLimiter(rateLimitConfigs.intake),
  booking: new RateLimiter(rateLimitConfigs.booking),
  passwordReset: new RateLimiter(rateLimitConfigs.passwordReset),
  notifications: new RateLimiter(rateLimitConfigs.notifications),
  uploads: new RateLimiter(rateLimitConfigs.uploads),
  admin: new RateLimiter(rateLimitConfigs.admin)
}

// Middleware helper function
export async function withRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const limiter = rateLimiters[limiterType]
  const result = await limiter.checkLimit(request)

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitConfigs[limiterType].maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'X-RateLimit-Window': (rateLimitConfigs[limiterType].windowMs / 1000).toString()
  }

  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  }

  return {
    allowed: result.allowed,
    headers
  }
}

// Helper function to check if IP is suspicious
export function isSuspiciousIP(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  // Add your IP blacklist logic here
  const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || []
  const suspiciousPatterns = [
    /^10\./, // Private IP ranges (if not expected)
    /^172\./, 
    /^192\.168\./,
    /^127\./, // Localhost
  ]

  if (blacklistedIPs.includes(ip)) {
    return true
  }

  // Check for suspicious patterns (adjust based on your needs)
  return suspiciousPatterns.some(pattern => pattern.test(ip))
}

// Enhanced request analysis
export function analyzeRequest(request: NextRequest): {
  risk: 'low' | 'medium' | 'high'
  reasons: string[]
} {
  const reasons: string[] = []
  let risk: 'low' | 'medium' | 'high' = 'low'

  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  // Check user agent
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious user agent')
    risk = 'medium'
  }

  // Check for bot patterns
  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python|php/i
  if (botPatterns.test(userAgent)) {
    reasons.push('Bot-like user agent')
    risk = 'medium'
  }

  // Check for suspicious IPs
  if (isSuspiciousIP(request)) {
    reasons.push('Suspicious IP address')
    risk = 'high'
  }

  // Check for missing expected headers
  if (!request.headers.get('accept')) {
    reasons.push('Missing Accept header')
    risk = 'medium'
  }

  // Check for unusual request patterns
  const path = request.nextUrl.pathname
  const suspiciousPaths = [
    '/wp-admin',
    '/admin.php',
    '/.env',
    '/config',
    '/backup'
  ]

  if (suspiciousPaths.some(suspiciousPath => path.includes(suspiciousPath))) {
    reasons.push('Suspicious path access')
    risk = 'high'
  }

  return { risk, reasons }
} 