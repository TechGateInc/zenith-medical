import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { prisma } from '../../../../lib/prisma'
import { decryptPatientData } from '../../../../lib/utils/encryption'
import { AdminRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to export data' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions (editors cannot export patient data)
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to export patient data' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Validate format
    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format', message: 'Format must be csv or pdf' },
        { status: 400 }
      )
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (status && ['SUBMITTED', 'REVIEWED', 'APPOINTMENT_SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].includes(status)) {
      whereClause.status = status
    }
    
    if (startDate) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        gte: new Date(startDate)
      }
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999) // End of day
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        lte: endDateTime
      }
    }

    // Fetch intake submissions
    const intakeSubmissions = await prisma.patientIntake.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
        healthInformationNumber: true
      }
    })

    // Decrypt patient data for export
    const decryptedSubmissions = intakeSubmissions.map((submission: any) => {
      try {
        const decryptedData = decryptPatientData({
          legalFirstName: submission.legalFirstName,
          legalLastName: submission.legalLastName,
          preferredName: submission.preferredName || '',
          dateOfBirth: submission.dateOfBirth,
          phoneNumber: submission.phoneNumber,
          emailAddress: submission.emailAddress,
          streetAddress: submission.streetAddress,
          city: submission.city,
          provinceState: submission.provinceState,
          postalZipCode: submission.postalZipCode,
          nextOfKinName: submission.nextOfKinName,
          nextOfKinPhone: submission.nextOfKinPhone,
          relationshipToPatient: submission.relationshipToPatient,
          healthInformationNumber: submission.healthInformationNumber
        })

        return {
          id: submission.id,
          legalFirstName: decryptedData.legalFirstName,
          legalLastName: decryptedData.legalLastName,
          preferredName: decryptedData.preferredName || '',
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
          status: submission.status,
          appointmentBooked: submission.appointmentBooked ? 'Yes' : 'No',
          appointmentBookedAt: submission.appointmentBookedAt?.toISOString() || '',
          privacyPolicyAccepted: submission.privacyPolicyAccepted ? 'Yes' : 'No',
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
          healthInformationNumber: decryptedData.healthInformationNumber
        }
      } catch (decryptionError) {
        console.error('Decryption error for submission:', submission.id, decryptionError)
        
        // Return placeholder data for failed decryption
        return {
          id: submission.id,
          legalFirstName: 'DECRYPTION_FAILED',
          legalLastName: 'DECRYPTION_FAILED',
          preferredName: '',
          dateOfBirth: 'DECRYPTION_FAILED',
          phoneNumber: 'DECRYPTION_FAILED',
          emailAddress: 'DECRYPTION_FAILED',
          streetAddress: 'DECRYPTION_FAILED',
          city: 'DECRYPTION_FAILED',
          provinceState: 'DECRYPTION_FAILED',
          postalZipCode: 'DECRYPTION_FAILED',
          nextOfKinName: 'DECRYPTION_FAILED',
          nextOfKinPhone: 'DECRYPTION_FAILED',
          relationshipToPatient: 'DECRYPTION_FAILED',
          status: submission.status,
          appointmentBooked: submission.appointmentBooked ? 'Yes' : 'No',
          appointmentBookedAt: submission.appointmentBookedAt?.toISOString() || '',
          privacyPolicyAccepted: submission.privacyPolicyAccepted ? 'Yes' : 'No',
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
          healthInformationNumber: 'DECRYPTION_FAILED'
        }
      }
    })

    // Log the export action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPORT',
        resource: 'patient_intake',
        details: {
          format,
          recordCount: decryptedSubmissions.length,
          filters: {
            status,
            startDate,
            endDate
          },
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Submission ID',
        'Legal First Name',
        'Legal Last Name',
        'Preferred Name',
        'Date of Birth',
        'Phone Number',
        'Email Address',
        'Street Address',
        'City',
        'Province/State',
        'Postal/ZIP Code',
        'Next of Kin Name',
        'Next of Kin Phone',
        'Relationship to Patient',
        'Status',
        'Appointment Booked',
        'Appointment Booked At',
        'Privacy Policy Accepted',
        'Submitted At',
        'Last Updated',
        'Health Information Number'
      ]

      const csvRows = decryptedSubmissions.map((submission: any) => [
        submission.id,
        submission.legalFirstName,
        submission.legalLastName,
        submission.preferredName,
        submission.dateOfBirth,
        submission.phoneNumber,
        submission.emailAddress,
        submission.streetAddress,
        submission.city,
        submission.provinceState,
        submission.postalZipCode,
        submission.nextOfKinName,
        submission.nextOfKinPhone,
        submission.relationshipToPatient,
        submission.status,
        submission.appointmentBooked,
        submission.appointmentBookedAt,
        submission.privacyPolicyAccepted,
        submission.createdAt,
        submission.updatedAt,
        submission.healthInformationNumber
      ])

      // Escape CSV values and handle commas/quotes
      const escapeCsvValue = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any) => row.map((cell: any) => escapeCsvValue(String(cell))).join(','))
      ].join('\n')

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `zenith-medical-intake-export-${timestamp}.csv`

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

    } else if (format === 'pdf') {
      // For PDF export, we'll create a simple HTML structure that can be converted to PDF
      // In a production environment, you might want to use a library like puppeteer or jsPDF
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Zenith Medical Centre - Patient Intake Export</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
              font-size: 8px;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .status {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 7px;
            }
            .status-submitted { background-color: #fef3c7; color: #92400e; }
            .status-reviewed { background-color: #dbeafe; color: #1e40af; }
            .status-scheduled { background-color: #d1fae5; color: #065f46; }
            .status-completed { background-color: #f3f4f6; color: #374151; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 8px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Zenith Medical Centre</h1>
            <p>Patient Intake Export Report</p>
            <p>Generated on: ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>Total Records: ${decryptedSubmissions.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Contact</th>
                <th>Date of Birth</th>
                <th>Address</th>
                <th>Next of Kin</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Health Information Number</th>
              </tr>
            </thead>
            <tbody>
              ${decryptedSubmissions.map((submission: any) => `
                <tr>
                  <td>
                    ${submission.legalFirstName} ${submission.legalLastName}
                    ${submission.preferredName ? `<br/><small>(${submission.preferredName})</small>` : ''}
                  </td>
                  <td>
                    ${submission.emailAddress}<br/>
                    ${submission.phoneNumber}
                  </td>
                  <td>${submission.dateOfBirth}</td>
                  <td>
                    ${submission.streetAddress}<br/>
                    ${submission.city}, ${submission.provinceState}<br/>
                    ${submission.postalZipCode}
                  </td>
                  <td>
                    ${submission.nextOfKinName}<br/>
                    ${submission.nextOfKinPhone}<br/>
                    <small>${submission.relationshipToPatient}</small>
                  </td>
                  <td>
                    <span class="status status-${submission.status.toLowerCase().replace('_', '-')}">
                      ${submission.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    ${new Date(submission.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>${submission.healthInformationNumber}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p><strong>CONFIDENTIAL:</strong> This report contains protected health information (PHI) and must be handled in accordance with HIPAA/PIPEDA regulations.</p>
            <p>Zenith Medical Centre - Patient Intake Export - Page 1</p>
          </div>
        </body>
        </html>
      `

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `zenith-medical-intake-export-${timestamp}.html`

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid format', message: 'Unsupported export format' },
      { status: 400 }
    )

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
          resource: 'admin_export',
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
        message: 'Failed to export data. Please try again or contact support.'
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