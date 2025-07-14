import type { PatientIntake } from '@prisma/client';
import { OscarApiClient } from './oscar-api';
import { OscarPatientMapper, OscarPatientUtils } from './oscar-patient-mapping';
import { 
  OscarError,
  OscarDataError,
  OscarApiError,
  OscarErrorHandler
} from './oscar-errors';
import { auditLog } from '../audit/audit-logger';
import type { 
  OscarQuickSearchResponse,
  OscarDemographic,
  OscarDemographicResponse,
  OscarApiResponse
} from '../../types/oscar';

/**
 * Patient search result with confidence scoring
 */
export interface PatientSearchResult {
  found: boolean;
  patients: Array<{
    demographicNo: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    healthNumber: string;
    address?: string;
    confidence: 'exact' | 'high' | 'medium' | 'low';
    matchReasons: string[];
  }>;
  searchCriteria: {
    healthNumber: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  timestamp: string;
}

/**
 * Patient creation result with detailed tracking
 */
export interface PatientCreationResult {
  success: boolean;
  demographicNo?: string;
  chartNo?: string;
  errors?: string[];
  warnings?: string[];
  oscarResponse?: any;
  mappingSummary?: Record<string, { original: string; mapped: string }>;
  auditId?: string;
  timestamp: string;
}

/**
 * Duplicate detection scenarios
 */
export enum DuplicateScenario {
  EXACT_MATCH = 'exact_match',
  SIMILAR_MATCH = 'similar_match', 
  NO_MATCH = 'no_match',
  HEALTH_NUMBER_CONFLICT = 'health_number_conflict',
  NAME_MISMATCH = 'name_mismatch'
}

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  scenario: DuplicateScenario;
  confidence: number; // 0-1 score
  existingPatients: PatientSearchResult['patients'];
  recommendedAction: 'create' | 'link' | 'manual_review' | 'reject';
  reasoning: string;
  conflictDetails?: {
    healthNumberMatches: boolean;
    nameMatches: boolean;
    dobMatches: boolean;
    addressMatches: boolean;
  };
}

/**
 * OSCAR Patient Service for patient operations
 */
export class OscarPatientService {
  private oscarApi: OscarApiClient;

  constructor(oscarApi?: OscarApiClient) {
    this.oscarApi = oscarApi || new OscarApiClient();
  }

