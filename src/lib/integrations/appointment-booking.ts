import { auditLog } from '../audit/audit-logger'

export interface BookingProvider {
  name: string
  type: 'acuity' | 'calendly' | 'simplepractice' | 'generic_webhook' | 'embed'
  config: {
    apiKey?: string
    apiSecret?: string
    subdomain?: string
    embedUrl?: string
    webhookUrl?: string
    redirectUrl?: string
  }
  active: boolean
}

export interface AppointmentData {
  patientId?: string
  intakeSubmissionId?: string
  providerAppointmentId?: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  providerId?: string
  providerName?: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  metadata?: Record<string, any>
}

export interface BookingResponse {
  success: boolean
  appointmentId?: string
  bookingUrl?: string
  redirectUrl?: string
  error?: string
  metadata?: Record<string, any>
}

export class AppointmentBookingService {
  private providers: Map<string, BookingProvider> = new Map()
  private activeProvider: string | null = null

  constructor() {
    this.loadProviders()
  }

  private loadProviders() {
    // Load providers from environment variables or database
    const providers: BookingProvider[] = [
      {
        name: 'Acuity Scheduling',
        type: 'acuity',
        config: {
          apiKey: process.env.ACUITY_API_KEY,
          apiSecret: process.env.ACUITY_API_SECRET,
          subdomain: process.env.ACUITY_SUBDOMAIN,
          redirectUrl: process.env.ACUITY_REDIRECT_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/intake/success`
        },
        active: !!(process.env.ACUITY_API_KEY && process.env.ACUITY_API_SECRET)
      },
      {
        name: 'Calendly',
        type: 'calendly',
        config: {
          apiKey: process.env.CALENDLY_API_KEY,
          embedUrl: process.env.CALENDLY_EMBED_URL,
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/intake/success`
        },
        active: !!(process.env.CALENDLY_API_KEY || process.env.CALENDLY_EMBED_URL)
      },
      {
        name: 'SimplePractice',
        type: 'simplepractice',
        config: {
          apiKey: process.env.SIMPLEPRACTICE_API_KEY,
          subdomain: process.env.SIMPLEPRACTICE_SUBDOMAIN,
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/intake/success`
        },
        active: !!(process.env.SIMPLEPRACTICE_API_KEY && process.env.SIMPLEPRACTICE_SUBDOMAIN)
      },
      {
        name: 'Generic Webhook',
        type: 'generic_webhook',
        config: {
          webhookUrl: process.env.BOOKING_WEBHOOK_URL,
          apiKey: process.env.BOOKING_API_KEY,
          redirectUrl: process.env.BOOKING_REDIRECT_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/book-appointment`
        },
        active: !!process.env.BOOKING_WEBHOOK_URL
      },
      {
        name: 'External Embed',
        type: 'embed',
        config: {
          embedUrl: process.env.BOOKING_EMBED_URL,
          redirectUrl: process.env.BOOKING_REDIRECT_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/book-appointment`
        },
        active: !!process.env.BOOKING_EMBED_URL
      }
    ]

    providers.forEach(provider => {
      if (provider.active) {
        this.providers.set(provider.type, provider)
        if (!this.activeProvider) {
          this.activeProvider = provider.type
        }
      }
    })

    // Override with preferred provider if specified
    if (process.env.PREFERRED_BOOKING_PROVIDER && this.providers.has(process.env.PREFERRED_BOOKING_PROVIDER)) {
      this.activeProvider = process.env.PREFERRED_BOOKING_PROVIDER
    }
  }

  public getActiveProvider(): BookingProvider | null {
    if (!this.activeProvider) return null
    return this.providers.get(this.activeProvider) || null
  }

  public getAllProviders(): BookingProvider[] {
    return Array.from(this.providers.values())
  }

  public setActiveProvider(providerType: string): boolean {
    if (this.providers.has(providerType)) {
      this.activeProvider = providerType
      return true
    }
    return false
  }

  public async createAppointment(appointmentData: AppointmentData, userId?: string): Promise<BookingResponse> {
    const provider = this.getActiveProvider()
    if (!provider) {
      return {
        success: false,
        error: 'No active booking provider configured'
      }
    }

    try {
      let result: BookingResponse

      switch (provider.type) {
        case 'acuity':
          result = await this.createAcuityAppointment(appointmentData, provider)
          break
        case 'calendly':
          result = await this.createCalendlyAppointment(appointmentData, provider)
          break
        case 'simplepractice':
          result = await this.createSimplePracticeAppointment(appointmentData, provider)
          break
        case 'generic_webhook':
          result = await this.createWebhookAppointment(appointmentData, provider)
          break
        case 'embed':
          result = this.createEmbedRedirect(appointmentData, provider)
          break
        default:
          result = {
            success: false,
            error: `Unsupported provider type: ${provider.type}`
          }
      }

      // Log the booking attempt
      if (userId) {
        await auditLog({
          action: 'APPOINTMENT_BOOKING_ATTEMPT',
          userId,
          userEmail: appointmentData.patientEmail,
          details: {
            provider: provider.name,
            patientName: appointmentData.patientName,
            success: result.success,
            error: result.error,
            appointmentId: result.appointmentId
          },
          ipAddress: 'system',
          userAgent: 'appointment-booking-service'
        })
      }

      return result
    } catch (error) {
      console.error('Appointment booking error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async createAcuityAppointment(appointmentData: AppointmentData, provider: BookingProvider): Promise<BookingResponse> {
    const { apiKey, apiSecret, subdomain } = provider.config

    if (!apiKey || !apiSecret || !subdomain) {
      return {
        success: false,
        error: 'Acuity configuration incomplete'
      }
    }

    try {
      // Acuity API integration
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const baseUrl = `https://acuityscheduling.com/api/v1`

      // First, get available appointment types
      const typesResponse = await fetch(`${baseUrl}/appointment-types`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      })

      if (!typesResponse.ok) {
        throw new Error('Failed to fetch appointment types from Acuity')
      }

      const appointmentTypes = await typesResponse.json()
      const defaultType = appointmentTypes.find((type: any) => 
        type.name.toLowerCase().includes('consultation') || 
        type.name.toLowerCase().includes('appointment')
      ) || appointmentTypes[0]

      if (!defaultType) {
        throw new Error('No appointment types available')
      }

      // Create the appointment
      const appointmentPayload = {
        appointmentTypeID: defaultType.id,
        firstName: appointmentData.patientName.split(' ')[0],
        lastName: appointmentData.patientName.split(' ').slice(1).join(' ') || '',
        email: appointmentData.patientEmail,
        phone: appointmentData.patientPhone,
        datetime: `${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`,
        notes: appointmentData.notes || `Intake submission ID: ${appointmentData.intakeSubmissionId}`
      }

      const createResponse = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.message || 'Failed to create Acuity appointment')
      }

      const appointment = await createResponse.json()

      return {
        success: true,
        appointmentId: appointment.id.toString(),
        redirectUrl: `https://${subdomain}.acuityscheduling.com/schedule.php`,
        metadata: {
          acuityAppointmentId: appointment.id,
          appointmentType: defaultType.name
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Acuity booking failed'
      }
    }
  }

