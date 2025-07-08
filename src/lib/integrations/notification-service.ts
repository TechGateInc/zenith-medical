import { auditLog } from '../audit/audit-logger'

export interface EmailProvider {
  name: string
  type: 'sendgrid' | 'nodemailer' | 'resend'
  config: {
    apiKey?: string
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPassword?: string
    fromEmail: string
    fromName: string
  }
  active: boolean
}

export interface SMSProvider {
  name: string
  type: 'twilio' | 'generic_api'
  config: {
    apiKey?: string
    apiSecret?: string
    accountSid?: string
    fromNumber: string
    region?: string
    endpoint?: string
  }
  active: boolean
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'reminder' | 'confirmation' | 'follow_up' | 'general'
  subject?: string // For email
  emailContent?: string
  smsContent?: string
  variables: string[] // Placeholder variables like {patientName}, {appointmentDate}
  triggerHours?: number // Hours before appointment for reminders
  active: boolean
}

export interface NotificationRequest {
  type: 'EMAIL' | 'SMS' | 'BOTH'
  to: {
    email?: string
    phone?: string
    name?: string
  }
  templateId?: string
  subject?: string
  content?: {
    email?: string
    sms?: string
  }
  variables?: Record<string, string>
  scheduledFor?: Date
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  emailResult?: {
    success: boolean
    messageId?: string
    error?: string
  }
  smsResult?: {
    success: boolean
    messageId?: string
    error?: string
  }
  error?: string
}

export class NotificationService {
  private emailProviders: Map<string, EmailProvider> = new Map()
  private smsProviders: Map<string, SMSProvider> = new Map()
  private activeEmailProvider: string | null = null
  private activeSMSProvider: string | null = null

  constructor() {
    this.loadProviders()
  }

  private loadProviders() {
    // Load email providers
    const emailProviders: EmailProvider[] = [
      {
        name: 'SendGrid',
        type: 'sendgrid',
        config: {
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@zenithmedical.com',
          fromName: process.env.SENDGRID_FROM_NAME || 'Zenith Medical Centre'
        },
        active: !!process.env.SENDGRID_API_KEY
      },
      {
        name: 'Resend',
        type: 'resend',
        config: {
          apiKey: process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@zenithmedical.com',
          fromName: process.env.RESEND_FROM_NAME || 'Zenith Medical Centre'
        },
        active: !!process.env.RESEND_API_KEY
      },
      {
        name: 'SMTP',
        type: 'nodemailer',
        config: {
          smtpHost: process.env.SMTP_HOST,
          smtpPort: parseInt(process.env.SMTP_PORT || '587'),
          smtpUser: process.env.SMTP_USER,
          smtpPassword: process.env.SMTP_PASSWORD,
          fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@zenithmedical.com',
          fromName: process.env.SMTP_FROM_NAME || 'Zenith Medical Centre'
        },
        active: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
      }
    ]

    // Load SMS providers
    const smsProviders: SMSProvider[] = [
      {
        name: 'Twilio',
        type: 'twilio',
        config: {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          apiKey: process.env.TWILIO_AUTH_TOKEN,
          fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890'
        },
        active: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
      }
    ]

    // Register providers
    emailProviders.forEach(provider => {
      if (provider.active) {
        this.emailProviders.set(provider.type, provider)
        if (!this.activeEmailProvider) {
          this.activeEmailProvider = provider.type
        }
      }
    })

    smsProviders.forEach(provider => {
      if (provider.active) {
        this.smsProviders.set(provider.type, provider)
        if (!this.activeSMSProvider) {
          this.activeSMSProvider = provider.type
        }
      }
    })

    // Override with preferred providers
    if (process.env.PREFERRED_EMAIL_PROVIDER && this.emailProviders.has(process.env.PREFERRED_EMAIL_PROVIDER)) {
      this.activeEmailProvider = process.env.PREFERRED_EMAIL_PROVIDER
    }

    if (process.env.PREFERRED_SMS_PROVIDER && this.smsProviders.has(process.env.PREFERRED_SMS_PROVIDER)) {
      this.activeSMSProvider = process.env.PREFERRED_SMS_PROVIDER
    }
  }

  public getActiveProviders() {
    return {
      email: this.activeEmailProvider ? this.emailProviders.get(this.activeEmailProvider) : null,
      sms: this.activeSMSProvider ? this.smsProviders.get(this.activeSMSProvider) : null
    }
  }

