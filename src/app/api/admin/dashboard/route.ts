import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access the dashboard' },
        { status: 401 }
      )
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log dashboard access
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'READ',
        resource: 'admin_dashboard',
        details: {
          action: 'dashboard_access',
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })

    // Calculate dashboard statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const stats = {
      totalSubmissions: 0,
      pendingReview: 0,
      appointmentsScheduled: 0,
      completedToday: 0
    }

    return NextResponse.json({
      submissions: [],
      stats
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Log the error
    try {
      const session = await getServerSession(authOptions)
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'ERROR',
          resource: 'admin_dashboard',
          details: {
            error: 'dashboard_api_error',
            errorMessage: error instanceof Error ? error.message : 'unknown',
            timestamp: new Date().toISOString()
          },
          ipAddress,
          userAgent
        }
      })
    } catch (auditError) {
      console.error('Failed to log audit entry:', auditError)
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to load dashboard data. Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET requests are accepted' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET requests are accepted' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET requests are accepted' },
    { status: 405 }
  )
} 