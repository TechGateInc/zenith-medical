import { oscarApiClient } from './oscar-api'
import { auditLog } from '../audit/audit-logger'
import { OscarError, OscarApiError, OscarDataError } from './oscar-errors'
import type {
  OscarProvider,
  OscarAppointment,
  OscarAppointmentResponse,
  OscarApiResponse
} from '../../types/oscar'

export interface OscarAppointmentType {
  id: string
  name: string
  duration: number // in minutes
  description?: string
  category?: string
  isActive: boolean
}

export interface OscarTimeSlot {
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  available: boolean
  providerNo: string
  duration: number
}

export interface OscarAvailabilityRequest {
  providerNo: string
  date: string // YYYY-MM-DD format
  appointmentTypeId?: string
  duration?: number // in minutes, defaults to 30
}

export interface OscarAvailabilityResponse {
  success: boolean
  date: string
  providerNo: string
  availableSlots: OscarTimeSlot[]
  error?: string
}

export interface OscarAppointmentBookingRequest {
  // Patient information
  demographicNo: string
  patientName: string
  patientEmail: string
  patientPhone: string
  
  // Appointment details
  providerNo: string
  appointmentDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  duration?: number // in minutes, defaults to 30
  appointmentType?: string
  reason?: string
  notes?: string
  
  // Booking metadata
  bookingSource?: string
  intakeSubmissionId?: string
}

export interface OscarAppointmentBookingResult {
  success: boolean
  appointmentNo?: string
  oscarAppointmentId?: string
  providerName?: string
  appointmentDate?: string
  startTime?: string
  endTime?: string
  message?: string
  error?: string
}

export interface CachedProvider extends OscarProvider {
  cachedAt: Date
  isActive: boolean
  specialties?: string[]
  appointmentTypes?: string[]
}

export interface ProviderCacheEntry {
  providers: CachedProvider[]
  lastUpdated: Date
  expiresAt: Date
}

export class OscarAppointmentService {
  private static instance: OscarAppointmentService
  private providerCache: ProviderCacheEntry | null = null
  private readonly CACHE_DURATION_MINUTES = 60 // Cache providers for 1 hour
  private readonly DEFAULT_APPOINTMENT_DURATION = 30 // minutes
  
  constructor() {
    // Singleton pattern for caching efficiency
  }
  
  public static getInstance(): OscarAppointmentService {
    if (!OscarAppointmentService.instance) {
      OscarAppointmentService.instance = new OscarAppointmentService()
    }
    return OscarAppointmentService.instance
  }

  /**
   * Retrieve all available OSCAR providers with caching
   */
  public async getProviders(forceRefresh: boolean = false): Promise<CachedProvider[]> {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && this.providerCache && this.isProviderCacheValid()) {
        await this.logOperation('PROVIDERS_CACHE_HIT', {
          cachedCount: this.providerCache.providers.length,
          cacheAge: Date.now() - this.providerCache.lastUpdated.getTime()
        })
        return this.providerCache.providers
      }

      // Fetch fresh data from OSCAR
      const response = await oscarApiClient.getProviders()
      
      if (!response.success || !response.data) {
        throw new OscarApiError(
          response.error || 'Failed to retrieve providers from OSCAR',
          500,
          { endpoint: '/oscar/ws/services/providers' }
        )
      }

      // Process and enhance provider data
      const enhancedProviders: CachedProvider[] = response.data.map((provider: OscarProvider) => ({
        ...provider,
        cachedAt: new Date(),
        isActive: this.isProviderActive(provider),
        specialties: this.extractProviderSpecialties(provider),
        appointmentTypes: this.getProviderAppointmentTypes(provider)
      }))

