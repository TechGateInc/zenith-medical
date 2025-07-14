import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  OscarAppointmentService,
  OscarAppointmentBookingRequest,
  OscarAvailabilityRequest,
  oscarAppointmentService
} from './oscar-appointment-service'
import { oscarApiClient } from './oscar-api'
import { auditLog } from '../audit/audit-logger'

// Mock dependencies
jest.mock('./oscar-api')
jest.mock('../audit/audit-logger')

const mockOscarApiClient = oscarApiClient as jest.Mocked<typeof oscarApiClient>
const mockAuditLog = auditLog as jest.MockedFunction<typeof auditLog>

describe('OscarAppointmentService', () => {
  let service: OscarAppointmentService

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Get fresh instance
    service = OscarAppointmentService.getInstance()
    
    // Clear cache for consistent tests
    service.clearProviderCache()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OscarAppointmentService.getInstance()
      const instance2 = OscarAppointmentService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should return the same instance as exported service', () => {
      expect(oscarAppointmentService).toBe(service)
    })
  })

  describe('getProviders', () => {
    const mockProvidersResponse = {
      success: true,
      data: [
        {
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          practitionerNo: 'P123',
          status: 'active',
          providerType: 'Physician'
        },
        {
          providerNo: '456',
          firstName: 'Dr. Jane',
          lastName: 'Doe',
          practitionerNo: 'P456',
          status: 'inactive',
          providerType: 'Physician'
        }
      ]
    }

    it('should fetch providers successfully', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const providers = await service.getProviders()

      expect(providers).toHaveLength(2)
      expect(providers[0]).toMatchObject({
        providerNo: '123',
        firstName: 'Dr. John',
        lastName: 'Smith',
        isActive: true
      })
      expect(providers[1]).toMatchObject({
        providerNo: '456',
        firstName: 'Dr. Jane',
        lastName: 'Doe',
        isActive: false
      })
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDERS_FETCH_SUCCESS'
        })
      )
    })

    it('should use cached providers on subsequent calls', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      // First call
      await service.getProviders()
      
      // Second call should use cache
      await service.getProviders()

      expect(mockOscarApiClient.getProviders).toHaveBeenCalledTimes(1)
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDERS_CACHE_HIT'
        })
      )
    })

    it('should force refresh when requested', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      // First call
      await service.getProviders()
      
      // Force refresh call
      await service.getProviders(true)

      expect(mockOscarApiClient.getProviders).toHaveBeenCalledTimes(2)
    })

    it('should handle API errors gracefully', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue({
        success: false,
        error: 'API Error'
      })

      await expect(service.getProviders()).rejects.toThrow('API Error')
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDERS_FETCH_ERROR'
        })
      )
    })

    it('should handle network failures', async () => {
      mockOscarApiClient.getProviders.mockRejectedValue(new Error('Network Error'))

      await expect(service.getProviders()).rejects.toThrow('Network Error')
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDERS_FETCH_ERROR'
        })
      )
    })
  })

  describe('getProvider', () => {
    const mockProvidersResponse = {
      success: true,
      data: [
        {
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'active'
        }
      ]
    }

    it('should return specific provider by number', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const provider = await service.getProvider('123')

      expect(provider).toMatchObject({
        providerNo: '123',
        firstName: 'Dr. John',
        lastName: 'Smith'
      })
    })

    it('should return null for non-existent provider', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const provider = await service.getProvider('999')

      expect(provider).toBeNull()
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDER_NOT_FOUND'
        })
      )
    })

    it('should handle errors when fetching providers', async () => {
      mockOscarApiClient.getProviders.mockRejectedValue(new Error('Provider fetch error'))

      await expect(service.getProvider('123')).rejects.toThrow('Provider fetch error')
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_PROVIDER_FETCH_ERROR'
        })
      )
    })
  })

  describe('getAppointmentTypes', () => {
    it('should return predefined appointment types', () => {
      const types = service.getAppointmentTypes()

      expect(types).toHaveLength(5)
      expect(types).toEqual([
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
      ])
    })

    it('should return active appointment types only', () => {
      const types = service.getAppointmentTypes()
      const activeTypes = types.filter(type => type.isActive)

      expect(activeTypes).toHaveLength(types.length)
    })
  })

  describe('checkAvailability', () => {
    const mockAvailabilityRequest: OscarAvailabilityRequest = {
      providerNo: '123',
      date: '2024-07-15',
      duration: 30
    }

    const mockProvidersResponse = {
      success: true,
      data: [
        {
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'active'
        }
      ]
    }

    it('should check availability successfully', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const availability = await service.checkAvailability(mockAvailabilityRequest)

      expect(availability.success).toBe(true)
      expect(availability.date).toBe('2024-07-15')
      expect(availability.providerNo).toBe('123')
      expect(availability.availableSlots).toBeDefined()
      expect(Array.isArray(availability.availableSlots)).toBe(true)
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_AVAILABILITY_CHECK'
        })
      )
    })

    it('should validate required fields', async () => {
      const invalidRequest = { providerNo: '', date: '2024-07-15' }

      const availability = await service.checkAvailability(invalidRequest)

      expect(availability.success).toBe(false)
      expect(availability.error).toContain('Provider number and date are required')
    })

    it('should handle non-existent provider', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue({ success: true, data: [] })

      const availability = await service.checkAvailability(mockAvailabilityRequest)

      expect(availability.success).toBe(false)
      expect(availability.error).toContain('Provider 123 not found')
    })

    it('should handle inactive provider', async () => {
      const inactiveProviderResponse = {
        success: true,
        data: [{
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'inactive'
        }]
      }
      
      mockOscarApiClient.getProviders.mockResolvedValue(inactiveProviderResponse)

      const availability = await service.checkAvailability(mockAvailabilityRequest)

      expect(availability.success).toBe(false)
      expect(availability.error).toContain('Provider 123 is not active')
    })

    it('should generate appropriate time slots', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const availability = await service.checkAvailability(mockAvailabilityRequest)

      expect(availability.success).toBe(true)
      
      const slots = availability.availableSlots
      expect(slots.length).toBeGreaterThan(0)
      
      // Check slot structure
      slots.forEach(slot => {
        expect(slot).toHaveProperty('startTime')
        expect(slot).toHaveProperty('endTime')
        expect(slot).toHaveProperty('available')
        expect(slot).toHaveProperty('providerNo', '123')
        expect(slot).toHaveProperty('duration')
        
        // Validate time format
        expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/)
        expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/)
      })
    })

    it('should handle weekend dates with no slots', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      // Saturday date
      const weekendRequest = { ...mockAvailabilityRequest, date: '2024-07-13' }
      const availability = await service.checkAvailability(weekendRequest)

      expect(availability.success).toBe(true)
      expect(availability.availableSlots).toHaveLength(0)
    })
  })

  describe('createAppointment', () => {
    const mockBookingRequest: OscarAppointmentBookingRequest = {
      demographicNo: 'D123',
      patientName: 'John Doe',
      patientEmail: 'john@example.com',
      patientPhone: '555-1234',
      providerNo: '123',
      appointmentDate: '2024-07-15',
      startTime: '10:00',
      appointmentType: 'consultation',
      notes: 'Regular checkup'
    }

    const mockProvidersResponse = {
      success: true,
      data: [
        {
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'active'
        }
      ]
    }

    const mockOscarResponse = {
      success: true,
      appointmentNo: 'A123456'
    }

    it('should create appointment successfully', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)
      mockOscarApiClient.createAppointment.mockResolvedValue(mockOscarResponse)

      const result = await service.createAppointment(mockBookingRequest)

      expect(result.success).toBe(true)
      expect(result.appointmentNo).toBe('A123456')
      expect(result.oscarAppointmentId).toBe('A123456')
      expect(result.providerName).toBe('Dr. John Smith')
      expect(result.appointmentDate).toBe('2024-07-15')
      expect(result.startTime).toBe('10:00')
      expect(result.endTime).toBe('10:30')
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_APPOINTMENT_CREATE_SUCCESS'
        })
      )
    })

    it('should validate required fields', async () => {
      const invalidRequest = { ...mockBookingRequest, demographicNo: '' }

      const result = await service.createAppointment(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing required appointment fields')
    })

    it('should validate email format', async () => {
      const invalidRequest = { ...mockBookingRequest, patientEmail: 'invalid-email' }

      const result = await service.createAppointment(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email address format')
    })

    it('should validate date format', async () => {
      const invalidRequest = { ...mockBookingRequest, appointmentDate: '07/15/2024' }

      const result = await service.createAppointment(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid appointment date format')
    })

    it('should validate time format', async () => {
      const invalidRequest = { ...mockBookingRequest, startTime: '10:00 AM' }

      const result = await service.createAppointment(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid start time format')
    })

    it('should handle non-existent provider', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue({ success: true, data: [] })

      const result = await service.createAppointment(mockBookingRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Provider 123 not found')
    })

    it('should handle inactive provider', async () => {
      const inactiveProviderResponse = {
        success: true,
        data: [{
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'inactive'
        }]
      }
      
      mockOscarApiClient.getProviders.mockResolvedValue(inactiveProviderResponse)

      const result = await service.createAppointment(mockBookingRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Provider 123 is not available for appointments')
    })

    it('should handle OSCAR API failures', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)
      mockOscarApiClient.createAppointment.mockResolvedValue({
        success: false,
        error: 'OSCAR appointment creation failed'
      })

      const result = await service.createAppointment(mockBookingRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('OSCAR appointment creation failed')
      
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_APPOINTMENT_APPOINTMENT_CREATE_ERROR'
        })
      )
    })

    it('should calculate correct end time based on appointment type', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)
      mockOscarApiClient.createAppointment.mockResolvedValue(mockOscarResponse)

      // Test with physical exam (45 minutes)
      const physicalExamRequest = { ...mockBookingRequest, appointmentType: 'physical_exam' }
      const result = await service.createAppointment(physicalExamRequest)

      expect(result.success).toBe(true)
      expect(result.endTime).toBe('10:45')
    })

    it('should build comprehensive appointment notes', async () => {
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)
      mockOscarApiClient.createAppointment.mockResolvedValue(mockOscarResponse)

      const requestWithIntakeId = { 
        ...mockBookingRequest, 
        intakeSubmissionId: 'intake123',
        bookingSource: 'zenith_portal'
      }

      await service.createAppointment(requestWithIntakeId)

      expect(mockOscarApiClient.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: expect.stringContaining('Intake Submission ID: intake123')
        })
      )
    })
  })

  describe('mapToOscarAppointment', () => {
    const appointmentData = {
      patientName: 'John Doe',
      appointmentDate: '2024-07-15',
      appointmentTime: '10:00',
      appointmentType: 'consultation',
      notes: 'Test appointment'
    }

    it('should map appointment data correctly', () => {
      const mapped = service.mapToOscarAppointment(appointmentData, 'D123', 'P456')

      expect(mapped).toMatchObject({
        providerNo: 'P456',
        appointmentDate: '2024-07-15',
        startTime: '10:00',
        endTime: '10:30',
        demographicNo: 'D123',
        name: 'John Doe',
        reason: 'consultation',
        notes: 'Test appointment',
        type: 'consultation',
        bookingSource: 'zenith_medical_booking',
        status: 'scheduled'
      })
    })

    it('should handle missing appointment type', () => {
      const dataWithoutType = { ...appointmentData, appointmentType: undefined }
      const mapped = service.mapToOscarAppointment(dataWithoutType, 'D123', 'P456')

      expect(mapped.reason).toBe('General Consultation')
      expect(mapped.type).toBe('consultation')
    })

    it('should handle different appointment types with correct durations', () => {
      const annualCheckupData = { ...appointmentData, appointmentType: 'annual_checkup' }
      const mapped = service.mapToOscarAppointment(annualCheckupData, 'D123', 'P456')

      expect(mapped.endTime).toBe('11:00') // 60 minutes for annual checkup
    })
  })

  describe('Cache Management', () => {
    it('should clear provider cache', () => {
      service.clearProviderCache()

      const cacheStatus = service.getCacheStatus()
      expect(cacheStatus.cached).toBe(false)
    })

    it('should provide cache status', async () => {
      const mockProvidersResponse = {
        success: true,
        data: [{ providerNo: '123', firstName: 'Dr. John', lastName: 'Smith', status: 'active' }]
      }
      
      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      // Initially no cache
      let status = service.getCacheStatus()
      expect(status.cached).toBe(false)

      // After fetching providers
      await service.getProviders()
      status = service.getCacheStatus()
      expect(status.cached).toBe(true)
      expect(status.providerCount).toBe(1)
      expect(status.lastUpdated).toBeDefined()
      expect(status.expiresAt).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle audit logging failures gracefully', async () => {
      mockAuditLog.mockRejectedValue(new Error('Audit log error'))
      mockOscarApiClient.getProviders.mockResolvedValue({
        success: true,
        data: []
      })

      // Should not throw even if audit logging fails
      await expect(service.getProviders()).resolves.toEqual([])
    })

    it('should provide meaningful error messages', async () => {
      mockOscarApiClient.getProviders.mockRejectedValue(new Error('Network timeout'))

      await expect(service.getProviders()).rejects.toThrow('Network timeout')
    })
  })

  describe('Time Calculations', () => {
    it('should calculate end time correctly for various durations', () => {
      const testCases = [
        { start: '09:00', duration: 30, expected: '09:30' },
        { start: '14:30', duration: 45, expected: '15:15' },
        { start: '16:45', duration: 60, expected: '17:45' },
        { start: '23:30', duration: 60, expected: '00:30' }
      ]

      testCases.forEach(({ start, duration, expected }) => {
        const mapped = service.mapToOscarAppointment(
          { appointmentTime: start, duration },
          'D123',
          'P456'
        )
        expect(mapped.endTime).toBe(expected)
      })
    })
  })

  describe('Provider Status Detection', () => {
    it('should correctly identify active providers', async () => {
      const mockProvidersResponse = {
        success: true,
        data: [
          { providerNo: '1', status: 'active', firstName: 'A', lastName: 'B' },
          { providerNo: '2', status: '1', firstName: 'C', lastName: 'D' },
          { providerNo: '3', status: 'inactive', firstName: 'E', lastName: 'F' },
          { providerNo: '4', status: 'disabled', firstName: 'G', lastName: 'H' },
          { providerNo: '5', status: '0', firstName: 'I', lastName: 'J' },
          { providerNo: '6', status: 'enabled', firstName: 'K', lastName: 'L' }
        ]
      }

      mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)

      const providers = await service.getProviders()
      const activeProviders = providers.filter(p => p.isActive)
      const inactiveProviders = providers.filter(p => !p.isActive)

      expect(activeProviders).toHaveLength(3) // active, 1, enabled
      expect(inactiveProviders).toHaveLength(3) // inactive, disabled, 0
    })
  })
})

