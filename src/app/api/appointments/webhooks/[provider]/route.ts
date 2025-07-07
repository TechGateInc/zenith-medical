import { NextRequest, NextResponse } from 'next/server'
import { appointmentBookingService } from '../../../../../lib/integrations/appointment-booking'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import crypto from 'crypto'

interface WebhookParams {
  provider: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<WebhookParams> }
) {
  const { provider } = await params
  
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature') || request.headers.get('x-hook-signature')
    
    // Verify webhook signature if required
    if (!verifyWebhookSignature(provider, body, signature)) {
      await auditLog({
        action: 'WEBHOOK_SIGNATURE_FAILED',
        userId: 'system',
        userEmail: 'system',
        resource: 'webhook',
        details: {
          provider,
          reason: 'Invalid signature'
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // Parse webhook payload
    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }
    
    // Process webhook through booking service
    const appointmentData = await appointmentBookingService.handleWebhook(payload, provider)
    
    if (!appointmentData) {
      // Webhook received but no action needed
      return NextResponse.json({ received: true })
    }
    
    // Update or create appointment in database
    const updatedAppointment = await processAppointmentUpdate(appointmentData, provider, payload)
    
    // Log webhook processing
    await auditLog({
      action: 'WEBHOOK_PROCESSED',
      userId: 'system',
      userEmail: appointmentData.patientEmail,
      resource: 'appointment',
      resourceId: updatedAppointment?.id,
      details: {
        provider,
        action: payload.action || payload.event,
        appointmentId: appointmentData.providerAppointmentId,
        patientName: appointmentData.patientName,
        status: appointmentData.status
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({ 
      received: true,
      processed: true,
      appointmentId: updatedAppointment?.id
    })
    
  } catch (error) {
    console.error(`Webhook processing error for ${provider}:`, error)
    
    await auditLog({
      action: 'WEBHOOK_ERROR',
      userId: 'system',
      userEmail: 'system',
      resource: 'webhook',
      details: {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      received: true
    }, { status: 500 })
  }
}

async function processAppointmentUpdate(
  appointmentData: any,
  provider: string,
  originalPayload: any
) {
  const { providerAppointmentId } = appointmentData
  
  // Try to find existing appointment
  let existingAppointment = null
  if (providerAppointmentId) {
    existingAppointment = await prisma.appointment.findFirst({
      where: {
        providerAppointmentId,
        providerType: provider
      },
      include: {
        patientIntake: true
      }
    })
  }
  
  // If appointment exists, update it
  if (existingAppointment) {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: existingAppointment.id },
      data: {
        status: appointmentData.status,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        appointmentType: appointmentData.appointmentType,
        providerStaffName: appointmentData.providerName,
        notes: appointmentData.notes,
        metadata: {
          ...existingAppointment.metadata as any,
          lastWebhookUpdate: new Date().toISOString(),
          originalPayload
        }
      }
    })
    
    // Update patient intake status if needed
    if (existingAppointment.patientIntake) {
      let intakeStatus = existingAppointment.patientIntake.status
      
      if (appointmentData.status === 'confirmed') {
        intakeStatus = 'APPOINTMENT_SCHEDULED'
      } else if (appointmentData.status === 'cancelled') {
        intakeStatus = 'CANCELLED'
      } else if (appointmentData.status === 'completed') {
        intakeStatus = 'COMPLETED'
      }
      
      if (intakeStatus !== existingAppointment.patientIntake.status) {
        await prisma.patientIntake.update({
          where: { id: existingAppointment.patientIntake.id },
          data: { status: intakeStatus as any }
        })
      }
    }
    
    return updatedAppointment
  }
  
  // If appointment doesn't exist, create it
  const newAppointment = await prisma.appointment.create({
    data: {
      providerType: provider,
      providerAppointmentId,
      providerName: appointmentData.providerName || getProviderDisplayName(provider),
      patientName: appointmentData.patientName,
      patientEmail: appointmentData.patientEmail,
      patientPhone: appointmentData.patientPhone,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      appointmentType: appointmentData.appointmentType,
      status: appointmentData.status,
      notes: appointmentData.notes,
      metadata: {
        createdFromWebhook: true,
        originalPayload,
        webhookTimestamp: new Date().toISOString()
      }
    }
  })
  
  return newAppointment
}

function verifyWebhookSignature(provider: string, body: string, signature: string | null): boolean {
  if (!signature) {
    // Some providers might not use signatures
    return true
  }
  
  try {
    switch (provider) {
      case 'acuity':
        return verifyAcuitySignature(body, signature)
      case 'calendly':
        return verifyCalendlySignature(body, signature)
      case 'generic_webhook':
        return verifyGenericSignature(body, signature)
      default:
        // Unknown provider, skip signature verification
        return true
    }
  } catch (error) {
    console.error(`Signature verification error for ${provider}:`, error)
    return false
  }
}

function verifyAcuitySignature(body: string, signature: string): boolean {
  const secret = process.env.ACUITY_WEBHOOK_SECRET
  if (!secret) {
    return true // No secret configured, skip verification
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return signature === expectedSignature
}

function verifyCalendlySignature(body: string, signature: string): boolean {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET
  if (!secret) {
    return true // No secret configured, skip verification
  }
  
  // Calendly uses HMAC-SHA256 with a specific format
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64')
  
  return signature === expectedSignature
}

function verifyGenericSignature(body: string, signature: string): boolean {
  const secret = process.env.BOOKING_WEBHOOK_SECRET
  if (!secret) {
    return true // No secret configured, skip verification
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return signature === expectedSignature
}

function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    acuity: 'Acuity Scheduling',
    calendly: 'Calendly',
    simplepractice: 'SimplePractice',
    generic_webhook: 'Booking System',
    embed: 'External Booking'
  }
  
  return names[provider] || provider
}

// GET handler for webhook verification (some providers require this)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<WebhookParams> }
) {
  const { provider } = await params
  const { searchParams } = new URL(request.url)
  
  // Handle verification challenges
  switch (provider) {
    case 'calendly':
      // Calendly webhook verification
      const challenge = searchParams.get('challenge')
      if (challenge) {
        return new Response(challenge, { status: 200 })
      }
      break
      
    case 'acuity':
      // Acuity webhook verification
      const verify = searchParams.get('verify')
      if (verify) {
        return new Response('OK', { status: 200 })
      }
      break
  }
  
  return NextResponse.json({ 
    message: `Webhook endpoint active for ${provider}`,
    timestamp: new Date().toISOString()
  })
} 