  /**
   * Search for patients in OSCAR by health insurance number
   */
  async searchPatientByHealthNumber(
    healthNumber: string,
    additionalFilters?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    }
  ): Promise<PatientSearchResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Normalize health number for search
      const normalizedHealthNumber = healthNumber.trim().replace(/\s+/g, '');
      
      if (!normalizedHealthNumber) {
        throw new OscarDataError('Health number is required for patient search', 'missing_required', 'healthNumber');
      }

      await auditLog({
        action: 'OSCAR_PATIENT_SEARCH',
        resource: 'oscar_patient',
        details: {
          searchType: 'health_number',
          healthNumber: this.maskHealthNumber(normalizedHealthNumber),
          hasAdditionalFilters: !!additionalFilters,
          timestamp
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      // Perform the search using OSCAR API
      const searchResponse = await this.oscarApi.searchPatientByHealthNumber(normalizedHealthNumber);

      // Process and score the results
      const searchResult = this.processSearchResults(
        searchResponse,
        {
          healthNumber: normalizedHealthNumber,
          ...additionalFilters
        },
        timestamp
      );

      await auditLog({
        action: 'OSCAR_PATIENT_SEARCH',
        resource: 'oscar_patient',
        details: {
          searchType: 'health_number',
          healthNumber: this.maskHealthNumber(normalizedHealthNumber),
          resultsFound: searchResult.patients.length,
          timestamp,
          success: true
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      return searchResult;

    } catch (error) {
      await auditLog({
        action: 'OSCAR_PATIENT_SEARCH',
        resource: 'oscar_patient',
        details: {
          searchType: 'health_number',
          healthNumber: this.maskHealthNumber(healthNumber),
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp,
          success: false
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      if (error instanceof OscarError) {
        throw error;
      }

      throw new OscarApiError(
        `Patient search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'invalid_response'
      );
    }
  }

  /**
   * Search for patients using PatientIntake data
   */
  async searchPatientByIntakeData(patientIntake: PatientIntake): Promise<PatientSearchResult> {
    return this.searchPatientByHealthNumber(
      patientIntake.healthInformationNumber,
      {
        firstName: patientIntake.legalFirstName,
        lastName: patientIntake.legalLastName,
        dateOfBirth: patientIntake.dateOfBirth
      }
    );
  }

  /**
   * Create a new patient in OSCAR from PatientIntake data
   */
  async createPatient(patientIntake: PatientIntake): Promise<PatientCreationResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Validate the patient data can be mapped to OSCAR format
      const validation = OscarPatientUtils.validateForOscarCreation(patientIntake);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          timestamp
        };
      }

      // Map to OSCAR demographic format
      const oscarDemographic = OscarPatientMapper.mapToOscarDemographic(patientIntake);
      const mappingSummary = OscarPatientUtils.generateMappingSummary(patientIntake, oscarDemographic);

      await auditLog({
        action: 'OSCAR_PATIENT_CREATE',
        resource: 'oscar_patient',
        details: {
          patientId: patientIntake.id,
          healthNumber: this.maskHealthNumber(patientIntake.healthInformationNumber),
          mappingSummary,
          timestamp
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      // Create patient in OSCAR
      const oscarResponse = await this.oscarApi.createPatient(oscarDemographic);

      const result: PatientCreationResult = {
        success: true,
        demographicNo: oscarResponse.demographic_no?.toString(),
        chartNo: oscarResponse.chart_no,
        oscarResponse,
        mappingSummary,
        timestamp
      };

      await auditLog({
        action: 'OSCAR_PATIENT_CREATE',
        resource: 'oscar_patient',
        details: {
          patientId: patientIntake.id,
          healthNumber: this.maskHealthNumber(patientIntake.healthInformationNumber),
          oscarDemographicNo: result.demographicNo,
          oscarChartNo: result.chartNo,
          success: true,
          timestamp
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLog({
        action: 'OSCAR_PATIENT_CREATE',
        resource: 'oscar_patient',
        details: {
          patientId: patientIntake.id,
          healthNumber: this.maskHealthNumber(patientIntake.healthInformationNumber),
          error: errorMessage,
          success: false,
          timestamp
        },
        ipAddress: 'system',
        userAgent: 'oscar-patient-service'
      });

      if (error instanceof OscarError) {
        return {
          success: false,
          errors: [OscarErrorHandler.getUserMessage(error)],
          timestamp
        };
      }

      return {
        success: false,
        errors: [`Patient creation failed: ${errorMessage}`],
        timestamp
      };
    }
  }

  /**
   * Detect duplicate patients and determine the best action
   */
  async detectDuplicates(patientIntake: PatientIntake): Promise<DuplicateDetectionResult> {
    try {
      // Search for existing patients
      const searchResult = await this.searchPatientByIntakeData(patientIntake);

      if (!searchResult.found || searchResult.patients.length === 0) {
        return {
          scenario: DuplicateScenario.NO_MATCH,
          confidence: 1.0,
          existingPatients: [],
          recommendedAction: 'create',
          reasoning: 'No existing patients found with matching health insurance number'
        };
      }

      // Analyze each potential duplicate
      let bestMatch: typeof searchResult.patients[0] | null = null;
      let highestConfidence = 0;
      const conflictDetails = {
        healthNumberMatches: false,
        nameMatches: false,
        dobMatches: false,
        addressMatches: false
      };

      for (const patient of searchResult.patients) {
        const analysis = this.analyzePatientMatch(patientIntake, patient);
        
        if (analysis.confidence > highestConfidence) {
          highestConfidence = analysis.confidence;
          bestMatch = patient;
          Object.assign(conflictDetails, analysis.details);
        }
      }

      // Determine scenario and recommended action
      return this.determineDuplicateScenario(
        patientIntake,
        searchResult.patients,
        bestMatch,
        highestConfidence,
        conflictDetails
      );

    } catch (error) {
      // If search fails, default to manual review
      return {
        scenario: DuplicateScenario.NO_MATCH,
        confidence: 0,
        existingPatients: [],
        recommendedAction: 'manual_review',
        reasoning: `Unable to search for duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process OSCAR search response and score results
   */
  private processSearchResults(
    searchResponse: OscarQuickSearchResponse,
    searchCriteria: PatientSearchResult['searchCriteria'],
    timestamp: string
  ): PatientSearchResult {
    const patients = (searchResponse.results || []).map(patient => {
      const confidence = this.calculateMatchConfidence(patient, searchCriteria);
      const matchReasons = this.generateMatchReasons(patient, searchCriteria);

      return {
        demographicNo: patient.demographic_no?.toString() || '',
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        dateOfBirth: patient.date_of_birth || '',
        healthNumber: patient.hin || '',
        address: patient.address ? `${patient.address}, ${patient.city}` : undefined,
        confidence,
        matchReasons
      };
    });

    // Sort by confidence score
    patients.sort((a, b) => {
      const confidenceOrder = { exact: 4, high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    return {
      found: patients.length > 0,
      patients,
      searchCriteria,
      timestamp
    };
  }

  /**
   * Calculate match confidence based on search criteria
   */
  private calculateMatchConfidence(
    patient: any,
    criteria: PatientSearchResult['searchCriteria']
  ): 'exact' | 'high' | 'medium' | 'low' {
    let score = 0;
    let maxScore = 1; // Health number is required

    // Health number match (required for any result)
    if (patient.hin?.replace(/\s+/g, '') === criteria.healthNumber?.replace(/\s+/g, '')) {
      score += 4;
    }
    maxScore += 4;

    // Name matching
    if (criteria.firstName && criteria.lastName) {
      maxScore += 3;
      const firstNameMatch = this.fuzzyMatch(patient.first_name, criteria.firstName);
      const lastNameMatch = this.fuzzyMatch(patient.last_name, criteria.lastName);
      
      if (firstNameMatch > 0.9 && lastNameMatch > 0.9) {
        score += 3;
      } else if (firstNameMatch > 0.7 && lastNameMatch > 0.7) {
        score += 2;
      } else if (firstNameMatch > 0.5 && lastNameMatch > 0.5) {
        score += 1;
      }
    }

    // Date of birth matching
    if (criteria.dateOfBirth) {
      maxScore += 2;
      if (this.normalizeDateForComparison(patient.date_of_birth) === 
          this.normalizeDateForComparison(criteria.dateOfBirth)) {
        score += 2;
      }
    }

    const confidenceRatio = score / maxScore;

    if (confidenceRatio >= 0.95) return 'exact';
    if (confidenceRatio >= 0.80) return 'high';
    if (confidenceRatio >= 0.60) return 'medium';
    return 'low';
  }

  /**
   * Generate human-readable match reasons
   */
  private generateMatchReasons(
    patient: any,
    criteria: PatientSearchResult['searchCriteria']
  ): string[] {
    const reasons: string[] = [];

    // Health number
    if (patient.hin?.replace(/\s+/g, '') === criteria.healthNumber?.replace(/\s+/g, '')) {
      reasons.push('Health insurance number matches exactly');
    }

    // Names
    if (criteria.firstName && criteria.lastName) {
      const firstNameMatch = this.fuzzyMatch(patient.first_name, criteria.firstName);
      const lastNameMatch = this.fuzzyMatch(patient.last_name, criteria.lastName);
      
      if (firstNameMatch > 0.9 && lastNameMatch > 0.9) {
        reasons.push('Name matches exactly');
      } else if (firstNameMatch > 0.7 && lastNameMatch > 0.7) {
        reasons.push('Name matches closely');
      } else if (firstNameMatch > 0.5 && lastNameMatch > 0.5) {
        reasons.push('Name has similarities');
      }
    }

    // Date of birth
    if (criteria.dateOfBirth) {
      if (this.normalizeDateForComparison(patient.date_of_birth) === 
          this.normalizeDateForComparison(criteria.dateOfBirth)) {
        reasons.push('Date of birth matches exactly');
      }
    }

    return reasons.length > 0 ? reasons : ['Health insurance number search result'];
  }

  /**
   * Analyze patient match for duplicate detection
   */
  private analyzePatientMatch(
    patientIntake: PatientIntake,
    oscarPatient: PatientSearchResult['patients'][0]
  ) {
    const healthNumberMatch = this.normalizeHealthNumber(patientIntake.healthInformationNumber) === 
                              this.normalizeHealthNumber(oscarPatient.healthNumber);
    
    const nameMatch = this.fuzzyMatch(
      `${patientIntake.legalFirstName} ${patientIntake.legalLastName}`.toLowerCase(),
      `${oscarPatient.firstName} ${oscarPatient.lastName}`.toLowerCase()
    );

    const dobMatch = this.normalizeDateForComparison(patientIntake.dateOfBirth) === 
                     this.normalizeDateForComparison(oscarPatient.dateOfBirth);

    let confidence = 0;
    if (healthNumberMatch) confidence += 0.4;
    if (nameMatch > 0.8) confidence += 0.3;
    if (dobMatch) confidence += 0.3;

    return {
      confidence,
      details: {
        healthNumberMatches: healthNumberMatch,
        nameMatches: nameMatch > 0.8,
        dobMatches: dobMatch,
        addressMatches: false // Would need address comparison logic
      }
    };
  }

  /**
   * Determine duplicate scenario and recommended action
   */
  private determineDuplicateScenario(
    patientIntake: PatientIntake,
    existingPatients: PatientSearchResult['patients'],
    bestMatch: PatientSearchResult['patients'][0] | null,
    confidence: number,
    conflictDetails: DuplicateDetectionResult['conflictDetails']
  ): DuplicateDetectionResult {
    if (!bestMatch || confidence < 0.3) {
      return {
        scenario: DuplicateScenario.NO_MATCH,
        confidence: 1 - confidence,
        existingPatients,
        recommendedAction: 'create',
        reasoning: 'No strong matches found, safe to create new patient'
      };
    }

    if (confidence >= 0.9 && conflictDetails?.healthNumberMatches && conflictDetails?.nameMatches && conflictDetails?.dobMatches) {
      return {
        scenario: DuplicateScenario.EXACT_MATCH,
        confidence,
        existingPatients,
        recommendedAction: 'link',
        reasoning: 'Exact match found - link to existing OSCAR patient',
        conflictDetails
      };
    }

    if (conflictDetails?.healthNumberMatches && !conflictDetails?.nameMatches) {
      return {
        scenario: DuplicateScenario.HEALTH_NUMBER_CONFLICT,
        confidence,
        existingPatients,
        recommendedAction: 'manual_review',
        reasoning: 'Health number matches but name differs - requires manual review',
        conflictDetails
      };
    }

    if (confidence >= 0.7) {
      return {
        scenario: DuplicateScenario.SIMILAR_MATCH,
        confidence,
        existingPatients,
        recommendedAction: 'manual_review',
        reasoning: 'Similar patient found - manual review recommended to avoid duplicates',
        conflictDetails
      };
    }

    return {
      scenario: DuplicateScenario.NO_MATCH,
      confidence: 1 - confidence,
      existingPatients,
      recommendedAction: 'create',
      reasoning: 'Confidence level too low for duplicate - safe to create new patient',
      conflictDetails
    };
  }

  /**
   * Utility: Fuzzy string matching
   */
  private fuzzyMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    // Simple Levenshtein distance-based similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Utility: Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Utility: Normalize date for comparison
   */
  private normalizeDateForComparison(date: string): string {
    if (!date) return '';
    
    // Handle various date formats and convert to YYYY-MM-DD
    const parts = date.split(/[-\/]/);
    if (parts.length === 3) {
      // Detect format based on first part length
      if (parts[0].length === 4) {
        // YYYY-MM-DD or YYYY/MM/DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        // DD-MM-YYYY or DD/MM/YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    return date;
  }

  /**
   * Utility: Normalize health number for comparison
   */
  private normalizeHealthNumber(healthNumber: string): string {
    return healthNumber?.replace(/\s+/g, '').replace(/-/g, '') || '';
  }

  /**
   * Utility: Mask health number for logging (HIPAA/PIPEDA compliance)
   */
  private maskHealthNumber(healthNumber: string): string {
    if (!healthNumber || healthNumber.length < 4) {
      return '***';
    }
    return healthNumber.substring(0, 2) + '*'.repeat(healthNumber.length - 4) + healthNumber.substring(healthNumber.length - 2);
  }
}

// Export singleton instance
export const oscarPatientService = new OscarPatientService(); 