import type { PatientIntake } from '@prisma/client';
import type { OscarDemographic, OscarQuickSearchResult } from '../../types/oscar';
import { OscarDataError } from './oscar-errors';

/**
 * Mapping configuration for PatientIntake fields to OSCAR demographic fields
 */
export interface PatientFieldMapping {
  // Required fields mapping
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD format for OSCAR
  gender: string;
  healthNumber: string;
  
  // Address mapping
  address: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Contact information
  homePhone: string;
  email: string;
  
  // Next of kin mapping
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Optional fields
  preferredName?: string;
  middleName?: string;
  cellPhone?: string;
  workPhone?: string;
}

/**
 * OSCAR demographic field requirements and validation rules
 */
export const OSCAR_DEMOGRAPHIC_REQUIREMENTS = {
  // Required fields for OSCAR patient creation
  REQUIRED_FIELDS: [
    'firstName',
    'lastName', 
    'dateOfBirth',
    'gender',
    'healthNumber'
  ] as const,
  
  // Field length limits in OSCAR
  FIELD_LIMITS: {
    firstName: 30,
    lastName: 30,
    middleName: 30,
    preferredName: 30,
    title: 10,
    address: 60,
    city: 25,
    province: 2,
    postalCode: 7,
    homePhone: 20,
    cellPhone: 20,
    workPhone: 20,
    email: 60,
    healthNumber: 12,
    emergencyContactName: 30,
    emergencyContactPhone: 20,
    emergencyContactRelationship: 20,
    primaryLanguage: 30,
    preferredLanguage: 30
  },
  
  // Valid values for specific fields
  VALID_VALUES: {
    gender: ['M', 'F', 'O', 'U'] as const, // Male, Female, Other, Unknown
    province: [
      'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ] as const,
    relationships: [
      'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other', 'Guardian', 'Power of Attorney'
    ] as const
  },
  
  // Field patterns for validation
  PATTERNS: {
    postalCode: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    phone: /^[\d\s\-\(\)\+\.]{10,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    healthNumber: /^[\d\-\s]{6,12}$/
  }
};

/**
 * Service for mapping patient intake data to OSCAR demographic format
 */
export class OscarPatientMapper {
  
  /**
   * Map PatientIntake to OSCAR demographic format
   */
  static mapToOscarDemographic(patientIntake: PatientIntake): OscarDemographic {
    try {
      // Validate required fields exist
      this.validateRequiredFields(patientIntake);
      
      // Extract and normalize data
      const mapped: OscarDemographic = {
        // Personal Information
        firstName: this.normalizeField(patientIntake.legalFirstName, 'firstName'),
        lastName: this.normalizeField(patientIntake.legalLastName, 'lastName'),
        dateOfBirth: this.normalizeDateOfBirth(patientIntake.dateOfBirth),
        healthNumber: this.normalizeHealthNumber(patientIntake.healthInformationNumber),
        
        // Additional Personal Information (Optional)
        title: patientIntake.title ? this.normalizeField(patientIntake.title, 'title') : undefined,
        sexDesc: patientIntake.gender ? this.normalizeGender(patientIntake.gender) : undefined,
        alias: patientIntake.preferredName ? this.normalizeField(patientIntake.preferredName, 'preferredName') : undefined,
        
        // Address Information
        address: this.normalizeField(patientIntake.streetAddress, 'address'),
        city: this.normalizeField(patientIntake.city, 'city'),
        province: this.normalizeProvince(patientIntake.provinceState),
        postalCode: this.normalizePostalCode(patientIntake.postalZipCode),
        
        // Contact Information
        phoneNumber: this.normalizePhone(patientIntake.phoneNumber),
        email: this.normalizeEmail(patientIntake.emailAddress),
        
        // Language Preferences (Optional)
        spokenLanguage: patientIntake.primaryLanguage ? this.normalizeField(patientIntake.primaryLanguage, 'primaryLanguage') : undefined,
        officialLanguage: patientIntake.preferredLanguage ? this.normalizeField(patientIntake.preferredLanguage, 'preferredLanguage') : undefined,
        
        // Communication Preferences (Optional)
      };
      
      // Validate mapped data
      this.validateMappedData(mapped);
      
      return mapped;
    } catch (error) {
      if (error instanceof OscarDataError) {
        throw error;
      }
      throw new OscarDataError(
        `Failed to map patient data to OSCAR format: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'mapping'
      );
    }
  }
  
  /**
   * Map PatientIntake to OSCAR quick search parameters
   */
  static mapToQuickSearchParams(patientIntake: PatientIntake): { keyword: string; searchType: string; startIndex: number; limit: number } {
    return {
      keyword: this.normalizeHealthNumber(patientIntake.healthInformationNumber),
      searchType: 'hin', // Search by health insurance number
      startIndex: 0,
      limit: 10
    };
  }
  
  /**
   * Map OSCAR demographic response back to PatientIntake update data
   */
  static mapFromOscarDemographic(
    oscarDemographic: any, 
    originalIntake: PatientIntake
  ): Partial<PatientIntake> {
    return {
      oscarDemographicNo: oscarDemographic.demographic_no?.toString(),
      oscarCreatedAt: new Date(),
      oscarLastSyncAt: new Date()
    };
  }
  
  /**
   * Validate that all required fields are present
   */
  private static validateRequiredFields(patientIntake: PatientIntake): void {
    const missing: string[] = [];
    
    if (!patientIntake.legalFirstName?.trim()) missing.push('legalFirstName');
    if (!patientIntake.legalLastName?.trim()) missing.push('legalLastName');
    if (!patientIntake.dateOfBirth?.trim()) missing.push('dateOfBirth');
    if (!patientIntake.healthInformationNumber?.trim()) missing.push('healthInformationNumber');
    if (!patientIntake.phoneNumber?.trim()) missing.push('phoneNumber');
    if (!patientIntake.emailAddress?.trim()) missing.push('emailAddress');
    if (!patientIntake.streetAddress?.trim()) missing.push('streetAddress');
    if (!patientIntake.city?.trim()) missing.push('city');
    if (!patientIntake.provinceState?.trim()) missing.push('provinceState');
    if (!patientIntake.postalZipCode?.trim()) missing.push('postalZipCode');
    if (!patientIntake.nextOfKinName?.trim()) missing.push('nextOfKinName');
    if (!patientIntake.nextOfKinPhone?.trim()) missing.push('nextOfKinPhone');
    if (!patientIntake.relationshipToPatient?.trim()) missing.push('relationshipToPatient');
    
    if (missing.length > 0) {
      throw new OscarDataError(
        `Missing required fields for OSCAR patient creation: ${missing.join(', ')}`,
        'missing_required'
      );
    }
  }
  
  /**
   * Normalize and validate a generic field
   */
  private static normalizeField(value: string, fieldName: keyof typeof OSCAR_DEMOGRAPHIC_REQUIREMENTS.FIELD_LIMITS): string {
    if (!value?.trim()) {
      throw new OscarDataError(`${fieldName} cannot be empty`, 'validation', fieldName);
    }
    
    const normalized = value.trim();
    const limit = OSCAR_DEMOGRAPHIC_REQUIREMENTS.FIELD_LIMITS[fieldName];
    
    if (normalized.length > limit) {
      throw new OscarDataError(
        `${fieldName} exceeds maximum length of ${limit} characters`,
        'validation',
        fieldName,
        normalized
      );
    }
    
    return normalized;
  }
  
  /**
   * Normalize date of birth from DD-MM-YYYY to YYYY-MM-DD
   */
  private static normalizeDateOfBirth(dateOfBirth: string): string {
    if (!dateOfBirth?.trim()) {
      throw new OscarDataError('Date of birth is required', 'missing_required', 'dateOfBirth');
    }
    
    // Expected format: DD-MM-YYYY or DD/MM/YYYY
    const normalized = dateOfBirth.trim();
    const parts = normalized.split(/[-\/]/);
    
    if (parts.length !== 3) {
      throw new OscarDataError(
        'Date of birth must be in DD-MM-YYYY or DD/MM/YYYY format',
        'format_invalid',
        'dateOfBirth',
        normalized
      );
    }
    
    const [day, month, year] = parts;
    
    // Validate date components
    if (!/^\d{1,2}$/.test(day) || parseInt(day) < 1 || parseInt(day) > 31) {
      throw new OscarDataError('Invalid day in date of birth', 'format_invalid', 'dateOfBirth', normalized);
    }
    
    if (!/^\d{1,2}$/.test(month) || parseInt(month) < 1 || parseInt(month) > 12) {
      throw new OscarDataError('Invalid month in date of birth', 'format_invalid', 'dateOfBirth', normalized);
    }
    
    if (!/^\d{4}$/.test(year)) {
      throw new OscarDataError('Invalid year in date of birth', 'format_invalid', 'dateOfBirth', normalized);
    }
    
    // Return in OSCAR format: YYYY-MM-DD
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  /**
   * Map gender - OSCAR expects M/F/O/U
   */
  private static mapGender(patientIntake: PatientIntake): string {
    // Since we don't have gender in current PatientIntake model, we'll use 'U' (Unknown) for now
    // This would need to be added to the intake form in the future
    return 'U';
  }
  
  /**
   * Normalize health insurance number
   */
  private static normalizeHealthNumber(healthNumber: string): string {
    if (!healthNumber?.trim()) {
      throw new OscarDataError('Health insurance number is required', 'missing_required', 'healthNumber');
    }
    
    const normalized = healthNumber.trim().replace(/\s+/g, '');
    
    if (!OSCAR_DEMOGRAPHIC_REQUIREMENTS.PATTERNS.healthNumber.test(healthNumber)) {
      throw new OscarDataError(
        'Invalid health insurance number format',
        'format_invalid',
        'healthNumber',
        normalized
      );
    }
    
    return normalized;
  }
  
  /**
   * Normalize phone number
   */
  private static normalizePhone(phone: string): string {
    if (!phone?.trim()) {
      throw new OscarDataError('Phone number is required', 'missing_required', 'phone');
    }
    
    const normalized = phone.trim();
    
    if (!OSCAR_DEMOGRAPHIC_REQUIREMENTS.PATTERNS.phone.test(normalized)) {
      throw new OscarDataError(
        'Invalid phone number format',
        'format_invalid',
        'phone',
        normalized
      );
    }
    
    return normalized;
  }
  
  /**
   * Normalize email address
   */
  private static normalizeEmail(email: string): string {
    if (!email?.trim()) {
      throw new OscarDataError('Email address is required', 'missing_required', 'email');
    }
    
    const normalized = email.trim().toLowerCase();
    
    if (!OSCAR_DEMOGRAPHIC_REQUIREMENTS.PATTERNS.email.test(normalized)) {
      throw new OscarDataError(
        'Invalid email address format',
        'format_invalid',
        'email',
        normalized
      );
    }
    
    if (normalized.length > OSCAR_DEMOGRAPHIC_REQUIREMENTS.FIELD_LIMITS.email) {
      throw new OscarDataError(
        `Email address exceeds maximum length of ${OSCAR_DEMOGRAPHIC_REQUIREMENTS.FIELD_LIMITS.email} characters`,
        'validation',
        'email',
        normalized
      );
    }
    
    return normalized;
  }
  
  /**
   * Normalize province/state to 2-letter code
   */
  private static normalizeProvince(province: string): string {
    if (!province?.trim()) {
      throw new OscarDataError('Province/state is required', 'missing_required', 'province');
    }
    
    const normalized = province.trim().toUpperCase();
    
    // Map common province names to codes
    const provinceMap: Record<string, string> = {
      'ALBERTA': 'AB',
      'BRITISH COLUMBIA': 'BC',
      'MANITOBA': 'MB',
      'NEW BRUNSWICK': 'NB',
      'NEWFOUNDLAND AND LABRADOR': 'NL',
      'NOVA SCOTIA': 'NS',
      'NORTHWEST TERRITORIES': 'NT',
      'NUNAVUT': 'NU',
      'ONTARIO': 'ON',
      'PRINCE EDWARD ISLAND': 'PE',
      'QUEBEC': 'QC',
      'SASKATCHEWAN': 'SK',
      'YUKON': 'YT'
    };
    
    // Check if it's already a valid code
    if (OSCAR_DEMOGRAPHIC_REQUIREMENTS.VALID_VALUES.province.includes(normalized as any)) {
      return normalized;
    }
    
    // Try to map from full name
    const mappedCode = provinceMap[normalized];
    if (mappedCode) {
      return mappedCode;
    }
    
    throw new OscarDataError(
      `Invalid or unsupported province/state: ${normalized}`,
      'validation',
      'province',
      normalized
    );
  }
  
  /**
   * Normalize gender code for OSCAR
   */
  private static normalizeGender(gender: string): string {
    if (!gender?.trim()) {
      return 'U'; // Unknown/Unspecified
    }
    
    const normalized = gender.trim().toUpperCase();
    
    // Valid OSCAR gender codes: M, F, O, U
    if (['M', 'F', 'O', 'U'].includes(normalized)) {
      return normalized;
    }
    
    throw new OscarDataError(
      `Invalid gender code: ${normalized}. Must be M, F, O, or U`,
      'validation',
      'gender',
      normalized
    );
  }
  
  /**
   * Normalize postal code for Canadian format
   */
  private static normalizePostalCode(postalCode: string): string {
    if (!postalCode?.trim()) {
      throw new OscarDataError('Postal code is required', 'missing_required', 'postalCode');
    }
    
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, ' ');
    
    if (!OSCAR_DEMOGRAPHIC_REQUIREMENTS.PATTERNS.postalCode.test(normalized)) {
      throw new OscarDataError(
        'Invalid postal code format (expected: A1A 1A1)',
        'format_invalid',
        'postalCode',
        normalized
      );
    }
    
    // Ensure consistent format with space
    return normalized.replace(/([A-Z]\d[A-Z])[\s-]?(\d[A-Z]\d)/, '$1 $2');
  }
  
  /**
   * Normalize relationship to standard OSCAR values
   */
  private static normalizeRelationship(relationship: string): string {
    if (!relationship?.trim()) {
      throw new OscarDataError('Relationship is required', 'missing_required', 'relationship');
    }
    
    const normalized = relationship.trim();
    
    // Map common variations to standard values
    const relationshipMap: Record<string, string> = {
      'husband': 'Spouse',
      'wife': 'Spouse',
      'partner': 'Spouse',
      'mother': 'Parent',
      'father': 'Parent',
      'mom': 'Parent',
      'dad': 'Parent',
      'son': 'Child',
      'daughter': 'Child',
      'brother': 'Sibling',
      'sister': 'Sibling',
      'guardian': 'Guardian',
      'poa': 'Power of Attorney',
      'power of attorney': 'Power of Attorney'
    };
    
    // Check if it's already a valid relationship
    const validRelationship = OSCAR_DEMOGRAPHIC_REQUIREMENTS.VALID_VALUES.relationships
      .find(rel => rel.toLowerCase() === normalized.toLowerCase());
    
    if (validRelationship) {
      return validRelationship;
    }
    
    // Try to map from common variations
    const mappedRelationship = relationshipMap[normalized.toLowerCase()];
    if (mappedRelationship) {
      return mappedRelationship;
    }
    
    // Default to 'Other' for unrecognized relationships
    return 'Other';
  }
  
  /**
   * Validate the complete mapped data
   */
  private static validateMappedData(demographic: OscarDemographic): void {
    // Validate all required fields are present and valid
    if (!demographic.firstName?.trim()) {
      throw new OscarDataError('Mapped first name is empty', 'validation', 'firstName');
    }
    
    if (!demographic.lastName?.trim()) {
      throw new OscarDataError('Mapped last name is empty', 'validation', 'lastName');
    }
    
    if (!demographic.dateOfBirth?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new OscarDataError('Mapped date of birth is invalid', 'validation', 'dateOfBirth');
    }
    
    if (!demographic.healthNumber?.trim()) {
      throw new OscarDataError('Mapped health insurance number is empty', 'validation', 'healthNumber');
    }
    
    // Validate date is not in the future
    const birthDate = new Date(demographic.dateOfBirth);
    if (birthDate > new Date()) {
      throw new OscarDataError('Date of birth cannot be in the future', 'validation', 'dateOfBirth');
    }
    
    // Validate reasonable age (not older than 150 years)
    const age = (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age > 150) {
      throw new OscarDataError('Date of birth indicates unrealistic age', 'validation', 'dateOfBirth');
    }
  }
}

/**
 * Utility functions for patient data handling
 */
export class OscarPatientUtils {
  
  /**
   * Generate a summary of mapping differences for audit logging
   */
  static generateMappingSummary(
    original: PatientIntake, 
    mapped: OscarDemographic
  ): Record<string, { original: string; mapped: string }> {
    return {
      name: {
        original: `${original.legalFirstName} ${original.legalLastName}`,
        mapped: `${mapped.firstName} ${mapped.lastName}`
      },
      dateOfBirth: {
        original: original.dateOfBirth,
        mapped: mapped.dateOfBirth
      },
      address: {
        original: `${original.streetAddress}, ${original.city}, ${original.provinceState} ${original.postalZipCode}`,
        mapped: `${mapped.address}, ${mapped.city}, ${mapped.province} ${mapped.postalCode}`
      },
      contact: {
        original: `${original.phoneNumber} / ${original.emailAddress}`,
        mapped: `${mapped.phoneNumber} / ${mapped.email}`
      }
    };
  }
  
  /**
   * Validate if a patient can be safely created in OSCAR
   */
  static validateForOscarCreation(patientIntake: PatientIntake): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      OscarPatientMapper.mapToOscarDemographic(patientIntake);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof OscarDataError) {
        errors.push(error.message);
      } else {
        errors.push('Unknown validation error occurred');
      }
      
      return { valid: false, errors };
    }
  }
  
  /**
   * Check if patient already has OSCAR integration
   */
  static hasOscarIntegration(patientIntake: PatientIntake): boolean {
    return !!(patientIntake.oscarDemographicNo && patientIntake.oscarCreatedAt);
  }
  
  /**
   * Check if patient data needs re-sync with OSCAR
   */
  static needsOscarSync(patientIntake: PatientIntake, maxSyncAge: number = 24 * 60 * 60 * 1000): boolean {
    if (!this.hasOscarIntegration(patientIntake)) {
      return true; // Needs initial sync
    }
    
    if (!patientIntake.oscarLastSyncAt) {
      return true; // Never synced
    }
    
    const lastSync = new Date(patientIntake.oscarLastSyncAt);
    const now = new Date();
    
    return (now.getTime() - lastSync.getTime()) > maxSyncAge;
  }
} 