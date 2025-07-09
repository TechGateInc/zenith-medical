import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { notificationService } from '../../../../lib/integrations/notification-service'
import { auditLog } from '../../../../lib/audit/audit-logger'
import { z } from 'zod'

// Validation schema
const sendNotificationSchema = z.object({
  type: z.enum(['EMAIL', 'SMS', 'BOTH']),
  to: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional()
  }),
  templateId: z.string().optional(),
  subject: z.string().optional(),
  content: z.object({
    email: z.string().optional(),
    sms: z.string().optional()
  }).optional(),
  variables: z.record(z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledFor: z.string().datetime().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated admin users to send notifications
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = sendNotificationSchema.parse(body)
    
    // Validate that we have appropriate contact information for the notification type
    if (validatedData.type === 'EMAIL' || validatedData.type === 'BOTH') {
      if (!validatedData.to.email) {
        return NextResponse.json({
          success: false,
          error: 'Email address is required for email notifications'
        }, { status: 400 })
      }
    }
    
    if (validatedData.type === 'SMS' || validatedData.type === 'BOTH') {
      if (!validatedData.to.phone) {
        return NextResponse.json({
          success: false,
          error: 'Phone number is required for SMS notifications'
        }, { status: 400 })
      }
    }
    
    // Validate content or template
    if (!validatedData.templateId && !validatedData.content) {
      return NextResponse.json({
        success: false,
        error: 'Either templateId or content must be provided'
      }, { status: 400 })
    }
    
    // Check if notification providers are configured
    const providers = notificationService.getActiveProviders()
    
    if ((validatedData.type === 'EMAIL' || validatedData.type === 'BOTH') && !providers.email) {
      return NextResponse.json({
        success: false,
        error: 'No email provider configured'
      }, { status: 503 })
    }
    
    if ((validatedData.type === 'SMS' || validatedData.type === 'BOTH') && !providers.sms) {
      return NextResponse.json({
        success: false,
        error: 'No SMS provider configured'
      }, { status: 503 })
    }
    
    // Send notification
    const result = await notificationService.sendNotification({
      type: validatedData.type,
      to: validatedData.to,
      templateId: validatedData.templateId,
      subject: validatedData.subject,
      content: validatedData.content || {},
      variables: validatedData.variables,
      priority: validatedData.priority,
      scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined
    }, session.user.id)
    
    // Audit log
    await auditLog({
      action: 'NOTIFICATION_SENT_MANUAL',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'notification',
      details: {
        type: validatedData.type,
        to: validatedData.to,
        templateId: validatedData.templateId,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      emailResult: result.emailResult,
      smsResult: result.smsResult,
      error: result.error
    })
    
  } catch (error) {
    console.error('Send notification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send notification'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get active providers status
    const providers = notificationService.getActiveProviders()
    const allProviders = notificationService.getAllProviders()
    
    return NextResponse.json({
      success: true,
      activeProviders: {
        email: providers.email ? {
          name: providers.email.name,
          type: providers.email.type,
          fromEmail: providers.email.config.fromEmail,
          fromName: providers.email.config.fromName
        } : null,
        sms: providers.sms ? {
          name: providers.sms.name,
          type: providers.sms.type,
          fromNumber: providers.sms.config.fromNumber
        } : null
      },
      availableProviders: {
        email: allProviders.email.map(p => ({
          name: p.name,
          type: p.type,
          active: p.active
        })),
        sms: allProviders.sms.map(p => ({
          name: p.name,
          type: p.type,
          active: p.active
        }))
      }
    })
    
  } catch (error) {
    console.error('Get notification status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get notification status'
    }, { status: 500 })
  }
} 