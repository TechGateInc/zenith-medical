import nodemailer from 'nodemailer'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template interfaces
interface PatientConfirmationData {
  patientName: string
  submissionId: string
  submissionDate: string
  appointmentBookingUrl: string
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

// Email service configuration
const getEmailConfig = (): EmailConfig => {
  // In production, these would come from environment variables
  // For development, you might use a service like Mailtrap or Ethereal
  return {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY || ''
    }
  }
}

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig()
  return nodemailer.createTransport(config)
}

// Email templates
const generatePatientConfirmationTemplate = (data: PatientConfirmationData): { subject: string; html: string; text: string } => {
  const subject = 'Patient Intake Form Received - Zenith Medical Centre'
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Intake Form Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #475569);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8fafc;
          padding: 30px 20px;
          border-radius: 0 0 8px 8px;
        }
        .confirmation-box {
          background: white;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .submission-details {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .security-note {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Zenith Medical Centre</h1>
        <p>Your Patient Intake Form Has Been Received</p>
      </div>
      
      <div class="content">
        <div class="confirmation-box">
          <h2 style="color: #10b981; margin: 0;">✓ Submission Confirmed</h2>
          <p>Thank you, ${data.patientName}! Your patient intake form has been successfully submitted and securely processed.</p>
        </div>
        
        <div class="submission-details">
          <h3>Submission Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Submission ID:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${data.submissionId}</code></li>
            <li><strong>Date & Time:</strong> ${data.submissionDate}</li>
            <li><strong>Status:</strong> <span style="color: #10b981;">Received & Encrypted</span></li>
          </ul>
          <p><em>Please keep your Submission ID for your records.</em></p>
        </div>
        
        <div style="text-align: center;">
          <h3>Next Step: Book Your Appointment</h3>
          <p>Complete your registration by scheduling your first appointment with our medical team.</p>
          <a href="${data.appointmentBookingUrl}" class="cta-button">Book Appointment Now</a>
        </div>
        
        <div class="security-note">
          <h4 style="margin-top: 0;">🔒 Your Privacy is Protected</h4>
          <p>Your personal health information has been encrypted using AES-256 encryption and is stored securely in compliance with HIPAA and PIPEDA regulations. Only authorized medical personnel will have access to your information.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>What to Bring to Your Appointment:</h3>
          <ul>
            <li>Valid photo identification (driver's license, passport, or government ID)</li>
            <li>Current insurance card or coverage information</li>
            <li>List of current medications and dosages</li>
            <li>Any relevant medical records or test results</li>
            <li>Your preferred method of payment for any co-pays</li>
          </ul>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Contact Information:</h3>
          <p>
            <strong>Phone:</strong> (555) 123-CARE<br>
            <strong>Email:</strong> intake@zenithmedical.com<br>
            <strong>Address:</strong> 123 Medical Plaza Drive, Medical District, MD 12345
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message from Zenith Medical Centre. Please do not reply to this email.</p>
        <p>If you have questions about your submission, please call us at (555) 123-CARE.</p>
        <p>&copy; ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    ZENITH MEDICAL CENTRE
    Patient Intake Form Confirmation
    
    Dear ${data.patientName},
    
    Thank you! Your patient intake form has been successfully submitted and securely processed.
    
    SUBMISSION DETAILS:
    - Submission ID: ${data.submissionId}
    - Date & Time: ${data.submissionDate}
    - Status: Received & Encrypted
    
    Please keep your Submission ID for your records.
    
    NEXT STEP: BOOK YOUR APPOINTMENT
    Complete your registration by scheduling your first appointment with our medical team.
    
    Appointment Booking: ${data.appointmentBookingUrl}
    
    WHAT TO BRING TO YOUR APPOINTMENT:
    - Valid photo identification
    - Current insurance card
    - List of current medications
    - Any relevant medical records
    - Your preferred method of payment for co-pays
    
    YOUR PRIVACY IS PROTECTED
    Your personal health information has been encrypted using AES-256 encryption and is stored securely in compliance with HIPAA and PIPEDA regulations.
    
    CONTACT INFORMATION:
    Phone: (555) 123-CARE
    Email: intake@zenithmedical.com
    Address: 123 Medical Plaza Drive, Medical District, MD 12345
    
    This is an automated message. Please do not reply to this email.
    For questions, please call us at (555) 123-CARE.
    
    © ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.
  `
  
  return { subject, html, text }
}

const generateStaffNotificationTemplate = (data: StaffNotificationData): { subject: string; html: string; text: string } => {
  const subject = `New Patient Intake Submission - ${data.submissionId}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Patient Intake</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #475569;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8fafc;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .alert-box {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .details-box {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 Zenith Medical Centre</h1>
        <p>New Patient Intake Submission</p>
      </div>
      
      <div class="content">
        <div class="alert-box">
          <h3 style="margin-top: 0;">⚡ Action Required</h3>
          <p>A new patient has completed their intake form and requires review and appointment scheduling.</p>
        </div>
        
        <div class="details-box">
          <h3>Submission Information:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Submission ID:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${data.submissionId}</code></li>
            <li><strong>Date:</strong> ${data.submissionDate}</li>
            <li><strong>Time:</strong> ${data.submissionTime}</li>
            <li><strong>Patient Email:</strong> ${data.patientEmail}</li>
            <li><strong>Has Preferred Name:</strong> ${data.hasPreferredName ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <p><strong>Review this submission in the admin dashboard:</strong></p>
          <a href="${data.dashboardUrl}" class="cta-button">View in Dashboard</a>
        </div>
        
        <div class="details-box">
          <h3>Required Actions:</h3>
          <ol>
            <li><strong>Review Submission:</strong> Verify all patient information is complete and accurate</li>
            <li><strong>Contact Patient:</strong> Call or email to confirm details and answer any questions</li>
            <li><strong>Schedule Appointment:</strong> Coordinate with patient to book their first appointment</li>
            <li><strong>Update Status:</strong> Mark as reviewed in the admin dashboard</li>
          </ol>
        </div>
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0;">🔒 Privacy Reminder</h4>
          <p style="margin-bottom: 0;">This submission contains encrypted PHI. Ensure all communication and handling follows HIPAA/PIPEDA compliance protocols.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Zenith Medical Centre Administrative System</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    ZENITH MEDICAL CENTRE
    New Patient Intake Submission
    
    ACTION REQUIRED: A new patient has completed their intake form and requires review.
    
    SUBMISSION INFORMATION:
    - Submission ID: ${data.submissionId}
    - Date: ${data.submissionDate}
    - Time: ${data.submissionTime}
    - Patient Email: ${data.patientEmail}
    - Has Preferred Name: ${data.hasPreferredName ? 'Yes' : 'No'}
    
    DASHBOARD ACCESS:
    ${data.dashboardUrl}
    
    REQUIRED ACTIONS:
    1. Review Submission: Verify all patient information
    2. Contact Patient: Call or email to confirm details
    3. Schedule Appointment: Book their first appointment
    4. Update Status: Mark as reviewed in dashboard
    
    PRIVACY REMINDER:
    This submission contains encrypted PHI. Follow HIPAA/PIPEDA compliance protocols.
    
    Generated: ${new Date().toLocaleString()}
  `
  
  return { subject, html, text }
}

// Email sending functions
export const sendPatientConfirmationEmail = async (
  patientEmail: string,
  data: PatientConfirmationData
): Promise<EmailResult> => {
  try {
    const transporter = createTransporter()
    const template = generatePatientConfirmationTemplate(data)
    
    const mailOptions = {
      from: {
        name: 'Zenith Medical Centre',
        address: process.env.FROM_EMAIL || 'noreply@zenithmedical.com'
      },
      to: patientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@zenithmedical.com>'
      }
    }
    
    const result = await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      messageId: result.messageId
    }
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
    const transporter = createTransporter()
    const template = generateStaffNotificationTemplate(data)
    
    // Get staff notification emails from environment variables
    const staffEmails = process.env.STAFF_NOTIFICATION_EMAILS?.split(',') || [
      'admin@zenithmedical.com',
      'intake@zenithmedical.com'
    ]
    
    const mailOptions = {
      from: {
        name: 'Zenith Medical Centre System',
        address: process.env.FROM_EMAIL || 'noreply@zenithmedical.com'
      },
      to: staffEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Priority': '2',
        'X-MSMail-Priority': 'High'
      }
    }
    
    const result = await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      messageId: result.messageId
    }
  } catch (error) {
    console.error('Staff notification email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test email configuration
export const testEmailConfiguration = async (): Promise<EmailResult> => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Email configuration test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Export types for use in other files
export type { PatientConfirmationData, StaffNotificationData, EmailResult } 