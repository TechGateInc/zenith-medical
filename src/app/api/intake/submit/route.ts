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
import { oscarPatientService, DuplicateScenario } from '../../../../lib/integrations/oscar-patient-service'
import { OscarPatientMapper } from '../../../../lib/integrations/oscar-patient-mapping'
import { OscarError, OscarErrorHandler } from '../../../../lib/integrations/oscar-errors'

// Initialize Prisma client
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Get client information for audit logging
    const headersList = await headers()
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
      middleName,
      preferredName,
      title,
      dateOfBirth,
      gender,
      phoneNumber,
      cellPhone,
      workPhone,
      emailAddress,
      streetAddress,
      city,
      provinceState,
      postalZipCode,
      nextOfKinName,
      nextOfKinPhone,
      relationshipToPatient,
      primaryLanguage,
      preferredLanguage,
      newsletterOptIn,
      privacyPolicyAgreed,
      healthInformationNumber
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
      middleName: middleName || '',
      preferredName: preferredName || '',
      title: title || '',
      dateOfBirth,
      gender: gender || '',
      phoneNumber,
      cellPhone: cellPhone || '',
      workPhone: workPhone || '',
      emailAddress,
      streetAddress,
      city,
      provinceState,
      postalZipCode,
      nextOfKinName,
      nextOfKinPhone,
      relationshipToPatient,
      primaryLanguage: primaryLanguage || '',
      preferredLanguage: preferredLanguage || '',
      healthInformationNumber
    })
    
    // Create the patient intake record
    const patientIntake = await prisma.patientIntake.create({
      data: {
        legalFirstName: encryptedData.legalFirstName,
        legalLastName: encryptedData.legalLastName,
        middleName: encryptedData.middleName || null,
        preferredName: encryptedData.preferredName || null,
        title: encryptedData.title || null,
        dateOfBirth: encryptedData.dateOfBirth,
        gender: encryptedData.gender || null,
        phoneNumber: encryptedData.phoneNumber,
        cellPhone: encryptedData.cellPhone || null,
        workPhone: encryptedData.workPhone || null,
        emailAddress: encryptedData.emailAddress,
        streetAddress: encryptedData.streetAddress,
        city: encryptedData.city,
        provinceState: encryptedData.provinceState,
        postalZipCode: encryptedData.postalZipCode,
        nextOfKinName: encryptedData.nextOfKinName,
        nextOfKinPhone: encryptedData.nextOfKinPhone,
        relationshipToPatient: encryptedData.relationshipToPatient,
        primaryLanguage: encryptedData.primaryLanguage || null,
        preferredLanguage: encryptedData.preferredLanguage || null,
        newsletterOptIn: newsletterOptIn || false,
        privacyPolicyAccepted: privacyPolicyAgreed,
        status: 'SUBMITTED',
        ipAddress: ipAddress,
        userAgent: userAgent,
        healthInformationNumber: encryptedData.healthInformationNumber
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
    
    // OSCAR Integration - Create patient in OSCAR EMR system
    let oscarIntegrationResult = {
      attempted: false,
      success: false,
      demographicNo: null as string | null,
      duplicateScenario: null as string | null,
      error: null as string | null
    }
    
    try {
      // Check if OSCAR integration is enabled
      if (process.env.OSCAR_BASE_URL && process.env.OSCAR_CONSUMER_KEY) {
        oscarIntegrationResult.attempted = true
        
        // Decrypt patient data for OSCAR processing
        const decryptedIntake = {
          ...patientIntake,
          legalFirstName,
          legalLastName,
          middleName: middleName || null,
          preferredName: preferredName || null,
          title: title || null,
          dateOfBirth,
          gender: gender || null,
          phoneNumber,
          cellPhone: cellPhone || null,
          workPhone: workPhone || null,
          emailAddress,
          streetAddress,
          city,
          provinceState,
          postalZipCode,
          nextOfKinName,
          nextOfKinPhone,
          relationshipToPatient,
          primaryLanguage: primaryLanguage || null,
          preferredLanguage: preferredLanguage || null,
          newsletterOptIn: newsletterOptIn || false,
          healthInformationNumber
        }
        
        // Detect duplicates first
        const duplicateResult = await oscarPatientService.detectDuplicates(decryptedIntake)
        oscarIntegrationResult.duplicateScenario = duplicateResult.scenario
        
        // Handle different duplicate scenarios
        switch (duplicateResult.scenario) {
          case DuplicateScenario.EXACT_MATCH:
            // Link to existing patient
            if (duplicateResult.existingPatients.length > 0) {
              const existingPatient = duplicateResult.existingPatients[0]
              await prisma.patientIntake.update({
                where: { id: patientIntake.id },
                data: {
                  oscarDemographicNo: existingPatient.demographicNo,
                  oscarCreatedAt: new Date(), // When we linked it
                  oscarLastSyncAt: new Date()
                }
              })
              oscarIntegrationResult.success = true
              oscarIntegrationResult.demographicNo = existingPatient.demographicNo
            }
            break
            
          case DuplicateScenario.NO_MATCH:
            // Safe to create new patient
            const creationResult = await oscarPatientService.createPatient(decryptedIntake)
            if (creationResult.success) {
              await prisma.patientIntake.update({
                where: { id: patientIntake.id },
                data: {
                  oscarDemographicNo: creationResult.demographicNo,
                  oscarCreatedAt: new Date(),
                  oscarLastSyncAt: new Date()
                }
              })
              oscarIntegrationResult.success = true
              oscarIntegrationResult.demographicNo = creationResult.demographicNo || null
            } else {
              oscarIntegrationResult.error = creationResult.errors?.join(', ') || 'Unknown creation error'
            }
            break
            
          case DuplicateScenario.SIMILAR_MATCH:
          case DuplicateScenario.HEALTH_NUMBER_CONFLICT:
          case DuplicateScenario.NAME_MISMATCH:
            // Requires manual review - don't create automatically
            oscarIntegrationResult.error = `Manual review required: ${duplicateResult.reasoning}`
            break
        }
        
        // Log OSCAR integration attempt
        await prisma.auditLog.create({
          data: {
            action: 'OSCAR_INTEGRATION',
            resource: 'patient_intake',
            resourceId: patientIntake.id,
            details: {
              attempted: oscarIntegrationResult.attempted,
              success: oscarIntegrationResult.success,
              duplicateScenario: oscarIntegrationResult.duplicateScenario,
              demographicNo: oscarIntegrationResult.demographicNo,
              error: oscarIntegrationResult.error,
              duplicateCount: duplicateResult.existingPatients.length,
              confidence: duplicateResult.confidence,
              recommendedAction: duplicateResult.recommendedAction,
              timestamp: new Date().toISOString()
            },
            ipAddress: ipAddress,
            userAgent: userAgent
          }
        })
      }
    } catch (oscarError) {
      // Log OSCAR integration error but don't fail the submission
      const errorMessage = oscarError instanceof OscarError 
        ? OscarErrorHandler.getUserMessage(oscarError)
        : (oscarError instanceof Error ? oscarError.message : 'Unknown OSCAR error')
      
      oscarIntegrationResult.error = errorMessage
      
      await prisma.auditLog.create({
        data: {
          action: 'OSCAR_INTEGRATION_ERROR',
          resource: 'patient_intake',
          resourceId: patientIntake.id,
          details: {
            error: errorMessage,
            errorType: oscarError instanceof Error ? oscarError.name : 'unknown',
            timestamp: new Date().toISOString()
          },
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      })
    }
    
    // Send email notifications (don't let email failures break the submission)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zenithmedical.ca'
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
      submittedAt: patientIntake.createdAt,
      oscarIntegration: {
        attempted: oscarIntegrationResult.attempted,
        success: oscarIntegrationResult.success,
        demographicNo: oscarIntegrationResult.demographicNo,
        status: oscarIntegrationResult.success 
          ? 'Successfully integrated with OSCAR EMR'
          : oscarIntegrationResult.error 
            ? 'OSCAR integration requires manual review'
            : 'OSCAR integration not configured'
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Intake submission error:', error)
    
    // Log the error for audit purposes (without sensitive data)
    try {
      const headersList = await headers()
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