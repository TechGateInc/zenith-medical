import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AdminRole } from '@prisma/client'

// Routes that don't require location detection
const SKIP_LOCATION_ROUTES = ['/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/images']

// Admin routes that bypass location requirements
const ADMIN_ROUTES = ['/admin']

// Check if route needs location handling
function needsLocationHandling(pathname: string): boolean {
  if (SKIP_LOCATION_ROUTES.some(route => pathname.startsWith(route))) {
    return false
  }
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return false
  }
  if (pathname === '/' || pathname === '/location-selector') {
    return false
  }
  return true
}

// Extract location slug and add headers for location-based routes
function handleLocationRoutes(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  if (!needsLocationHandling(pathname)) {
    return NextResponse.next()
  }

  // Extract location from pathname (first segment)
  const pathSegments = pathname.split('/').filter(Boolean)
  const potentialLocation = pathSegments[0]

  // For location-based routes, set headers and let the page handle validation
  if (potentialLocation && potentialLocation.match(/^[a-z0-9-]+$/)) {
    const response = NextResponse.next()

    // Set location headers for the application to use
    response.headers.set('x-location-slug', potentialLocation)
    response.headers.set('x-location-path', pathname)

    return response
  }

  return NextResponse.next()
}

// Auth middleware for admin routes
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname === '/admin/login'

    // Allow access to login page
    if (isLoginPage) {
      return NextResponse.next()
    }

    // Protect admin routes
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check role-based permissions for specific admin routes
    if (isAdminRoute && token) {
      const userRole = token.role as AdminRole

      // Super admin routes
      if (req.nextUrl.pathname.startsWith('/admin/users') && userRole !== AdminRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }

      // Admin-only routes (content management requiring admin or higher)
      const adminOnlyPaths = ['/admin/content', '/admin/export']
      const isAdminOnlyPath = adminOnlyPaths.some(path => req.nextUrl.pathname.startsWith(path))

      if (isAdminOnlyPath && userRole === AdminRole.EDITOR) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isLoginPage = req.nextUrl.pathname === '/admin/login'

        // Allow public routes and login page
        if (!isAdminRoute || isLoginPage) {
          return true
        }

        // Require authentication for admin routes
        return !!token
      },
    },
  }
)

// Combined middleware
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle admin routes with auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return authMiddleware(request as any, {} as any)
  }

  // Handle location detection for public routes
  return handleLocationRoutes(request)
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}

// Utility functions for use in components/pages
export const locationUtils = {
  // Get location from request headers (for use in server components)
  getLocationFromHeaders: (headers: Headers) => {
    return headers.get('x-location-slug') ?? null
  },

  // Format location slug for display
  formatLocationName: (slug: string) => {
    return slug.charAt(0).toUpperCase() + slug.slice(1)
  },

  // Get location-specific URL
  getLocationUrl: (locationSlug: string, path: string = '') => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `/${locationSlug}${cleanPath ? `/${cleanPath}` : ''}`
  },
} 