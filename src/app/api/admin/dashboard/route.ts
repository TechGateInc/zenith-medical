import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { prisma } from '../../../../lib/database/connection'
import { decryptPatientData } from '../../../../lib/utils/encryption'
import { AdminRole } from '../../../../generated/prisma'

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

    // Fetch recent intake submissions (last 50)
    const intakeSubmissions = await prisma.patientIntake.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        legalFirstName: true,
        legalLastName: true,
        preferredName: true,
        emailAddress: true,
        phoneNumber: true,
        status: true,
        appointmentBooked: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Decrypt patient data for display
    const decryptedSubmissions = intakeSubmissions.map((submission) => {
      try {
        const decryptedData = decryptPatientData({
          legalFirstName: submission.legalFirstName,
          legalLastName: submission.legalLastName,
          preferredName: submission.preferredName || '',
          emailAddress: submission.emailAddress,
          phoneNumber: submission.phoneNumber,
          // Only decrypt what we need for the dashboard
          dateOfBirth: '',
          streetAddress: '',
          city: '',
          provinceState: '',
          postalZipCode: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          relationshipToPatient: ''
        })

          return {
            id: submission.id,
            legalFirstName: decryptedData.legalFirstName,
            legalLastName: decryptedData.legalLastName,
            preferredName: decryptedData.preferredName || undefined,
            emailAddress: decryptedData.emailAddress,
            phoneNumber: decryptedData.phoneNumber,
            status: submission.status,
            appointmentBooked: submission.appointmentBooked,
            createdAt: submission.createdAt.toISOString(),
            updatedAt: submission.updatedAt.toISOString()
          }
        } catch (decryptionError) {
          console.error('Decryption error for submission:', submission.id, decryptionError)
          
          // Log decryption error (but don't await since we're not in async context)
          prisma.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'ERROR',
              resource: 'patient_intake',
              resourceId: submission.id,
              details: {
                error: 'decryption_failed',
                timestamp: new Date().toISOString()
              },
              ipAddress,
              userAgent
            }
          }).catch(console.error)

          // Return partial data without decryption
          return {
            id: submission.id,
            legalFirstName: 'Decryption Failed',
            legalLastName: '',
            emailAddress: 'Decryption Failed',
            phoneNumber: 'Decryption Failed',
            status: submission.status,
            appointmentBooked: submission.appointmentBooked,
            createdAt: submission.createdAt.toISOString(),
            updatedAt: submission.updatedAt.toISOString()
          }
        }
      })

    // Calculate dashboard statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalSubmissions,
      pendingReview,
      appointmentsScheduled,
      completedToday
    ] = await Promise.all([
      prisma.patientIntake.count(),
      prisma.patientIntake.count({
        where: { status: 'SUBMITTED' }
      }),
      prisma.patientIntake.count({
        where: { status: 'APPOINTMENT_SCHEDULED' }
      }),
      prisma.patientIntake.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    const stats = {
      totalSubmissions,
      pendingReview,
      appointmentsScheduled,
      completedToday
    }

    // Log successful data access
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'READ',
        resource: 'patient_intake',
        details: {
          action: 'dashboard_data_accessed',
          submissionsCount: decryptedSubmissions.length,
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({
      submissions: decryptedSubmissions,
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