  private async createCalendlyAppointment(appointmentData: AppointmentData, provider: BookingProvider): Promise<BookingResponse> {
    const { apiKey, embedUrl } = provider.config

    // Calendly typically uses embed URLs or direct scheduling links
    // For API integration, we'd need to use their API to create invitee
    if (embedUrl) {
      const bookingUrl = new URL(embedUrl)
      bookingUrl.searchParams.set('name', appointmentData.patientName)
      bookingUrl.searchParams.set('email', appointmentData.patientEmail)
      
      return {
        success: true,
        bookingUrl: bookingUrl.toString(),
        redirectUrl: bookingUrl.toString()
      }
    }

    if (!apiKey) {
      return {
        success: false,
        error: 'Calendly configuration incomplete'
      }
    }

    // Calendly API v2 integration would go here
    // For now, return the embed URL approach
    return {
      success: false,
      error: 'Calendly API integration not yet implemented'
    }
  }

  private async createSimplePracticeAppointment(appointmentData: AppointmentData, provider: BookingProvider): Promise<BookingResponse> {
    const { apiKey, subdomain } = provider.config

    if (!apiKey || !subdomain) {
      return {
        success: false,
        error: 'SimplePractice configuration incomplete'
      }
    }

    // SimplePractice API integration would go here
    // This is a placeholder for the actual implementation
    return {
      success: false,
      error: 'SimplePractice API integration not yet implemented'
    }
  }

