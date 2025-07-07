import { NextRequest, NextResponse } from 'next/server'

export interface SecurityConfig {
  contentSecurityPolicy: {
    enabled: boolean
    directives: Record<string, string[]>
  }
  strictTransportSecurity: {
    enabled: boolean
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOWFROM'
  contentTypeOptions: boolean
  referrerPolicy: string
  permissionsPolicy: Record<string, string[]>
}

const defaultSecurityConfig: SecurityConfig = {
  contentSecurityPolicy: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for development
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://ssl.google-analytics.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com'
      ],
      'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://api.resend.com',
        'https://api.sendgrid.com'
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    }
  },
  strictTransportSecurity: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    'camera': ["'none'"],
    'microphone': ["'none'"],
    'geolocation': ["'none'"],
    'payment': ["'none'"],
    'usb': ["'none'"],
    'magnetometer': ["'none'"],
    'gyroscope': ["'none'"],
    'accelerometer': ["'none'"],
    'ambient-light-sensor': ["'none'"],
    'autoplay': ["'none'"],
    'encrypted-media': ["'none'"],
    'fullscreen': ["'self'"],
    'picture-in-picture': ["'none'"]
  }
}

export class SecurityHeaders {
  private config: SecurityConfig

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      ...defaultSecurityConfig,
      ...config
    }
  }

  public applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.contentSecurityPolicy.enabled) {
      const cspValue = this.buildCSP()
      response.headers.set('Content-Security-Policy', cspValue)
    }

    // Strict Transport Security (HTTPS only)
    if (this.config.strictTransportSecurity.enabled && process.env.NODE_ENV === 'production') {
      let hstsValue = `max-age=${this.config.strictTransportSecurity.maxAge}`
      if (this.config.strictTransportSecurity.includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      if (this.config.strictTransportSecurity.preload) {
        hstsValue += '; preload'
      }
      response.headers.set('Strict-Transport-Security', hstsValue)
    }

    // X-Frame-Options
    response.headers.set('X-Frame-Options', this.config.frameOptions)

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // Referrer Policy
    response.headers.set('Referrer-Policy', this.config.referrerPolicy)

    // Permissions Policy
    const permissionsPolicyValue = this.buildPermissionsPolicy()
    response.headers.set('Permissions-Policy', permissionsPolicyValue)

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    // Remove server information
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')

    return response
  }

  private buildCSP(): string {
    const directives = Object.entries(this.config.contentSecurityPolicy.directives)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive
        }
        return `${directive} ${sources.join(' ')}`
      })
      .join('; ')

    return directives
  }

  private buildPermissionsPolicy(): string {
    return Object.entries(this.config.permissionsPolicy)
      .map(([feature, allowlist]) => {
        return `${feature}=(${allowlist.join(' ')})`
      })
      .join(', ')
  }

  public updateCSPForDevelopment(): void {
    if (process.env.NODE_ENV === 'development') {
      // Allow hot reload and development tools
      this.config.contentSecurityPolicy.directives['script-src'].push(
        "'unsafe-eval'",
        'webpack://*'
      )
      this.config.contentSecurityPolicy.directives['connect-src'].push(
        'ws://localhost:*',
        'http://localhost:*'
      )
    }
  }

  public addTrustedDomain(domain: string, directives: string[] = ['default-src']): void {
    directives.forEach(directive => {
      if (this.config.contentSecurityPolicy.directives[directive]) {
        this.config.contentSecurityPolicy.directives[directive].push(domain)
      }
    })
  }

  public removeTrustedDomain(domain: string): void {
    Object.keys(this.config.contentSecurityPolicy.directives).forEach(directive => {
      const sources = this.config.contentSecurityPolicy.directives[directive]
      const index = sources.indexOf(domain)
      if (index > -1) {
        sources.splice(index, 1)
      }
    })
  }
}

// Middleware function for Next.js
export function withSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req)
    const securityHeaders = new SecurityHeaders()
    
    // Update CSP for development
    if (process.env.NODE_ENV === 'development') {
      securityHeaders.updateCSPForDevelopment()
    }

    return securityHeaders.applyHeaders(response)
  }
}

// Create singleton instance
export const securityHeaders = new SecurityHeaders()

// Helper function to check if request is from trusted origin
export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  const trustedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean)

  if (origin) {
    return trustedOrigins.some(trusted => trusted && origin.startsWith(trusted))
  }

  if (referer) {
    return trustedOrigins.some(trusted => trusted && referer.startsWith(trusted))
  }

  return false
}

// CSRF Token generation and validation
export function generateCSRFToken(): string {
  const timestamp = Date.now().toString()
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `${timestamp}.${randomBytes}`
}

export function validateCSRFToken(token: string, maxAge: number = 3600000): boolean {
  try {
    const [timestamp, hash] = token.split('.')
    const tokenAge = Date.now() - parseInt(timestamp)
    
    return tokenAge <= maxAge && hash.length === 64
  } catch {
    return false
  }
}

// Security event logging
export interface SecurityEvent {
  type: 'SECURITY_VIOLATION' | 'SUSPICIOUS_ACTIVITY' | 'BLOCKED_REQUEST' | 'RATE_LIMIT_EXCEEDED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  ipAddress: string
  userAgent: string
  path: string
  metadata?: Record<string, any>
}

export function logSecurityEvent(event: SecurityEvent): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry)
  }

  // In production, this would be sent to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (implement based on your infrastructure)
    // Example: send to CloudWatch, DataDog, Sentry, etc.
  }
} 