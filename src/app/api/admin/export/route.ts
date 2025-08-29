import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { prisma } from '../../../../lib/prisma'
import { AdminRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access export functionality' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to access export functionality' },
        { status: 403 }
      )
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log the export access attempt
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'READ',
        resource: 'export_functionality',
        details: {
          action: 'export_access_attempt',
          message: 'Export functionality is not available - patient intake system removed',
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({
      message: 'Export functionality is not available',
      details: 'Patient intake system has been removed. No data is available for export.',
      available: false
    })

  } catch (error) {
    console.error('Export API error:', error)
    
    // Log the error
    try {
      const session = await getServerSession(authOptions)
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'ERROR',
          resource: 'export_functionality',
          details: {
            error: 'export_api_error',
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
        message: 'Failed to process export request. Please try again or contact support.'
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