import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { appointmentBookingService } from '../../../../lib/integrations/appointment-booking'
import { notificationScheduler } from '../../../../lib/integrations/notification-scheduler'
import { prisma } from '../../../../lib/prisma'
import { auditLog } from '../../../../lib/audit/audit-logger'
import { z } from 'zod'

// Validation schema
const bookAppointmentSchema = z.object({
  patientIntakeId: z.string().optional(),
  patientName: z.string().min(1, 'Patient name is required'),
  patientEmail: z.string().email('Valid email is required'),
  patientPhone: z.string().min(1, 'Phone number is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  appointmentType: z.string().default('Consultation'),
  notes: z.string().optional(),
  preferredProvider: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validate request body
    const validatedData = bookAppointmentSchema.parse(body)
    
    // Check if patient intake exists
    let patientIntake = null
    if (validatedData.patientIntakeId) {
      patientIntake = await prisma.patientIntake.findUnique({
        where: { id: validatedData.patientIntakeId }
      })
      
      if (!patientIntake) {
        return NextResponse.json({
          success: false,
          error: 'Patient intake not found'
        }, { status: 404 })
      }
    }
    
    // Set preferred provider if specified
    if (validatedData.preferredProvider) {
      const success = appointmentBookingService.setActiveProvider(validatedData.preferredProvider)
      if (!success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid booking provider specified'
        }, { status: 400 })
      }
    }
    
    // Check if booking provider is configured
    const activeProvider = appointmentBookingService.getActiveProvider()
    if (!activeProvider) {
      return NextResponse.json({
        success: false,
        error: 'No booking provider configured. Please contact the clinic to schedule your appointment.',
        fallbackMessage: 'Please call (555) 123-4567 to schedule your appointment.'
      }, { status: 503 })
    }
    
    // Create appointment through booking service
    const bookingResult = await appointmentBookingService.createAppointment({
      patientId: patientIntake?.id,
      intakeSubmissionId: validatedData.patientIntakeId,
      patientName: validatedData.patientName,
      patientEmail: validatedData.patientEmail,
      patientPhone: validatedData.patientPhone,
      appointmentDate: validatedData.appointmentDate,
      appointmentTime: validatedData.appointmentTime,
      appointmentType: validatedData.appointmentType,
      notes: validatedData.notes,
      status: 'scheduled'
    }, session?.user?.id)
    
    if (!bookingResult.success) {
      return NextResponse.json({
        success: false,
        error: bookingResult.error || 'Failed to book appointment',
        fallbackMessage: 'Please call (555) 123-4567 to schedule your appointment.'
      }, { status: 500 })
    }
    
    // Store appointment in database
    const appointmentData: any = {
      patientIntakeId: validatedData.patientIntakeId,
      providerType: activeProvider.type,
      providerAppointmentId: bookingResult.appointmentId,
      providerName: activeProvider.name,
      patientName: validatedData.patientName,
      patientEmail: validatedData.patientEmail,
      patientPhone: validatedData.patientPhone,
      appointmentDate: validatedData.appointmentDate,
      appointmentTime: validatedData.appointmentTime,
      appointmentType: validatedData.appointmentType,
      status: 'scheduled',
      notes: validatedData.notes,
      bookingUrl: bookingResult.bookingUrl,
      metadata: bookingResult.metadata as any
    }

    // Add OSCAR-specific fields if using OSCAR provider
    if (activeProvider.type === 'oscar' && bookingResult.metadata) {
      appointmentData.oscarAppointmentId = bookingResult.metadata.oscarAppointmentId
      appointmentData.oscarProviderNo = bookingResult.metadata.oscarProviderNo
      appointmentData.oscarCreatedAt = new Date()
      appointmentData.oscarLastSyncAt = new Date()
    }

    const appointment = await prisma.appointment.create({
      data: appointmentData
    })
    
    // Update patient intake status if linked
    if (patientIntake) {
      await prisma.patientIntake.update({
        where: { id: patientIntake.id },
        data: {
          appointmentBooked: true,
          appointmentBookedAt: new Date(),
          status: 'APPOINTMENT_SCHEDULED'
        }
      })
    }

    // Schedule notifications for this appointment
    try {
      await notificationScheduler.scheduleAppointmentNotifications(appointment.id)
    } catch (notificationError) {
      console.error('Failed to schedule notifications:', notificationError)
      // Don't fail the appointment booking if notifications fail
    }
    
    // Audit log with OSCAR-specific details
    const auditDetails: any = {
      patientName: validatedData.patientName,
      appointmentDate: validatedData.appointmentDate,
      appointmentTime: validatedData.appointmentTime,
      provider: activeProvider.name,
      providerAppointmentId: bookingResult.appointmentId
    }

    // Add OSCAR-specific audit details
    if (activeProvider.type === 'oscar' && bookingResult.metadata) {
      auditDetails.oscarAppointmentId = bookingResult.metadata.oscarAppointmentId
      auditDetails.oscarProviderNo = bookingResult.metadata.oscarProviderNo
      auditDetails.demographicNo = bookingResult.metadata.demographicNo
      auditDetails.providerName = bookingResult.metadata.providerName
      auditDetails.integrationType = 'OSCAR_EMR'
    }

    await auditLog({
      action: 'APPOINTMENT_BOOKED',
      userId: session?.user?.id || 'anonymous',
      userEmail: validatedData.patientEmail,
      resource: 'appointment',
      resourceId: appointment.id,
      details: auditDetails,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    // Build response with OSCAR-specific information if applicable
    const responseData: any = {
      success: true,
      appointment: {
        id: appointment.id,
        appointmentId: bookingResult.appointmentId,
        appointmentDate: validatedData.appointmentDate,
        appointmentTime: validatedData.appointmentTime,
        provider: activeProvider.name
      },
      redirectUrl: bookingResult.redirectUrl,
      bookingUrl: bookingResult.bookingUrl,
      message: 'Appointment booked successfully!'
    }

    // Add OSCAR-specific response details
    if (activeProvider.type === 'oscar' && bookingResult.metadata) {
      responseData.oscar = {
        appointmentId: bookingResult.metadata.oscarAppointmentId,
        providerNo: bookingResult.metadata.oscarProviderNo,
        providerName: bookingResult.metadata.providerName,
        demographicNo: bookingResult.metadata.demographicNo,
        appointmentDate: bookingResult.metadata.appointmentDate,
        startTime: bookingResult.metadata.startTime,
        endTime: bookingResult.metadata.endTime
      }
      responseData.message = 'Appointment booked successfully in OSCAR EMR!'
    }

    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Appointment booking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to book appointment',
      fallbackMessage: 'Please call (555) 123-4567 to schedule your appointment.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated admin users to list appointments
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const patientEmail = searchParams.get('patientEmail')
    const providerType = searchParams.get('providerType')
    
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (patientEmail) {
      where.patientEmail = {
        contains: patientEmail,
        mode: 'insensitive'
      }
    }
    
    if (providerType) {
      where.providerType = providerType
    }
    
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patientIntake: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appointments'
    }, { status: 500 })
  }
} 