      // Update cache
      this.providerCache = {
        providers: enhancedProviders,
        lastUpdated: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION_MINUTES * 60 * 1000)
      }

      await this.logOperation('PROVIDERS_FETCH_SUCCESS', {
        providersCount: enhancedProviders.length,
        activeProviders: enhancedProviders.filter(p => p.isActive).length
      })

      return enhancedProviders
    } catch (error) {
      await this.logOperation('PROVIDERS_FETCH_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Get a specific provider by provider number
   */
  public async getProvider(providerNo: string): Promise<CachedProvider | null> {
    try {
      const providers = await this.getProviders()
      const provider = providers.find(p => p.providerNo === providerNo)
      
      if (!provider) {
        await this.logOperation('PROVIDER_NOT_FOUND', { providerNo })
        return null
      }

      return provider
    } catch (error) {
      await this.logOperation('PROVIDER_FETCH_ERROR', {
        providerNo,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Get available appointment types (static for now, could be dynamic in future)
   */
  public getAppointmentTypes(): OscarAppointmentType[] {
    return [
      {
        id: 'consultation',
        name: 'Consultation',
        duration: 30,
        description: 'General medical consultation',
        category: 'General',
        isActive: true
      },
      {
        id: 'follow_up',
        name: 'Follow-up Appointment',
        duration: 15,
        description: 'Follow-up visit for existing condition',
        category: 'General',
        isActive: true
      },
      {
        id: 'physical_exam',
        name: 'Physical Examination',
        duration: 45,
        description: 'Comprehensive physical examination',
        category: 'Preventive',
        isActive: true
      },
      {
        id: 'annual_checkup',
        name: 'Annual Check-up',
        duration: 60,
        description: 'Annual wellness visit and screening',
        category: 'Preventive',
        isActive: true
      },
      {
        id: 'urgent_care',
        name: 'Urgent Care',
        duration: 20,
        description: 'Urgent medical care (same-day)',
        category: 'Urgent',
        isActive: true
      }
    ]
  }

  /**
   * Check appointment availability for a specific provider and date
   */
  public async checkAvailability(request: OscarAvailabilityRequest): Promise<OscarAvailabilityResponse> {
    try {
      // Validate request
      if (!request.providerNo || !request.date) {
        throw new OscarDataError('Provider number and date are required for availability check')
      }

      // Verify provider exists
      const provider = await this.getProvider(request.providerNo)
      if (!provider) {
        throw new OscarDataError(`Provider ${request.providerNo} not found`)
      }

      if (!provider.isActive) {
        throw new OscarDataError(`Provider ${request.providerNo} is not active`)
      }

      // For now, we'll generate mock availability since OSCAR availability endpoint
      // implementation varies by installation. In production, this would call:
      // await oscarApiClient.getProviderAvailability(request.providerNo, request.date)
      
      const availableSlots = this.generateAvailabilitySlots(
        request.date,
        request.providerNo,
        request.duration || this.DEFAULT_APPOINTMENT_DURATION
      )

      await this.logOperation('AVAILABILITY_CHECK', {
        providerNo: request.providerNo,
        date: request.date,
        availableSlots: availableSlots.length
      })

      return {
        success: true,
        date: request.date,
        providerNo: request.providerNo,
        availableSlots
      }
    } catch (error) {
      await this.logOperation('AVAILABILITY_CHECK_ERROR', {
        providerNo: request.providerNo,
        date: request.date,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return {
        success: false,
        date: request.date,
        providerNo: request.providerNo,
        availableSlots: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Create an appointment in OSCAR
   */
  public async createAppointment(request: OscarAppointmentBookingRequest): Promise<OscarAppointmentBookingResult> {
    try {
      // Validate request
      this.validateAppointmentRequest(request)

      // Verify provider exists and is active
      const provider = await this.getProvider(request.providerNo)
      if (!provider) {
        throw new OscarDataError(`Provider ${request.providerNo} not found`)
      }

      if (!provider.isActive) {
        throw new OscarDataError(`Provider ${request.providerNo} is not available for appointments`)
      }

      // Calculate end time
      const duration = request.duration || this.DEFAULT_APPOINTMENT_DURATION
      const endTime = this.calculateEndTime(request.startTime, duration)

      // Prepare OSCAR appointment data
      const oscarAppointment: OscarAppointment = {
        providerNo: request.providerNo,
        appointmentDate: request.appointmentDate,
        startTime: request.startTime,
        endTime: endTime,
        demographicNo: request.demographicNo,
        name: request.patientName,
        reason: request.reason || request.appointmentType || 'General Consultation',
        notes: this.buildAppointmentNotes(request),
        type: request.appointmentType || 'consultation',
        bookingSource: request.bookingSource || 'zenith_medical_intake',
        status: 'scheduled'
      }

      // Create appointment in OSCAR
      const response = await oscarApiClient.createAppointment(oscarAppointment)

      if (!response.success) {
        throw new OscarApiError(
          response.error || 'Failed to create appointment in OSCAR',
          500,
          { oscarResponse: response }
        )
      }

      const result: OscarAppointmentBookingResult = {
        success: true,
        appointmentNo: response.appointmentNo,
        oscarAppointmentId: response.appointmentNo,
        providerName: `${provider.firstName} ${provider.lastName}`,
        appointmentDate: request.appointmentDate,
        startTime: request.startTime,
        endTime: endTime,
        message: 'Appointment successfully created in OSCAR'
      }

      await this.logOperation('APPOINTMENT_CREATE_SUCCESS', {
        appointmentNo: response.appointmentNo,
        providerNo: request.providerNo,
        patientName: request.patientName,
        appointmentDate: request.appointmentDate,
        startTime: request.startTime
      })

      return result
    } catch (error) {
      await this.logOperation('APPOINTMENT_CREATE_ERROR', {
        providerNo: request.providerNo,
        patientName: request.patientName,
        appointmentDate: request.appointmentDate,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create appointment'
      }
    }
  }

  /**
   * Map Zenith appointment data to OSCAR format
   */
  public mapToOscarAppointment(appointmentData: any, demographicNo: string, providerNo: string): OscarAppointment {
    const duration = this.getAppointmentDuration(appointmentData.appointmentType)
    const endTime = this.calculateEndTime(appointmentData.appointmentTime, duration)

    return {
      providerNo,
      appointmentDate: appointmentData.appointmentDate,
      startTime: appointmentData.appointmentTime,
      endTime,
      demographicNo,
      name: appointmentData.patientName,
      reason: appointmentData.appointmentType || 'General Consultation',
      notes: appointmentData.notes || '',
      type: appointmentData.appointmentType || 'consultation',
      bookingSource: 'zenith_medical_booking',
      status: 'scheduled'
    }
  }

  // Private helper methods

  private isProviderCacheValid(): boolean {
    return this.providerCache !== null && 
           new Date() < this.providerCache.expiresAt
  }

  private isProviderActive(provider: OscarProvider): boolean {
    // Consider provider active if status is not explicitly 'inactive' or 'disabled'
    return provider.status !== 'inactive' && 
           provider.status !== 'disabled' &&
           provider.status !== '0'
  }

  private extractProviderSpecialties(provider: OscarProvider): string[] {
    // Extract specialties from provider data - this would depend on OSCAR setup
    const specialties: string[] = []
    
    if (provider.practitionerNo) {
      specialties.push('Licensed Practitioner')
    }
    
    if (provider.providerType) {
      specialties.push(provider.providerType)
    }
    
    return specialties
  }

  private getProviderAppointmentTypes(provider: OscarProvider): string[] {
    // Return default appointment types - in production this might be provider-specific
    return ['consultation', 'follow_up', 'physical_exam', 'annual_checkup']
  }

  private generateAvailabilitySlots(date: string, providerNo: string, duration: number): OscarTimeSlot[] {
    // Mock availability generation - replace with actual OSCAR API call
    const slots: OscarTimeSlot[] = []
    const appointmentDate = new Date(date)
    
    // Skip weekends for this example
    if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
      return slots
    }
    
    // Generate slots from 9 AM to 5 PM with specified duration
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const endTime = this.calculateEndTime(startTime, duration)
        
        // Skip lunch hour (12:00-13:00)
        if (hour === 12) continue
        
        slots.push({
          startTime,
          endTime,
          available: Math.random() > 0.3, // 70% availability rate
          providerNo,
          duration
        })
      }
    }
    
    return slots
  }

  private validateAppointmentRequest(request: OscarAppointmentBookingRequest): void {
    const requiredFields = [
      'demographicNo', 'patientName', 'patientEmail', 'patientPhone',
      'providerNo', 'appointmentDate', 'startTime'
    ]
    
    const missingFields = requiredFields.filter(field => 
      !request[field as keyof OscarAppointmentBookingRequest]
    )
    
    if (missingFields.length > 0) {
      throw new OscarDataError(
        `Missing required appointment fields: ${missingFields.join(', ')}`
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(request.appointmentDate)) {
      throw new OscarDataError('Invalid appointment date format. Expected YYYY-MM-DD')
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(request.startTime)) {
      throw new OscarDataError('Invalid start time format. Expected HH:MM')
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(request.patientEmail)) {
      throw new OscarDataError('Invalid email address format')
    }
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  }

  private getAppointmentDuration(appointmentType?: string): number {
    const appointmentTypes = this.getAppointmentTypes()
    const type = appointmentTypes.find(t => t.id === appointmentType)
    return type?.duration || this.DEFAULT_APPOINTMENT_DURATION
  }

  private buildAppointmentNotes(request: OscarAppointmentBookingRequest): string {
    const notes = []
    
    if (request.notes) {
      notes.push(request.notes)
    }
    
    if (request.intakeSubmissionId) {
      notes.push(`Intake Submission ID: ${request.intakeSubmissionId}`)
    }
    
    notes.push(`Contact: ${request.patientEmail} | ${request.patientPhone}`)
    notes.push(`Booked via: ${request.bookingSource || 'Zenith Medical Centre'}`)
    
    return notes.join(' | ')
  }

  private async logOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_APPOINTMENT_${operation}`,
        userId: 'system',
        userEmail: 'oscar-appointment-service',
        resource: 'oscar_appointment',
        details: {
          service: 'OscarAppointmentService',
          operation,
          ...details
        },
        ipAddress: 'system',
        userAgent: 'oscar-appointment-service'
      })
    } catch (error) {
      console.error('Failed to log OSCAR appointment operation:', error)
    }
  }

  /**
   * Clear provider cache (useful for testing or manual refresh)
   */
  public clearProviderCache(): void {
    this.providerCache = null
  }

  /**
   * Get cache status for monitoring
   */
  public getCacheStatus(): { cached: boolean; lastUpdated?: Date; expiresAt?: Date; providerCount?: number } {
    if (!this.providerCache) {
      return { cached: false }
    }

    return {
      cached: true,
      lastUpdated: this.providerCache.lastUpdated,
      expiresAt: this.providerCache.expiresAt,
      providerCount: this.providerCache.providers.length
    }
  }
}

// Export singleton instance
export const oscarAppointmentService = OscarAppointmentService.getInstance() 