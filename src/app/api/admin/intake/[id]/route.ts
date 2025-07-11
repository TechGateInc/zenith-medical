import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { decryptPatientData } from '../../../../../lib/utils/encryption'
import { AdminRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access intake submissions' },
        { status: 401 }
      )
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Fetch the specific intake submission
    const intakeSubmission = await prisma.patientIntake.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        legalFirstName: true,
        legalLastName: true,
        preferredName: true,
        dateOfBirth: true,
        phoneNumber: true,
        emailAddress: true,
        streetAddress: true,
        city: true,
        provinceState: true,
        postalZipCode: true,
        nextOfKinName: true,
        nextOfKinPhone: true,
        relationshipToPatient: true,
        status: true,
        appointmentBooked: true,
        appointmentBookedAt: true,
        privacyPolicyAccepted: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
        healthInformationNumber: true
      }
    })

    if (!intakeSubmission) {
      return NextResponse.json(
        { error: 'Not found', message: 'Intake submission not found' },
        { status: 404 }
      )
    }

    // Decrypt all patient data for detailed view
    try {
      const decryptedData = decryptPatientData({
        legalFirstName: intakeSubmission.legalFirstName,
        legalLastName: intakeSubmission.legalLastName,
        preferredName: intakeSubmission.preferredName || '',
        dateOfBirth: intakeSubmission.dateOfBirth,
        phoneNumber: intakeSubmission.phoneNumber,
        emailAddress: intakeSubmission.emailAddress,
        streetAddress: intakeSubmission.streetAddress,
        city: intakeSubmission.city,
        provinceState: intakeSubmission.provinceState,
        postalZipCode: intakeSubmission.postalZipCode,
        nextOfKinName: intakeSubmission.nextOfKinName,
        nextOfKinPhone: intakeSubmission.nextOfKinPhone,
        relationshipToPatient: intakeSubmission.relationshipToPatient,
        healthInformationNumber: intakeSubmission.healthInformationNumber
      })

      const fullSubmission = {
        id: intakeSubmission.id,
        legalFirstName: decryptedData.legalFirstName,
        legalLastName: decryptedData.legalLastName,
        preferredName: decryptedData.preferredName || undefined,
        dateOfBirth: decryptedData.dateOfBirth,
        phoneNumber: decryptedData.phoneNumber,
        emailAddress: decryptedData.emailAddress,
        streetAddress: decryptedData.streetAddress,
        city: decryptedData.city,
        provinceState: decryptedData.provinceState,
        postalZipCode: decryptedData.postalZipCode,
        nextOfKinName: decryptedData.nextOfKinName,
        nextOfKinPhone: decryptedData.nextOfKinPhone,
        relationshipToPatient: decryptedData.relationshipToPatient,
        status: intakeSubmission.status,
        appointmentBooked: intakeSubmission.appointmentBooked,
        appointmentBookedAt: intakeSubmission.appointmentBookedAt?.toISOString(),
        privacyPolicyAccepted: intakeSubmission.privacyPolicyAccepted,
        createdAt: intakeSubmission.createdAt.toISOString(),
        updatedAt: intakeSubmission.updatedAt.toISOString(),
        ipAddress: intakeSubmission.ipAddress,
        userAgent: intakeSubmission.userAgent,
        healthInformationNumber: decryptedData.healthInformationNumber
      }

      // Log successful access
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'READ',
          resource: 'patient_intake',
          resourceId: submissionId,
          details: {
            action: 'view_submission_details',
            timestamp: new Date().toISOString()
          },
          ipAddress,
          userAgent
        }
      })

      return NextResponse.json({
        submission: fullSubmission
      })

    } catch (decryptionError) {
      console.error('Decryption error for submission:', submissionId, decryptionError)
      
      // Log decryption error
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'ERROR',
          resource: 'patient_intake',
          resourceId: submissionId,
          details: {
            error: 'decryption_failed',
            timestamp: new Date().toISOString()
          },
          ipAddress,
          userAgent
        }
      })

      return NextResponse.json(
        { 
          error: 'Data access error',
          message: 'Unable to decrypt patient data. Please contact system administrator.'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Intake detail API error:', error)
    
    // Log the error
    try {
      const session = await getServerSession(authOptions)
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'ERROR',
          resource: 'patient_intake',
          resourceId: submissionId,
          details: {
            error: 'intake_detail_api_error',
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
        message: 'Failed to load submission details. Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to update intake submissions' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to update intake submissions' },
        { status: 403 }
      )
    }
    const body = await request.json()

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Validate the update request
    const updates: any = {}
    
    if (body.status && ['SUBMITTED', 'REVIEWED', 'APPOINTMENT_SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].includes(body.status)) {
      updates.status = body.status
    }
    
    if (typeof body.appointmentBooked === 'boolean') {
      updates.appointmentBooked = body.appointmentBooked
      if (body.appointmentBooked) {
        updates.appointmentBookedAt = new Date()
        // Automatically set status to APPOINTMENT_SCHEDULED if not already set
        if (!updates.status) {
          updates.status = 'APPOINTMENT_SCHEDULED'
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the submission
    const updatedSubmission = await prisma.patientIntake.update({
      where: { id: submissionId },
      data: updates,
      select: {
        id: true,
        legalFirstName: true,
        legalLastName: true,
        preferredName: true,
        dateOfBirth: true,
        phoneNumber: true,
        emailAddress: true,
        streetAddress: true,
        city: true,
        provinceState: true,
        postalZipCode: true,
        nextOfKinName: true,
        nextOfKinPhone: true,
        relationshipToPatient: true,
        status: true,
        appointmentBooked: true,
        appointmentBookedAt: true,
        privacyPolicyAccepted: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
        healthInformationNumber: true
      }
    })

    // Decrypt the updated data for response
    const decryptedData = decryptPatientData({
      legalFirstName: updatedSubmission.legalFirstName,
      legalLastName: updatedSubmission.legalLastName,
      preferredName: updatedSubmission.preferredName || '',
      dateOfBirth: updatedSubmission.dateOfBirth,
      phoneNumber: updatedSubmission.phoneNumber,
      emailAddress: updatedSubmission.emailAddress,
      streetAddress: updatedSubmission.streetAddress,
      city: updatedSubmission.city,
      provinceState: updatedSubmission.provinceState,
      postalZipCode: updatedSubmission.postalZipCode,
      nextOfKinName: updatedSubmission.nextOfKinName,
      nextOfKinPhone: updatedSubmission.nextOfKinPhone,
      relationshipToPatient: updatedSubmission.relationshipToPatient,
      healthInformationNumber: updatedSubmission.healthInformationNumber
    })

    const fullSubmission = {
      id: updatedSubmission.id,
      legalFirstName: decryptedData.legalFirstName,
      legalLastName: decryptedData.legalLastName,
      preferredName: decryptedData.preferredName || undefined,
      dateOfBirth: decryptedData.dateOfBirth,
      phoneNumber: decryptedData.phoneNumber,
      emailAddress: decryptedData.emailAddress,
      streetAddress: decryptedData.streetAddress,
      city: decryptedData.city,
      provinceState: decryptedData.provinceState,
      postalZipCode: decryptedData.postalZipCode,
      nextOfKinName: decryptedData.nextOfKinName,
      nextOfKinPhone: decryptedData.nextOfKinPhone,
      relationshipToPatient: decryptedData.relationshipToPatient,
      status: updatedSubmission.status,
      appointmentBooked: updatedSubmission.appointmentBooked,
      appointmentBookedAt: updatedSubmission.appointmentBookedAt?.toISOString(),
      privacyPolicyAccepted: updatedSubmission.privacyPolicyAccepted,
      createdAt: updatedSubmission.createdAt.toISOString(),
      updatedAt: updatedSubmission.updatedAt.toISOString(),
      ipAddress: updatedSubmission.ipAddress,
      userAgent: updatedSubmission.userAgent,
      healthInformationNumber: decryptedData.healthInformationNumber
    }

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'patient_intake',
        resourceId: submissionId,
        details: {
          action: 'update_submission_status',
          changes: updates,
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({
      submission: fullSubmission,
      message: 'Submission updated successfully'
    })

  } catch (error) {
    console.error('Intake update API error:', error)
    
    // Log the error
    try {
      const session = await getServerSession(authOptions)
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'ERROR',
          resource: 'patient_intake',
          resourceId: submissionId,
          details: {
            error: 'intake_update_api_error',
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
        message: 'Failed to update submission. Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET and PATCH requests are accepted' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET and PATCH requests are accepted' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only GET and PATCH requests are accepted' },
    { status: 405 }
  )
} 