  public getAllProviders() {
    return {
      email: Array.from(this.emailProviders.values()),
      sms: Array.from(this.smsProviders.values())
    }
  }

  public async sendNotification(request: NotificationRequest, userId?: string): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false
    }

    try {
      // Initialize processedContent - start with request.content or empty object
      let processedContent = request.content || { email: '', sms: '' }
      
      // Process template if provided
      if (request.templateId) {
        const template = await this.getTemplate(request.templateId)
        if (template) {
          processedContent = {
            email: this.processTemplate(template.emailContent || '', request.variables || {}),
            sms: this.processTemplate(template.smsContent || '', request.variables || {})
          }
        }
      }

      // Send email if required
      if ((request.type === 'EMAIL' || request.type === 'BOTH') && request.to.email && processedContent.email) {
        result.emailResult = await this.sendEmail({
          to: request.to.email,
          toName: request.to.name,
          subject: request.subject || 'Notification from Zenith Medical Centre',
          content: processedContent.email,
          priority: request.priority
        })
      }

      // Send SMS if required
      if ((request.type === 'SMS' || request.type === 'BOTH') && request.to.phone && processedContent.sms) {
        result.smsResult = await this.sendSMS({
          to: request.to.phone,
          content: processedContent.sms,
          priority: request.priority
        })
      }

      // Determine overall success
      result.success = (
        (!result.emailResult || result.emailResult.success) &&
        (!result.smsResult || result.smsResult.success)
      )

      // Use the first available message ID
      result.messageId = result.emailResult?.messageId || result.smsResult?.messageId

      // Audit log
      if (userId) {
        await auditLog({
          action: 'NOTIFICATION_SENT',
          userId,
          userEmail: request.to.email || 'unknown',
          details: {
            type: request.type,
            to: request.to,
            success: result.success,
            emailSuccess: result.emailResult?.success,
            smsSuccess: result.smsResult?.success,
            templateId: request.templateId,
            priority: request.priority
          },
          ipAddress: 'system',
          userAgent: 'notification-service'
        })
      }

      return result

    } catch (error) {
      console.error('Notification error:', error)
      result.error = error instanceof Error ? error.message : 'Unknown error occurred'
      return result
    }
  }

  private async sendEmail(params: {
    to: string
    toName?: string
    subject: string
    content: string
    priority: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const provider = this.activeEmailProvider ? this.emailProviders.get(this.activeEmailProvider) : null
    
    if (!provider) {
      return { success: false, error: 'No email provider configured' }
    }

    try {
      switch (provider.type) {
        case 'sendgrid':
          return await this.sendEmailWithSendGrid(params, provider)
        case 'resend':
          return await this.sendEmailWithResend(params, provider)
        case 'nodemailer':
          return await this.sendEmailWithNodemailer(params, provider)
        default:
          return { success: false, error: 'Unsupported email provider' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email sending failed' 
      }
    }
  }

  private async sendEmailWithSendGrid(
    params: { to: string; toName?: string; subject: string; content: string },
    provider: EmailProvider
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(provider.config.apiKey)

      const msg = {
        to: {
          email: params.to,
          name: params.toName
        },
        from: {
          email: provider.config.fromEmail,
          name: provider.config.fromName
        },
        subject: params.subject,
        html: params.content,
        text: params.content.replace(/<[^>]*>/g, '') // Strip HTML for text version
      }

      const [response] = await sgMail.send(msg)
      
      return {
        success: true,
        messageId: response.headers['x-message-id']
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.body?.errors?.[0]?.message || error.message
      }
    }
  }

  private async sendEmailWithResend(
    params: { to: string; toName?: string; subject: string; content: string },
    provider: EmailProvider
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${provider.config.fromName} <${provider.config.fromEmail}>`,
          to: [params.to],
          subject: params.subject,
          html: params.content
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Resend API error')
      }

      const data = await response.json()
      
      return {
        success: true,
        messageId: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async sendEmailWithNodemailer(
    params: { to: string; toName?: string; subject: string; content: string },
    provider: EmailProvider
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const nodemailer = require('nodemailer')
      
      const transporter = nodemailer.createTransporter({
        host: provider.config.smtpHost,
        port: provider.config.smtpPort,
        secure: provider.config.smtpPort === 465,
        auth: {
          user: provider.config.smtpUser,
          pass: provider.config.smtpPassword
        }
      })

      const mailOptions = {
        from: `${provider.config.fromName} <${provider.config.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        html: params.content,
        text: params.content.replace(/<[^>]*>/g, '')
      }

      const info = await transporter.sendMail(mailOptions)
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async sendSMS(params: {
    to: string
    content: string
    priority: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const provider = this.activeSMSProvider ? this.smsProviders.get(this.activeSMSProvider) : null
    
    if (!provider) {
      return { success: false, error: 'No SMS provider configured' }
    }

    try {
      switch (provider.type) {
        case 'twilio':
          return await this.sendSMSWithTwilio(params, provider)
        default:
          return { success: false, error: 'Unsupported SMS provider' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMS sending failed' 
      }
    }
  }

  private async sendSMSWithTwilio(
    params: { to: string; content: string },
    provider: SMSProvider
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const twilio = require('twilio')
      const client = twilio(provider.config.accountSid, provider.config.apiKey)

      const message = await client.messages.create({
        body: params.content,
        from: provider.config.fromNumber,
        to: params.to
      })

      return {
        success: true,
        messageId: message.sid
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g')
      processed = processed.replace(regex, value)
    })

    return processed
  }

  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    // This would typically fetch from database
    // For now, return built-in templates
    const builtInTemplates: NotificationTemplate[] = [
      {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        type: 'reminder',
        subject: 'Appointment Reminder - {appointmentDate}',
        emailContent: `
          <h2>Appointment Reminder</h2>
          <p>Dear {patientName},</p>
          <p>This is a reminder that you have an appointment scheduled:</p>
          <ul>
            <li><strong>Date:</strong> {appointmentDate}</li>
            <li><strong>Time:</strong> {appointmentTime}</li>
            <li><strong>Type:</strong> {appointmentType}</li>
            <li><strong>Provider:</strong> {providerName}</li>
          </ul>
          <p>Please arrive 15 minutes early and bring your ID and insurance card.</p>
          <p>If you need to reschedule, please call us at (555) 123-4567.</p>
          <p>Best regards,<br>Zenith Medical Centre</p>
        `,
        smsContent: 'Reminder: You have an appointment on {appointmentDate} at {appointmentTime}. Please arrive 15 min early. Call (555) 123-4567 to reschedule.',
        variables: ['patientName', 'appointmentDate', 'appointmentTime', 'appointmentType', 'providerName'],
        triggerHours: 24,
        active: true
      },
      {
        id: 'appointment_confirmation',
        name: 'Appointment Confirmation',
        type: 'confirmation',
        subject: 'Appointment Confirmed - {appointmentDate}',
        emailContent: `
          <h2>Appointment Confirmed</h2>
          <p>Dear {patientName},</p>
          <p>Your appointment has been confirmed:</p>
          <ul>
            <li><strong>Date:</strong> {appointmentDate}</li>
            <li><strong>Time:</strong> {appointmentTime}</li>
            <li><strong>Type:</strong> {appointmentType}</li>
          </ul>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>Zenith Medical Centre</p>
        `,
        smsContent: 'Your appointment on {appointmentDate} at {appointmentTime} is confirmed. See you then!',
        variables: ['patientName', 'appointmentDate', 'appointmentTime', 'appointmentType'],
        active: true
      }
    ]

    return builtInTemplates.find(t => t.id === templateId) || null
  }

  public async sendAppointmentReminder(appointmentData: {
    patientName: string
    patientEmail: string
    patientPhone: string
    appointmentDate: string
    appointmentTime: string
    appointmentType: string
    providerName?: string
  }, userId?: string): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'BOTH',
      to: {
        email: appointmentData.patientEmail,
        phone: appointmentData.patientPhone,
        name: appointmentData.patientName
      },
      templateId: 'appointment_reminder',
      variables: {
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        appointmentType: appointmentData.appointmentType,
        providerName: appointmentData.providerName || 'Medical Team'
      },
      priority: 'normal'
    }, userId)
  }

  public async sendAppointmentConfirmation(appointmentData: {
    patientName: string
    patientEmail: string
    patientPhone: string
    appointmentDate: string
    appointmentTime: string
    appointmentType: string
  }, userId?: string): Promise<NotificationResult> {
    return this.sendNotification({
      type: 'BOTH',
      to: {
        email: appointmentData.patientEmail,
        phone: appointmentData.patientPhone,
        name: appointmentData.patientName
      },
      templateId: 'appointment_confirmation',
      variables: {
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        appointmentType: appointmentData.appointmentType
      },
      priority: 'high'
    }, userId)
  }
}

// Export singleton instance
export const notificationService = new NotificationService() 