  private async createWebhookAppointment(appointmentData: AppointmentData, provider: BookingProvider): Promise<BookingResponse> {
    const { webhookUrl, apiKey } = provider.config

    if (!webhookUrl) {
      return {
        success: false,
        error: 'Webhook URL not configured'
      }
    }

    try {
      const payload = {
        action: 'create_appointment',
        data: appointmentData,
        timestamp: new Date().toISOString()
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        appointmentId: result.appointmentId,
        bookingUrl: result.bookingUrl,
        redirectUrl: result.redirectUrl || provider.config.redirectUrl,
        metadata: result.metadata
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook booking failed'
      }
    }
  }

  private createEmbedRedirect(appointmentData: AppointmentData, provider: BookingProvider): BookingResponse {
    const { embedUrl, redirectUrl } = provider.config

    if (!embedUrl) {
      return {
        success: false,
        error: 'Embed URL not configured'
      }
    }

    const bookingUrl = new URL(embedUrl)
    
    // Add patient information as URL parameters if supported
    bookingUrl.searchParams.set('name', appointmentData.patientName)
    bookingUrl.searchParams.set('email', appointmentData.patientEmail)
    bookingUrl.searchParams.set('phone', appointmentData.patientPhone)

    return {
      success: true,
      bookingUrl: bookingUrl.toString(),
      redirectUrl: redirectUrl || bookingUrl.toString()
    }
  }

  public async handleWebhook(payload: any, providerType: string): Promise<AppointmentData | null> {
    const provider = this.providers.get(providerType)
    if (!provider) {
      throw new Error(`Unknown provider: ${providerType}`)
    }

    try {
      switch (provider.type) {
        case 'acuity':
          return this.handleAcuityWebhook(payload)
        case 'calendly':
          return this.handleCalendlyWebhook(payload)
        case 'generic_webhook':
          return this.handleGenericWebhook(payload)
        default:
          return null
      }
    } catch (error) {
      console.error(`Webhook handling error for ${providerType}:`, error)
      return null
    }
  }

  private handleAcuityWebhook(payload: any): AppointmentData | null {
    // Handle Acuity webhook payload
    if (payload.action === 'appointment.scheduled') {
      return {
        providerAppointmentId: payload.id.toString(),
        patientName: `${payload.firstName} ${payload.lastName}`,
        patientEmail: payload.email,
        patientPhone: payload.phone || '',
        appointmentDate: payload.date,
        appointmentTime: payload.time,
        appointmentType: payload.appointmentType,
        status: 'scheduled',
        metadata: payload
      }
    }
    return null
  }

  private handleCalendlyWebhook(payload: any): AppointmentData | null {
    // Handle Calendly webhook payload
    if (payload.event === 'invitee.created') {
      const invitee = payload.payload
      return {
        providerAppointmentId: invitee.uuid,
        patientName: invitee.name,
        patientEmail: invitee.email,
        patientPhone: invitee.text_reminder_number || '',
        appointmentDate: invitee.event.start_time.split('T')[0],
        appointmentTime: invitee.event.start_time.split('T')[1],
        appointmentType: invitee.event.event_type.name,
        status: 'scheduled',
        metadata: payload
      }
    }
    return null
  }

  private handleGenericWebhook(payload: any): AppointmentData | null {
    // Handle generic webhook payload
    if (payload.action === 'appointment_scheduled' && payload.data) {
      return {
        providerAppointmentId: payload.data.id,
        patientName: payload.data.patient_name,
        patientEmail: payload.data.patient_email,
        patientPhone: payload.data.patient_phone || '',
        appointmentDate: payload.data.appointment_date,
        appointmentTime: payload.data.appointment_time,
        appointmentType: payload.data.appointment_type || 'Consultation',
        status: 'scheduled',
        metadata: payload
      }
    }
    return null
  }
}

// Export singleton instance
export const appointmentBookingService = new AppointmentBookingService() 