describe('Integration Tests', () => {
  let service: OscarAppointmentService

  beforeEach(() => {
    service = OscarAppointmentService.getInstance()
    service.clearProviderCache()
    jest.clearAllMocks()
  })

  it('should handle complete appointment booking flow', async () => {
    const mockProvidersResponse = {
      success: true,
      data: [
        {
          providerNo: '123',
          firstName: 'Dr. John',
          lastName: 'Smith',
          status: 'active'
        }
      ]
    }

    const mockOscarResponse = {
      success: true,
      appointmentNo: 'A123456'
    }

    mockOscarApiClient.getProviders.mockResolvedValue(mockProvidersResponse)
    mockOscarApiClient.createAppointment.mockResolvedValue(mockOscarResponse)

    // 1. Check availability
    const availability = await service.checkAvailability({
      providerNo: '123',
      date: '2024-07-15'
    })

    expect(availability.success).toBe(true)
    expect(availability.availableSlots.length).toBeGreaterThan(0)

    // 2. Create appointment
    const bookingRequest: OscarAppointmentBookingRequest = {
      demographicNo: 'D123',
      patientName: 'John Doe',
      patientEmail: 'john@example.com',
      patientPhone: '555-1234',
      providerNo: '123',
      appointmentDate: '2024-07-15',
      startTime: availability.availableSlots[0].startTime,
      appointmentType: 'consultation'
    }

    const result = await service.createAppointment(bookingRequest)

    expect(result.success).toBe(true)
    expect(result.oscarAppointmentId).toBe('A123456')
    expect(result.providerName).toBe('Dr. John Smith')

    // Verify API calls
    expect(mockOscarApiClient.getProviders).toHaveBeenCalled()
    expect(mockOscarApiClient.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        providerNo: '123',
        appointmentDate: '2024-07-15',
        demographicNo: 'D123'
      })
    )
  })
}) 