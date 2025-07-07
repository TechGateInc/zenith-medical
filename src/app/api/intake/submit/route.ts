import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateIntakeForm } from '../../../../lib/utils/validation'
import { encryptPatientData } from '../../../../lib/utils/encryption'
import { headers } from 'next/headers'
import { 
  sendPatientConfirmationEmail, 
  sendStaffNotificationEmail,
  type PatientConfirmationData,
  type StaffNotificationData
} from '../../../../lib/notifications/email'

// Initialize Prisma client
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Get client information for audit logging
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    
    // Validate the form data
    const validation = validateIntakeForm(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Please correct the errors in your form',
          details: validation.errors 
        }, 
        { status: 400 }
      )
    }
    
    // Extract the form data
    const {
      legalFirstName,
      legalLastName,
      preferredName,
      dateOfBirth,
      phoneNumber,
      emailAddress,
      streetAddress,
      city,
      provinceState,
      postalZipCode,
      emergencyContactName,
      emergencyContactPhone,
      relationshipToPatient,
      privacyPolicyAgreed
    } = body
    
    // Ensure privacy policy is agreed to
    if (!privacyPolicyAgreed) {
      return NextResponse.json(
        { 
          error: 'Privacy policy not accepted',
          message: 'You must agree to the Privacy & Data-Use Policy to submit this form'
        }, 
        { status: 400 }
      )
    }
    
    // Encrypt all PHI data
    const encryptedData = await encryptPatientData({
      legalFirstName,
      legalLastName,
      preferredName: preferredName || '',
      dateOfBirth,
      phoneNumber,
      emailAddress,
      streetAddress,
      city,
      provinceState,
      postalZipCode,
      emergencyContactName,
      emergencyContactPhone,
      relationshipToPatient
    })
    
    // Create the patient intake record
    const patientIntake = await prisma.patientIntake.create({
      data: {
        legalFirstName: encryptedData.legalFirstName,
        legalLastName: encryptedData.legalLastName,
        preferredName: encryptedData.preferredName || null,
        dateOfBirth: encryptedData.dateOfBirth,
        phoneNumber: encryptedData.phoneNumber,
        emailAddress: encryptedData.emailAddress,
        streetAddress: encryptedData.streetAddress,
        city: encryptedData.city,
        provinceState: encryptedData.provinceState,
        postalZipCode: encryptedData.postalZipCode,
        emergencyContactName: encryptedData.emergencyContactName,
        emergencyContactPhone: encryptedData.emergencyContactPhone,
        relationshipToPatient: encryptedData.relationshipToPatient,
        privacyPolicyAccepted: privacyPolicyAgreed,
        status: 'SUBMITTED',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resource: 'patient_intake',
        resourceId: patientIntake.id,
        details: {
          submissionMethod: 'online_form',
          privacyPolicyAccepted: privacyPolicyAgreed,
          hasPreferredName: !!preferredName,
          submissionTimestamp: new Date().toISOString()
        },
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })
    
    // Send email notifications (don't let email failures break the submission)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.com'
      const patientName = preferredName || legalFirstName
      
      // Send patient confirmation email
      const patientConfirmationData: PatientConfirmationData = {
        patientName,
        submissionId: patientIntake.id,
        submissionDate: patientIntake.createdAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        appointmentBookingUrl: `${baseUrl}/contact?booking=true&submission=${patientIntake.id}`
      }
      
      const patientEmailResult = await sendPatientConfirmationEmail(
        emailAddress,
        patientConfirmationData
      )
      
      // Send staff notification email
      const staffNotificationData: StaffNotificationData = {
        submissionId: patientIntake.id,
        submissionDate: patientIntake.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        submissionTime: patientIntake.createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        patientEmail: emailAddress,
        hasPreferredName: !!preferredName,
        dashboardUrl: `${baseUrl}/admin/dashboard/intake/${patientIntake.id}`
      }
      
      const staffEmailResult = await sendStaffNotificationEmail(staffNotificationData)
      
      // Log email sending results
      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_NOTIFICATION',
          resource: 'patient_intake',
          resourceId: patientIntake.id,
          details: {
            patientEmailSent: patientEmailResult.success,
            patientEmailId: patientEmailResult.messageId,
            staffEmailSent: staffEmailResult.success,
            staffEmailId: staffEmailResult.messageId,
            timestamp: new Date().toISOString()
          },
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      })
      
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      
      // Log email failure but don't fail the submission
      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_ERROR',
          resource: 'patient_intake',
          resourceId: patientIntake.id,
          details: {
            error: 'email_notification_failed',
            errorMessage: emailError instanceof Error ? emailError.message : 'unknown',
            timestamp: new Date().toISOString()
          },
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      })
    }
    
    // Return success response with submission ID
    return NextResponse.json({
      success: true,
      message: 'Patient intake form submitted successfully',
      submissionId: patientIntake.id,
      status: patientIntake.status,
      submittedAt: patientIntake.createdAt
    }, { status: 201 })
    
  } catch (error) {
    console.error('Intake submission error:', error)
    
    // Log the error for audit purposes (without sensitive data)
    try {
      const headersList = headers()
      const ipAddress = headersList.get('x-forwarded-for') || 
                       headersList.get('x-real-ip') || 
                       'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'
      
      await prisma.auditLog.create({
        data: {
          action: 'ERROR',
          resource: 'patient_intake',
          details: {
            error: 'submission_failed',
            errorType: error instanceof Error ? error.name : 'unknown',
            timestamp: new Date().toISOString()
          },
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      })
    } catch (auditError) {
      console.error('Failed to log audit entry:', auditError)
    }
    
    // Return generic error to client
    return NextResponse.json(
      { 
        error: 'Submission failed',
        message: 'An error occurred while processing your submission. Please try again or contact support if the problem persists.',
        supportContact: '(555) 123-CARE'
      }, 
      { status: 500 }
    )
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect()
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  )
} 