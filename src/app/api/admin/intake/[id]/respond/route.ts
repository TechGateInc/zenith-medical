/**
 * Patient Response API - Send email response to patient
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AdminRole } from '@prisma/client'
import { sendPatientResponseEmail } from '@/lib/notifications/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to send patient responses' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to send patient responses' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { subject, message, patientEmail, patientName } = body

    // Validate required fields
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Message is required' },
        { status: 400 }
      )
    }

    if (!patientEmail || !patientName) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Patient email and name are required' },
        { status: 400 }
      )
    }

    // Send the response email
    const emailResult = await sendPatientResponseEmail({
      patientEmail,
      patientName,
      subject: subject || 'Response from Zenith Medical Centre',
      message,
      adminName: session.user.name,
      submissionId
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Email failed', message: emailResult.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Response sent successfully to patient'
    })

  } catch (error) {
    console.error('Error sending patient response:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to send response. Please try again later.' 
      },
      { status: 500 }
    )
  }
}