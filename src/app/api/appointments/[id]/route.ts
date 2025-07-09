import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { prisma } from '../../../../lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/appointments/[id] - Get specific appointment details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Appointment ID is required'
      }, { status: 400 })
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patientIntake: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 })
    }

    // Only allow access if:
    // 1. User is an admin/staff member, or
    // 2. The appointment belongs to the requester (based on email)
    const requestEmail = request.headers.get('x-patient-email') || 
                        session?.user?.email
    
    const isAuthorized = session?.user?.role && 
                        ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role) ||
                        appointment.patientEmail === requestEmail ||
                        appointment.patientIntake?.email === requestEmail

    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to appointment details'
      }, { status: 403 })
    }

    // Return appointment details (sanitized for patient view)
    const appointmentDetails = {
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      appointmentType: appointment.appointmentType,
      provider: appointment.providerName,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      // Include admin-only fields if user is admin
      ...(session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role) && {
        providerType: appointment.providerType,
        providerAppointmentId: appointment.providerAppointmentId,
        bookingUrl: appointment.bookingUrl,
        metadata: appointment.metadata,
        patientIntakeId: appointment.patientIntakeId
      })
    }

    return NextResponse.json({
      success: true,
      appointment: appointmentDetails
    })

  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appointment details'
    }, { status: 500 })
  }
}

// PATCH /api/appointments/[id] - Update appointment (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to update appointments
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes, appointmentDate, appointmentTime } = body

    // Find the appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 })
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(appointmentDate && { appointmentDate }),
        ...(appointmentTime && { appointmentTime }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        appointmentDate: updatedAppointment.appointmentDate,
        appointmentTime: updatedAppointment.appointmentTime,
        notes: updatedAppointment.notes,
        updatedAt: updatedAppointment.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update appointment'
    }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    // Allow both admin users and patients to cancel appointments
    const requestEmail = request.headers.get('x-patient-email') || 
                        session?.user?.email

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 })
    }

    // Check authorization
    const isAuthorized = session?.user?.role && 
                        ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role) ||
                        appointment.patientEmail === requestEmail

    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to cancel this appointment'
      }, { status: 403 })
    }

    // Update appointment status to cancelled instead of deleting
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        id: cancelledAppointment.id,
        status: cancelledAppointment.status
      }
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel appointment'
    }, { status: 500 })
  }
} 