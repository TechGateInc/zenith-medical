import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { AdminRole } from './generated/prisma'

export default withAuth(
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

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
} 