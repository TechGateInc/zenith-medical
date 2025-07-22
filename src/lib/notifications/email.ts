import nodemailer from 'nodemailer'

// Email service types
type EmailProvider = 'resend' | 'smtp'

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
  provider?: EmailProvider
}

// Email service configuration
const getEmailProvider = (): EmailProvider => {
  // Prioritize Resend if API key is available, otherwise use SMTP
  if (process.env.RESEND_API_KEY) {
    return 'resend'
  }
  return 'smtp'
}

// SMTP configuration
const getSMTPConfig = () => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
}

// Create SMTP transporter
const createSMTPTransporter = () => {
  const config = getSMTPConfig()
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
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
        }
        .confirmation-box {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #16a34a;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        .confirmation-box h2 {
          color: #15803d;
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .confirmation-box p {
          margin: 0;
          color: #166534;
          font-size: 16px;
          font-weight: 500;
        }
        .submission-details {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .submission-details h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 20px;
          font-weight: 600;
        }
        .submission-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .submission-details li {
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .submission-details strong {
          color: #334155;
          font-weight: 600;
          min-width: 120px;
        }
        .submission-id {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 4px 12px;
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          font-weight: 600;
        }
        .status-badge {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          color: #15803d;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }
        .cta-section {
          text-align: center;
          margin: 32px 0;
        }
        .cta-section h3 {
          color: #1e293b;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        .cta-section p {
          color: #64748b;
          font-size: 16px;
          margin: 0 0 24px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .security-note {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }
        .security-note h4 {
          margin: 0 0 12px 0;
          color: #1d4ed8;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .security-note p {
          margin: 0;
          color: #1e40af;
          font-size: 14px;
          line-height: 1.5;
        }
        .info-section {
          margin: 32px 0;
        }
        .info-section h3 {
          color: #1e293b;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        .info-section ul {
          color: #475569;
          margin: 0;
          padding-left: 20px;
        }
        .info-section li {
          margin: 8px 0;
          line-height: 1.5;
        }
        .contact-info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .contact-info h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 20px;
          font-weight: 600;
        }
        .contact-info p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
        }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 24px 30px;
          text-align: center;
        }
        .footer p {
          margin: 8px 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.4;
        }
        .footer a {
          color: #2563eb;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .email-container {
            margin: 10px;
          }
          .header, .content, .footer {
            padding: 24px 20px;
          }
          .header h1 {
            font-size: 24px;
          }
          .cta-button {
            padding: 14px 24px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Zenith Medical Centre</h1>
                          <p>Expert Care Personal Touch</p>
        </div>
        
        <div class="content">
          <div class="confirmation-box">
            <h2>
              <span style="color: #16a34a; font-size: 24px;">✓</span>
              Submission Confirmed
            </h2>
            <p>Thank you, ${data.patientName}! Your patient intake form has been successfully received and securely processed.</p>
          </div>
          
          <div class="submission-details">
            <h3>Submission Details</h3>
            <ul>
              <li>
                <strong>Submission ID:</strong>
                <span class="submission-id">${data.submissionId}</span>
              </li>
              <li>
                <strong>Date & Time:</strong>
                <span>${data.submissionDate}</span>
              </li>
              <li>
                <strong>Status:</strong>
                <span class="status-badge">Received & Encrypted</span>
              </li>
            </ul>
            <p style="margin-top: 16px; color: #64748b; font-size: 14px; font-style: italic;">
              Please keep your Submission ID for your records.
            </p>
          </div>
          
          <div class="cta-section">
            <h3>Next Step: Book Your Appointment</h3>
            <p>Complete your registration by scheduling your first appointment with our medical team.</p>
            <a href="${data.appointmentBookingUrl}" class="cta-button">
              📅 Schedule Appointment
            </a>
          </div>
          
          <div class="security-note">
            <h4>
              <span style="color: #2563eb; font-size: 18px;">🔒</span>
              Your Privacy is Protected
            </h4>
            <p>Your personal health information has been encrypted using AES-256 encryption and is stored securely in compliance with HIPAA and PIPEDA regulations. Only authorized medical personnel will have access to your information.</p>
          </div>
          
          <div class="info-section">
            <h3>What to Bring to Your Appointment</h3>
            <ul>
              <li>Valid photo identification (driver's license, passport, or government ID)</li>
              <li>Current insurance card or coverage information</li>
              <li>List of current medications and dosages</li>
              <li>Any relevant medical records or test results</li>
              <li>Your preferred method of payment for any co-pays</li>
            </ul>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p>
              <strong>Phone:</strong> <a href="tel:+12498060128">249 806 0128</a><br>
              <strong>Email:</strong> <a href="mailto:intake@zenithmedical.ca">intake@zenithmedical.ca</a><br>
              <strong>Address:</strong> Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Zenith Medical Centre. Please do not reply to this email.</p>
          <p>If you have questions about your submission, please call us at <a href="tel:+12498060128">249 806 0128</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    ZENITH MEDICAL CENTRE
    Expert Care Personal Touch
    
    Patient Intake Form Confirmation
    
    Dear ${data.patientName},
    
    ✓ SUBMISSION CONFIRMED
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
    - Valid photo identification (driver's license, passport, or government ID)
    - Current insurance card or coverage information
    - List of current medications and dosages
    - Any relevant medical records or test results
    - Your preferred method of payment for any co-pays
    
    🔒 YOUR PRIVACY IS PROTECTED
    Your personal health information has been encrypted using AES-256 encryption and is stored securely in compliance with HIPAA and PIPEDA regulations. Only authorized medical personnel will have access to your information.
    
    CONTACT INFORMATION:
    Phone: 249 806 0128
    Email: intake@zenithmedical.ca
    Address: Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3
    
    This is an automated message from Zenith Medical Centre. Please do not reply to this email.
    For questions about your submission, please call us at 249 806 0128.
    
    © ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.
  `
  
  return { subject, html, text }
}

const generateStaffNotificationTemplate = (data: StaffNotificationData): { subject: string; html: string; text: string } => {
  const subject = `🏥 New Patient Intake Submission - ${data.submissionId}`
  
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
          background: linear-gradient(135deg, #475569, #334155);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
        }
        .content {
          padding: 30px;
        }
        .alert-box {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .alert-box h3 {
          margin: 0 0 12px 0;
          color: #92400e;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .alert-box p {
          margin: 0;
          color: #a16207;
          font-size: 16px;
          font-weight: 500;
        }
        .details-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }
        .details-box h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 20px;
          font-weight: 600;
        }
        .details-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .details-box li {
          margin: 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .details-box strong {
          color: #334155;
          font-weight: 600;
          min-width: 140px;
        }
        .submission-id {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 4px 12px;
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          font-weight: 600;
        }
        .actions-section {
          text-align: center;
          margin: 32px 0;
        }
        .actions-section h3 {
          color: #1e293b;
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 16px 0;
        }
        .actions-list {
          text-align: left;
          max-width: 400px;
          margin: 0 auto 24px auto;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .actions-list ol {
          margin: 0;
          padding-left: 20px;
          color: #475569;
        }
        .actions-list li {
          margin: 8px 0;
          line-height: 1.5;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .privacy-reminder {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }
        .privacy-reminder h4 {
          margin: 0 0 12px 0;
          color: #dc2626;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .privacy-reminder p {
          margin: 0;
          color: #dc2626;
          font-size: 14px;
          line-height: 1.5;
        }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 24px 30px;
          text-align: center;
        }
        .footer p {
          margin: 8px 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.4;
        }
        .timestamp {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
        }
        @media (max-width: 480px) {
          .email-container {
            margin: 10px;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .header h1 {
            font-size: 20px;
          }
          .cta-button {
            padding: 14px 24px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>
            <span style="font-size: 24px;">🏥</span>
            Zenith Medical Centre
          </h1>
          <p>Staff Notification System</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h3>
              <span style="color: #f59e0b; font-size: 20px;">⚡</span>
              Action Required
            </h3>
            <p>A new patient has completed their intake form and requires review and appointment scheduling.</p>
          </div>
          
          <div class="details-box">
            <h3>Submission Information</h3>
            <ul>
              <li>
                <strong>Submission ID:</strong>
                <span class="submission-id">${data.submissionId}</span>
              </li>
              <li>
                <strong>Date:</strong>
                <span>${data.submissionDate}</span>
              </li>
              <li>
                <strong>Time:</strong>
                <span>${data.submissionTime}</span>
              </li>
              <li>
                <strong>Patient Email:</strong>
                <span style="color: #2563eb; font-weight: 600;">${data.patientEmail}</span>
              </li>
              <li>
                <strong>Has Preferred Name:</strong>
                <span style="color: ${data.hasPreferredName ? '#16a34a' : '#64748b'}; font-weight: 600;">
                  ${data.hasPreferredName ? 'Yes' : 'No'}
                </span>
              </li>
            </ul>
          </div>
          
          <div class="actions-section">
            <h3>Required Actions</h3>
            <div class="actions-list">
              <ol>
                <li><strong>Review Submission:</strong> Verify all patient information and check for completeness</li>
                <li><strong>Contact Patient:</strong> Call or email to confirm details and answer any questions</li>
                <li><strong>Schedule Appointment:</strong> Book their first appointment with appropriate physician</li>
                <li><strong>Update Status:</strong> Mark submission as reviewed in the admin dashboard</li>
                <li><strong>Prepare Charts:</strong> Set up patient file and prepare for first visit</li>
              </ol>
            </div>
            <a href="${data.dashboardUrl}" class="cta-button">
              📊 View in Admin Dashboard
            </a>
          </div>
          
          <div class="privacy-reminder">
            <h4>
              <span style="color: #dc2626; font-size: 18px;">🔒</span>
              Privacy Reminder
            </h4>
            <p>This submission contains encrypted PHI (Protected Health Information). Follow HIPAA/PIPEDA compliance protocols when handling patient information. Only access what is necessary for patient care.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
          <p>This is an automated notification from Zenith Medical Centre Staff System.</p>
          <p>For technical support, contact IT at <a href="mailto:support@zenithmedical.ca" style="color: #2563eb;">support@zenithmedical.ca</a></p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    ZENITH MEDICAL CENTRE
    Staff Notification System
    
    🏥 NEW PATIENT INTAKE SUBMISSION
    
    ⚡ ACTION REQUIRED
    A new patient has completed their intake form and requires review and appointment scheduling.
    
    SUBMISSION INFORMATION:
    - Submission ID: ${data.submissionId}
    - Date: ${data.submissionDate}
    - Time: ${data.submissionTime}
    - Patient Email: ${data.patientEmail}
    - Has Preferred Name: ${data.hasPreferredName ? 'Yes' : 'No'}
    
    ADMIN DASHBOARD ACCESS:
    ${data.dashboardUrl}
    
    REQUIRED ACTIONS:
    1. Review Submission: Verify all patient information and check for completeness
    2. Contact Patient: Call or email to confirm details and answer any questions
    3. Schedule Appointment: Book their first appointment with appropriate physician
    4. Update Status: Mark submission as reviewed in the admin dashboard
    5. Prepare Charts: Set up patient file and prepare for first visit
    
    🔒 PRIVACY REMINDER
    This submission contains encrypted PHI (Protected Health Information). Follow HIPAA/PIPEDA compliance protocols when handling patient information. Only access what is necessary for patient care.
    
    Generated: ${new Date().toLocaleString()}
    
    This is an automated notification from Zenith Medical Centre Staff System.
    For technical support, contact IT at support@zenithmedical.ca
  `
  
  return { subject, html, text }
}

// Send email with Resend
const sendEmailWithResend = async (
  to: string,
  subject: string,
  html: string,
  text: string,
  fromName?: string,
  fromEmail?: string
): Promise<EmailResult> => {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Use proper from email for Resend (must be verified domain or onboarding@resend.dev)
    const fromEmailAddress = process.env.RESEND_FROM_EMAIL || fromEmail || 'onboarding@resend.dev'
    const fromNameValue = process.env.RESEND_FROM_NAME || fromName || 'Zenith Medical Centre'
    
    console.log('Sending email with Resend:', {
      to,
      from: `${fromNameValue} <${fromEmailAddress}>`,
      subject
    })
    
    const result = await resend.emails.send({
      from: `${fromNameValue} <${fromEmailAddress}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text,
    })
    
    console.log('Resend result:', result)
    
    if (result.error) {
      throw new Error(result.error.message || 'Resend API error')
    }
    
    return {
      success: true,
      messageId: result.data?.id,
      provider: 'resend'
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'resend'
    }
  }
}

// Send email with SMTP
const sendEmailWithSMTP = async (
  to: string,
  subject: string,
  html: string,
  text: string,
  fromName?: string,
  fromEmail?: string
): Promise<EmailResult> => {
  try {
    const transporter = createSMTPTransporter()
    
    const mailOptions = {
      from: `${fromName || 'Zenith Medical Centre'} <${fromEmail || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'List-Unsubscribe': '<mailto:unsubscribe@zenithmedical.ca>'
      }
    }
    
    const result = await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      messageId: result.messageId,
      provider: 'smtp'
    }
  } catch (error) {
    console.error('SMTP email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'smtp'
    }
  }
}

// Main email sending function with fallback
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string,
  fromName?: string,
  fromEmail?: string
): Promise<EmailResult> => {
  const provider = getEmailProvider()
  
  try {
    if (provider === 'resend') {
      const result = await sendEmailWithResend(to, subject, html, text, fromName, fromEmail)
      if (result.success) {
        return result
      }
      // Fallback to SMTP if Resend fails (unless disabled)
      if (process.env.DISABLE_SMTP_FALLBACK !== 'true') {
        console.log('Resend failed, falling back to SMTP...')
        return await sendEmailWithSMTP(to, subject, html, text, fromName, fromEmail)
      } else {
        console.log('Resend failed, SMTP fallback disabled')
        return result
      }
    } else {
      const result = await sendEmailWithSMTP(to, subject, html, text, fromName, fromEmail)
      if (result.success) {
        return result
      }
      // Fallback to Resend if SMTP fails and Resend is available
      if (process.env.RESEND_API_KEY) {
        console.log('SMTP failed, falling back to Resend...')
        return await sendEmailWithResend(to, subject, html, text, fromName, fromEmail)
      }
      return result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed',
      provider: provider
    }
  }
}

// Email sending functions
export const sendPatientConfirmationEmail = async (
  patientEmail: string,
  data: PatientConfirmationData
): Promise<EmailResult> => {
  try {
    const template = generatePatientConfirmationTemplate(data)
    
    return await sendEmail(
      patientEmail,
      template.subject,
      template.html,
      template.text,
      process.env.RESEND_FROM_NAME || 'Zenith Medical Centre',
      process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
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
      'admin@zenithmedical.ca',
      'intake@zenithmedical.ca'
    ]
    
    // Send to first staff email (can be extended to send to multiple)
    const staffEmail = staffEmails[0].trim()
    
            return await sendEmail(
          staffEmail,
          template.subject,
          template.html,
          template.text,
          process.env.RESEND_FROM_NAME || 'Zenith Medical Centre System',
          process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        )
  } catch (error) {
    console.error('Staff notification email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const testEmailConfiguration = async (): Promise<EmailResult> => {
  try {
    const testData: PatientConfirmationData = {
      patientName: 'Test Patient',
      submissionId: 'TEST-123',
      submissionDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      appointmentBookingUrl: 'https://www.zenithmedical.ca/contact?booking=true'
    }
    
    const template = generatePatientConfirmationTemplate(testData)
    
            return await sendEmail(
          'test@example.com',
          template.subject,
          template.html,
          template.text,
          process.env.RESEND_FROM_NAME || 'Zenith Medical Centre',
          process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        )
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test email failed'
    }
  }
}

// Export types for use in other files
export type { PatientConfirmationData, StaffNotificationData, EmailResult } 