import { getCachedContactInfo } from '@/lib/utils/address-cache'

// Email template interfaces
interface PatientConfirmationData {
  patientName: string
  submissionId: string
  submissionDate: string
}

interface StaffNotificationData {
  submissionId: string
  submissionDate: string
  submissionTime: string
  patientEmail: string
  hasPreferredName: boolean
  dashboardUrl: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Resend email sending function
const sendEmailWithResend = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<EmailResult> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@zenithmedical.ca',
        to: [to],
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Email templates
const generatePatientConfirmationTemplate = async (data: PatientConfirmationData): Promise<{ subject: string; html: string; text: string }> => {
  const subject = 'Patient Intake Form Received - Zenith Medical Centre'
  
  // Get cached contact information
  const contactInfo = await getCachedContactInfo()
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Intake Form Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f8fafc;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #1e293b;
        }
        .message {
          font-size: 16px;
          margin-bottom: 24px;
          color: #475569;
        }
        .details {
          background-color: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #475569;
        }
        .detail-value {
          color: #1e293b;
        }
        .contact-info {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .contact-info h3 {
          margin: 0 0 16px 0;
          color: #1e40af;
          font-size: 18px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .contact-item:last-child {
          margin-bottom: 0;
        }
        .contact-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          color: #3b82f6;
        }
        .footer {
          background-color: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✓ Form Received</h1>
          <p>Your patient intake form has been successfully submitted</p>
        </div>
        
        <div class="content">
          <div class="greeting">Dear ${data.patientName},</div>
          
          <div class="message">
            Thank you for submitting your patient intake form to Zenith Medical Centre. We have received your information and our team will review it shortly.
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Submission ID:</span>
              <span class="detail-value">${data.submissionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submission Date:</span>
              <span class="detail-value">${data.submissionDate}</span>
            </div>
          </div>
          
          <div class="message">
            <strong>What happens next?</strong><br>
            Our medical team will review your information and contact you within 1-2 business days to discuss next steps and schedule your appointment.
          </div>
          
          <div class="contact-info">
            <h3>📞 Contact Information</h3>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>Phone: ${contactInfo.primaryPhone || '249 806 0128'}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>Email: ${contactInfo.adminEmail || 'admin@zenithmedical.ca'}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>Address: ${contactInfo.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3'}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🕒</span>
              <span>Hours: ${contactInfo.businessHours || 'Mon-Fri 8AM-6PM, Sat 9AM-2PM'}</span>
            </div>
          </div>
          
          <div class="message">
            <strong>Emergency?</strong><br>
            If you are experiencing a medical emergency, please call 911 or visit your nearest emergency room immediately.
          </div>
        </div>
        
        <div class="footer">
          <div class="logo">Zenith Medical Centre</div>
          <p>Providing quality healthcare services to our community</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Patient Intake Form Confirmation - Zenith Medical Centre

    Dear ${data.patientName},

    Thank you for submitting your patient intake form to Zenith Medical Centre. We have received your information and our team will review it shortly.

    Submission Details:
    - Submission ID: ${data.submissionId}
    - Submission Date: ${data.submissionDate}

    What happens next?
    Our medical team will review your information and contact you within 1-2 business days to discuss next steps and schedule your appointment.

    Contact Information:
    - Phone: ${contactInfo.primaryPhone || '249 806 0128'}
    - Email: ${contactInfo.adminEmail || 'admin@zenithmedical.ca'}
    - Address: ${contactInfo.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3'}
    - Hours: ${contactInfo.businessHours || 'Mon-Fri 8AM-6PM, Sat 9AM-2PM'}

    Emergency?
    If you are experiencing a medical emergency, please call 911 or visit your nearest emergency room immediately.

    Best regards,
    Zenith Medical Centre Team
  `

  return { subject, html, text }
}

const generateStaffNotificationTemplate = (data: StaffNotificationData): { subject: string; html: string; text: string } => {
  const subject = 'New Patient Intake Form Submission - Action Required'
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Patient Intake</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #f8fafc;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #1e293b;
        }
        .message {
          font-size: 16px;
          margin-bottom: 24px;
          color: #475569;
        }
        .details {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #dc2626;
        }
        .detail-value {
          color: #1e293b;
        }
        .action-button {
          display: inline-block;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🆕 New Patient Intake</h1>
          <p>Action required - Review and process new submission</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hello Medical Team,</div>
          
          <div class="message">
            A new patient intake form has been submitted and requires your attention. Please review the details below and take appropriate action.
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Submission ID:</span>
              <span class="detail-value">${data.submissionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submission Date:</span>
              <span class="detail-value">${data.submissionDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submission Time:</span>
              <span class="detail-value">${data.submissionTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Patient Email:</span>
              <span class="detail-value">${data.patientEmail}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Has Preferred Name:</span>
              <span class="detail-value">${data.hasPreferredName ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div class="message">
            <strong>Required Action:</strong><br>
            Please review the patient intake form in the admin dashboard and contact the patient within 1-2 business days to schedule their appointment.
          </div>
          
          <a href="${data.dashboardUrl}" class="action-button">
            View in Dashboard →
          </a>
          
          <div class="message">
            <strong>Priority:</strong> Normal<br>
            <strong>Response Time:</strong> 1-2 business days
          </div>
        </div>
        
        <div class="footer">
          <div class="logo">Zenith Medical Centre</div>
          <p>Staff Notification System</p>
          <p>This is an automated notification from Zenith Medical Centre Staff System.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    New Patient Intake Form Submission - Action Required

    Hello Medical Team,

    A new patient intake form has been submitted and requires your attention. Please review the details below and take appropriate action.

    Submission Details:
    - Submission ID: ${data.submissionId}
    - Submission Date: ${data.submissionDate}
    - Submission Time: ${data.submissionTime}
    - Patient Email: ${data.patientEmail}
    - Has Preferred Name: ${data.hasPreferredName ? 'Yes' : 'No'}

    Required Action:
    Please review the patient intake form in the admin dashboard and contact the patient within 1-2 business days to schedule their appointment.

    Dashboard Link: ${data.dashboardUrl}

    Priority: Normal
    Response Time: 1-2 business days

    Best regards,
    Zenith Medical Centre Staff System
  `

  return { subject, html, text }
}

// Main email sending functions
export const sendPatientConfirmationEmail = async (
  data: PatientConfirmationData,
  patientEmail: string
): Promise<EmailResult> => {
  try {
    const template = await generatePatientConfirmationTemplate(data)
    
    return await sendEmailWithResend(
      patientEmail,
      template.subject,
      template.html,
      template.text
    )
  } catch (error) {
    console.error('Patient confirmation email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const sendStaffNotificationEmail = async (
  data: StaffNotificationData
): Promise<EmailResult> => {
  try {
    const template = generateStaffNotificationTemplate(data)
    
    // Get staff notification emails from environment variables
    const staffEmails = process.env.STAFF_NOTIFICATION_EMAILS?.split(',') || [
      'admin@zenithmedical.ca'
    ]
    
    // Send to all staff emails
    const results = await Promise.allSettled(
      staffEmails.map(email => 
        sendEmailWithResend(
          email.trim(),
          template.subject,
          template.html,
          template.text
        )
      )
    )
    
    // Check if at least one email was sent successfully
    const successfulResults = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    )
    
    if (successfulResults.length > 0) {
      return {
        success: true,
        messageId: (successfulResults[0] as PromiseFulfilledResult<EmailResult>).value.messageId
      }
    } else {
      return {
        success: false,
        error: 'Failed to send to any staff email addresses'
      }
    }
  } catch (error) {
    console.error('Staff notification email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Export types for external use
export type { PatientConfirmationData, StaffNotificationData, EmailResult } 