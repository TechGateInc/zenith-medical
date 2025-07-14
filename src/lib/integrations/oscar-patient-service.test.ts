import { jest } from '@jest/globals';
import { OscarPatientService, DuplicateScenario } from './oscar-patient-service';
import { OscarPatientMapper, OscarPatientUtils } from './oscar-patient-mapping';
import { OscarApiClient } from './oscar-api';
import {
  OscarError,
  OscarDataError,
  OscarApiError,
  OscarErrorHandler
} from './oscar-errors';
import { auditLog } from '../audit/audit-logger';
import type { PatientIntake } from '@prisma/client';

// Mock dependencies
jest.mock('./oscar-api');
jest.mock('./oscar-patient-mapping');
jest.mock('../audit/audit-logger');

describe('OscarPatientService', () => {
  let patientService: OscarPatientService;
  let mockOscarApi: jest.Mocked<OscarApiClient>;
  let mockPatientIntake: PatientIntake;

  beforeEach(() => {
    // Setup mocks
    mockOscarApi = {
      searchPatientByHealthNumber: jest.fn(),
      createPatient: jest.fn(),
      getProviders: jest.fn(),
      isConfigured: jest.fn().mockReturnValue(true)
    } as any;

    patientService = new OscarPatientService(mockOscarApi);

    // Mock patient intake data
    mockPatientIntake = {
      id: 'test-patient-id',
      legalFirstName: 'John',
      legalLastName: 'Doe',
      preferredName: null,
      dateOfBirth: '15-06-1990',
      phoneNumber: '(555) 123-4567',
      emailAddress: 'john.doe@email.com',
      healthInformationNumber: '1234567890',
      streetAddress: '123 Main St',
      city: 'Toronto',
      provinceState: 'Ontario',
      postalZipCode: 'M5V 3A1',
      nextOfKinName: 'Jane Doe',
      nextOfKinPhone: '(555) 987-6543',
      relationshipToPatient: 'Spouse',
      privacyPolicyAccepted: true,
      consentTimestamp: new Date(),
      status: 'SUBMITTED',
      appointmentBooked: false,
      appointmentBookedAt: null,
      viewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'test-agent',
      oscarDemographicNo: null,
      oscarCreatedAt: null,
      oscarLastSyncAt: null
    } as PatientIntake;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('searchPatientByHealthNumber', () => {
    it('should search for patients successfully with health number only', async () => {
      // Mock OSCAR API response
      const mockOscarResponse = {
        results: [
          {
            demographic_no: '12345',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1990-06-15',
            hin: '1234567890',
            address: '123 Main St',
            city: 'Toronto'
          }
        ]
      };

      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue(mockOscarResponse);

      const result = await patientService.searchPatientByHealthNumber('1234567890');

      expect(result.found).toBe(true);
      expect(result.patients).toHaveLength(1);
      expect(result.patients[0]).toMatchObject({
        demographicNo: '12345',
        firstName: 'John',
        lastName: 'Doe',
        healthNumber: '1234567890',
        confidence: expect.any(String)
      });
      expect(result.searchCriteria.healthNumber).toBe('1234567890');
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_SEARCH',
          resource: 'oscar_patient'
        })
      );
    });

    it('should search with additional filters', async () => {
      const mockOscarResponse = { results: [] };
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue(mockOscarResponse);

      const result = await patientService.searchPatientByHealthNumber(
        '1234567890',
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        }
      );

      expect(result.found).toBe(false);
      expect(result.searchCriteria).toMatchObject({
        healthNumber: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '15-06-1990'
      });
    });

    it('should throw error for empty health number', async () => {
      await expect(
        patientService.searchPatientByHealthNumber('')
      ).rejects.toThrow(OscarDataError);
    });

    it('should handle API errors gracefully', async () => {
      mockOscarApi.searchPatientByHealthNumber.mockRejectedValue(
        new OscarApiError('API Error', 'server_error', 500)
      );

      await expect(
        patientService.searchPatientByHealthNumber('1234567890')
      ).rejects.toThrow(OscarApiError);

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_SEARCH',
          details: expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        })
      );
    });

    it('should mask health numbers in audit logs', async () => {
      const mockOscarResponse = { results: [] };
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue(mockOscarResponse);

      await patientService.searchPatientByHealthNumber('1234567890');

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            healthNumber: '12****90' // Properly masked
          })
        })
      );
    });
  });

  describe('searchPatientByIntakeData', () => {
    it('should use patient intake data for search', async () => {
      const mockOscarResponse = { results: [] };
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue(mockOscarResponse);

      const result = await patientService.searchPatientByIntakeData(mockPatientIntake);

      expect(mockOscarApi.searchPatientByHealthNumber).toHaveBeenCalledWith(
        '1234567890',
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        })
      );
    });
  });

  describe('createPatient', () => {
    beforeEach(() => {
      // Mock validation and mapping
      (OscarPatientUtils.validateForOscarCreation as jest.Mock).mockReturnValue({
        valid: true,
        errors: []
      });

      (OscarPatientMapper.mapToOscarDemographic as jest.Mock).mockReturnValue({
        first_name: 'John',
        last_name: 'Doe',
        hin: '1234567890'
      });

      (OscarPatientUtils.generateMappingSummary as jest.Mock).mockReturnValue({
        name: { original: 'John Doe', mapped: 'John Doe' }
      });
    });

    it('should create patient successfully', async () => {
      const mockOscarResponse = {
        demographic_no: '54321',
        chart_no: 'CH123',
        success: true
      };

      mockOscarApi.createPatient.mockResolvedValue(mockOscarResponse);

      const result = await patientService.createPatient(mockPatientIntake);

      expect(result.success).toBe(true);
      expect(result.demographicNo).toBe('54321');
      expect(result.chartNo).toBe('CH123');
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_CREATE',
          details: expect.objectContaining({
            success: true,
            oscarDemographicNo: '54321'
          })
        })
      );
    });

    it('should handle validation errors', async () => {
      (OscarPatientUtils.validateForOscarCreation as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Missing required field: firstName']
      });

      const result = await patientService.createPatient(mockPatientIntake);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing required field: firstName');
      expect(mockOscarApi.createPatient).not.toHaveBeenCalled();
    });

    it('should handle API creation errors', async () => {
      const apiError = new OscarApiError('Creation failed', 'validation', 400);
      mockOscarApi.createPatient.mockRejectedValue(apiError);

      const result = await patientService.createPatient(mockPatientIntake);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(OscarErrorHandler.getUserMessage(apiError));
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_CREATE',
          details: expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        })
      );
    });

    it('should handle mapping errors', async () => {
      (OscarPatientMapper.mapToOscarDemographic as jest.Mock).mockImplementation(() => {
        throw new OscarDataError('Invalid data format', 'format_invalid');
      });

      const result = await patientService.createPatient(mockPatientIntake);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('detectDuplicates', () => {
    it('should detect no duplicates when no patients found', async () => {
      // Mock search to return no results
      const spy = jest.spyOn(patientService, 'searchPatientByIntakeData');
      spy.mockResolvedValue({
        found: false,
        patients: [],
        searchCriteria: { healthNumber: '1234567890' },
        timestamp: new Date().toISOString()
      });

      const result = await patientService.detectDuplicates(mockPatientIntake);

      expect(result.scenario).toBe(DuplicateScenario.NO_MATCH);
      expect(result.confidence).toBe(1.0);
      expect(result.recommendedAction).toBe('create');
      expect(result.reasoning).toContain('No existing patients found');
    });

    it('should detect exact match', async () => {
      const mockExistingPatient = {
        demographicNo: '12345',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-06-15',
        healthNumber: '1234567890',
        confidence: 'exact' as const,
        matchReasons: ['Exact match']
      };

      const spy = jest.spyOn(patientService, 'searchPatientByIntakeData');
      spy.mockResolvedValue({
        found: true,
        patients: [mockExistingPatient],
        searchCriteria: { healthNumber: '1234567890' },
        timestamp: new Date().toISOString()
      });

      const result = await patientService.detectDuplicates(mockPatientIntake);

      expect(result.scenario).toBe(DuplicateScenario.EXACT_MATCH);
      expect(result.recommendedAction).toBe('link');
      expect(result.existingPatients).toHaveLength(1);
      expect(result.reasoning).toContain('Exact match found');
    });

    it('should detect health number conflict', async () => {
      const mockConflictingPatient = {
        demographicNo: '12345',
        firstName: 'Jane', // Different name
        lastName: 'Smith', // Different name  
        dateOfBirth: '1985-03-20', // Different DOB
        healthNumber: '1234567890', // Same health number
        confidence: 'medium' as const,
        matchReasons: ['Health number matches']
      };

      const spy = jest.spyOn(patientService, 'searchPatientByIntakeData');
      spy.mockResolvedValue({
        found: true,
        patients: [mockConflictingPatient],
        searchCriteria: { healthNumber: '1234567890' },
        timestamp: new Date().toISOString()
      });

      const result = await patientService.detectDuplicates(mockPatientIntake);

      expect(result.scenario).toBe(DuplicateScenario.HEALTH_NUMBER_CONFLICT);
      expect(result.recommendedAction).toBe('manual_review');
      expect(result.reasoning).toContain('Health number matches but name differs');
    });

    it('should detect similar match requiring review', async () => {
      const mockSimilarPatient = {
        demographicNo: '12345',
        firstName: 'Jon', // Similar name
        lastName: 'Doe',
        dateOfBirth: '1990-06-15',
        healthNumber: '1234567890',
        confidence: 'high' as const,
        matchReasons: ['Name matches closely', 'DOB matches']
      };

      const spy = jest.spyOn(patientService, 'searchPatientByIntakeData');
      spy.mockResolvedValue({
        found: true,
        patients: [mockSimilarPatient],
        searchCriteria: { healthNumber: '1234567890' },
        timestamp: new Date().toISOString()
      });

      const result = await patientService.detectDuplicates(mockPatientIntake);

      expect(result.scenario).toBe(DuplicateScenario.SIMILAR_MATCH);
      expect(result.recommendedAction).toBe('manual_review');
    });

    it('should handle search errors gracefully', async () => {
      const spy = jest.spyOn(patientService, 'searchPatientByIntakeData');
      spy.mockRejectedValue(new Error('Search failed'));

      const result = await patientService.detectDuplicates(mockPatientIntake);

      expect(result.scenario).toBe(DuplicateScenario.NO_MATCH);
      expect(result.recommendedAction).toBe('manual_review');
      expect(result.reasoning).toContain('Unable to search for duplicates');
    });
  });

  describe('confidence scoring', () => {
    const testConfidenceScoring = (
      patientData: any,
      searchCriteria: any,
      expectedConfidence: 'exact' | 'high' | 'medium' | 'low'
    ) => {
      const result = (patientService as any).calculateMatchConfidence(patientData, searchCriteria);
      expect(result).toBe(expectedConfidence);
    };

    it('should score exact matches correctly', () => {
      testConfidenceScoring(
        {
          hin: '1234567890',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-06-15'
        },
        {
          healthNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        },
        'exact'
      );
    });

    it('should score partial matches correctly', () => {
      testConfidenceScoring(
        {
          hin: '1234567890',
          first_name: 'Jon', // Slightly different
          last_name: 'Doe',
          date_of_birth: '1990-06-15'
        },
        {
          healthNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        },
        'high'
      );
    });

    it('should score low confidence correctly', () => {
      testConfidenceScoring(
        {
          hin: '1234567890',
          first_name: 'Jane', // Very different
          last_name: 'Smith', // Very different
          date_of_birth: '1985-01-01' // Different
        },
        {
          healthNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        },
        'low'
      );
    });
  });

  describe('utility functions', () => {
    it('should perform fuzzy matching correctly', () => {
      const fuzzyMatch = (patientService as any).fuzzyMatch;
      
      expect(fuzzyMatch('John', 'John')).toBe(1); // Exact match
      expect(fuzzyMatch('John', 'Jon')).toBeGreaterThan(0.8); // Close match
      expect(fuzzyMatch('John', 'Jane')).toBeLessThan(0.6); // Different
      expect(fuzzyMatch('', '')).toBe(1); // Both empty
      expect(fuzzyMatch('John', '')).toBe(0); // One empty
    });

    it('should normalize dates correctly', () => {
      const normalizeDateForComparison = (patientService as any).normalizeDateForComparison;
      
      expect(normalizeDateForComparison('15-06-1990')).toBe('1990-06-15');
      expect(normalizeDateForComparison('15/06/1990')).toBe('1990-06-15');
      expect(normalizeDateForComparison('1990-06-15')).toBe('1990-06-15');
      expect(normalizeDateForComparison('1990/06/15')).toBe('1990-06-15');
      expect(normalizeDateForComparison('')).toBe('');
    });

    it('should normalize health numbers correctly', () => {
      const normalizeHealthNumber = (patientService as any).normalizeHealthNumber;
      
      expect(normalizeHealthNumber('123 456 7890')).toBe('1234567890');
      expect(normalizeHealthNumber('123-456-7890')).toBe('1234567890');
      expect(normalizeHealthNumber('1234567890')).toBe('1234567890');
      expect(normalizeHealthNumber('')).toBe('');
    });

    it('should mask health numbers for logging', () => {
      const maskHealthNumber = (patientService as any).maskHealthNumber;
      
      expect(maskHealthNumber('1234567890')).toBe('12****90');
      expect(maskHealthNumber('123')).toBe('***');
      expect(maskHealthNumber('')).toBe('***');
    });
  });

  describe('levenshtein distance', () => {
    it('should calculate edit distance correctly', () => {
      const levenshteinDistance = (patientService as any).levenshteinDistance;
      
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
    });
  });

  describe('match reason generation', () => {
    it('should generate appropriate match reasons', () => {
      const generateMatchReasons = (patientService as any).generateMatchReasons;
      
      const reasons = generateMatchReasons(
        {
          hin: '1234567890',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-06-15'
        },
        {
          healthNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '15-06-1990'
        }
      );
      
      expect(reasons).toContain('Health insurance number matches exactly');
      expect(reasons).toContain('Name matches exactly');
      expect(reasons).toContain('Date of birth matches exactly');
    });

    it('should handle partial matches in reasons', () => {
      const generateMatchReasons = (patientService as any).generateMatchReasons;
      
      const reasons = generateMatchReasons(
        {
          hin: '1234567890',
          first_name: 'Jon', // Similar
          last_name: 'Doe'
        },
        {
          healthNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe'
        }
      );
      
      expect(reasons).toContain('Health insurance number matches exactly');
      expect(reasons).toContain('Name matches closely');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed search responses', async () => {
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue({
        results: null as any // Malformed response
      });

      const result = await patientService.searchPatientByHealthNumber('1234567890');
      
      expect(result.found).toBe(false);
      expect(result.patients).toHaveLength(0);
    });

    it('should handle missing patient fields gracefully', async () => {
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue({
        results: [
          {
            // Missing required fields
            demographic_no: '12345'
          }
        ]
      });

      const result = await patientService.searchPatientByHealthNumber('1234567890');
      
      expect(result.found).toBe(true);
      expect(result.patients[0]).toMatchObject({
        demographicNo: '12345',
        firstName: '',
        lastName: '',
        healthNumber: '',
        dateOfBirth: ''
      });
    });

    it('should handle undefined/null patient data in matching', () => {
      const analyzePatientMatch = (patientService as any).analyzePatientMatch;
      
      const mockPatientWithNullFields = {
        ...mockPatientIntake,
        legalFirstName: null as any,
        dateOfBirth: null as any
      };

      const result = analyzePatientMatch(
        mockPatientWithNullFields,
        {
          demographicNo: '12345',
          firstName: 'John',
          lastName: 'Doe',
          healthNumber: '1234567890',
          dateOfBirth: '1990-06-15',
          confidence: 'medium' as const,
          matchReasons: []
        }
      );
      
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.details).toBeDefined();
    });
  });

  describe('audit logging', () => {
    it('should include proper audit details for successful operations', async () => {
      const mockOscarResponse = { results: [] };
      mockOscarApi.searchPatientByHealthNumber.mockResolvedValue(mockOscarResponse);

      await patientService.searchPatientByHealthNumber('1234567890');

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_SEARCH',
          resource: 'oscar_patient',
          details: expect.objectContaining({
            searchType: 'health_number',
            healthNumber: expect.any(String),
            resultsFound: 0,
            success: true,
            timestamp: expect.any(String)
          }),
          ipAddress: 'system',
          userAgent: 'oscar-patient-service'
        })
      );
    });

    it('should include error details in audit logs', async () => {
      const error = new OscarApiError('Test error', 'server_error', 500);
      mockOscarApi.searchPatientByHealthNumber.mockRejectedValue(error);

      try {
        await patientService.searchPatientByHealthNumber('1234567890');
      } catch (e) {
        // Expected error
      }

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PATIENT_SEARCH',
          details: expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        })
      );
    });
  });
}); 