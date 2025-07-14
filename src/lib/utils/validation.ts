export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: string) => ValidationResult
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d\s\-\(\)\.]{7,15}$/,
  phoneClean: /^[\+]?[1-9][\d]{7,15}$/,
  name: /^[a-zA-Z\s'\-\.]{2,50}$/,
  canadianPostal: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  usZip: /^\d{5}(-\d{4})?$/,
  dateFormat: /^\d{2}-\d{2}-\d{4}$/,
  streetAddress: /^[a-zA-Z0-9\s,'\-\.#]{5,100}$/,
  city: /^[a-zA-Z\s'\-\.]{2,50}$/,
  relationship: /^[a-zA-Z\s'\-\.]{2,30}$/
}

// Utility functions
export const cleanPhone = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\.]/g, '')
}

export const formatPhone = (phone: string): string => {
  const cleaned = cleanPhone(phone)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export const normalizePostalCode = (postal: string): string => {
  return postal.toUpperCase().replace(/\s+/g, ' ').trim()
}

export const isValidAge = (dateOfBirth: string, minAge = 0, maxAge = 150): boolean => {
  if (!ValidationPatterns.dateFormat.test(dateOfBirth)) return false
  
  const [day, month, year] = dateOfBirth.split('-').map(Number)
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge && age - 1 <= maxAge
  }
  
  return age >= minAge && age <= maxAge
}

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention - remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove only < and > for XSS prevention
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export const sanitizeNameInput = (input: string): string => {
  // Less aggressive sanitization for names - allow quotes and apostrophes
  return input
    .replace(/[<>]/g, '') // Remove only < and > for XSS prevention
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

// Enhanced validation functions
export const validateName = (name: string, fieldName: string, required = true): ValidationResult => {
  const sanitized = sanitizeNameInput(name)
  
  if (required && (!sanitized || sanitized.length === 0)) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  if (sanitized && sanitized.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` }
  }
  
  if (sanitized && sanitized.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` }
  }
  
  if (sanitized && !ValidationPatterns.name.test(sanitized)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods` }
  }
  
  return { isValid: true }
}

export const validateEmail = (email: string, required = true): ValidationResult => {
  const sanitized = sanitizeInput(email)
  
  if (required && (!sanitized || sanitized.length === 0)) {
    return { isValid: false, error: 'Email address is required' }
  }
  
  if (sanitized && sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }
  
  if (sanitized && !ValidationPatterns.email.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@example.com)' }
  }
  
  return { isValid: true }
}

export const validatePhone = (phone: string, required = true): ValidationResult => {
  const sanitized = sanitizeInput(phone)
  const cleaned = cleanPhone(sanitized)
  
  if (required && (!sanitized || sanitized.length === 0)) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  if (sanitized && !ValidationPatterns.phone.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g., (555) 123-4567)' }
  }
  
  if (sanitized && cleaned.length < 7) {
    return { isValid: false, error: 'Phone number must be at least 7 digits' }
  }
  
  if (sanitized && cleaned.length > 15) {
    return { isValid: false, error: 'Phone number must be less than 15 digits' }
  }
  
  if (sanitized && !ValidationPatterns.phoneClean.test(cleaned)) {
    return { isValid: false, error: 'Phone number contains invalid characters' }
  }
  
  return { isValid: true }
}

export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
  const sanitized = sanitizeInput(dateOfBirth)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Date of birth is required' }
  }
  
  if (!ValidationPatterns.dateFormat.test(sanitized)) {
    return { isValid: false, error: 'Please use DD-MM-YYYY format (e.g., 15-03-1990)' }
  }
  
  const [day, month, year] = sanitized.split('-').map(Number)
  
  // Validate ranges
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Day must be between 1 and 31' }
  }
  
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 1 and 12' }
  }
  
  if (year < 1900 || year > new Date().getFullYear()) {
    return { isValid: false, error: 'Please enter a valid year' }
  }
  
  // Validate actual date
  const date = new Date(year, month - 1, day)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return { isValid: false, error: 'Please enter a valid date' }
  }
  
  // Check if date is in the future
  if (date > new Date()) {
    return { isValid: false, error: 'Date of birth cannot be in the future' }
  }
  
  // Check reasonable age limits
  if (!isValidAge(sanitized, 0, 150)) {
    return { isValid: false, error: 'Please enter a valid date of birth' }
  }
  
  return { isValid: true }
}

export const validateAddress = (address: string, fieldName: string): ValidationResult => {
  const sanitized = sanitizeInput(address)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  if (sanitized.length < 5) {
    return { isValid: false, error: `${fieldName} must be at least 5 characters` }
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: `${fieldName} must be less than 100 characters` }
  }
  
  if (!ValidationPatterns.streetAddress.test(sanitized)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` }
  }
  
  return { isValid: true }
}

export const validateCity = (city: string): ValidationResult => {
  const sanitized = sanitizeNameInput(city)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'City is required' }
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters' }
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, error: 'City must be less than 50 characters' }
  }
  
  if (!ValidationPatterns.city.test(sanitized)) {
    return { isValid: false, error: 'City can only contain letters, spaces, hyphens, apostrophes, and periods' }
  }
  
  return { isValid: true }
}

export const validatePostalCode = (postalCode: string): ValidationResult => {
  const sanitized = sanitizeInput(postalCode)
  const normalized = normalizePostalCode(sanitized)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Postal/ZIP code is required' }
  }
  
  const isCanadian = ValidationPatterns.canadianPostal.test(normalized)
  const isUSZip = ValidationPatterns.usZip.test(normalized)
  
  if (!isCanadian && !isUSZip) {
    return { 
      isValid: false, 
      error: 'Please enter a valid postal code (e.g., M5V 3A8) or ZIP code (e.g., 12345)' 
    }
  }
  
  return { isValid: true }
}

export const validateProvinceState = (provinceState: string): ValidationResult => {
  const sanitized = sanitizeInput(provinceState)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Province/State is required' }
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Please select a valid province/state' }
  }
  
  return { isValid: true }
}

export const validateRelationship = (relationship: string): ValidationResult => {
  const sanitized = sanitizeNameInput(relationship)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Relationship is required' }
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Please specify the relationship' }
  }
  
  if (sanitized.length > 30) {
    return { isValid: false, error: 'Relationship must be less than 30 characters' }
  }
  
  if (!ValidationPatterns.relationship.test(sanitized)) {
    return { isValid: false, error: 'Relationship can only contain letters, spaces, hyphens, apostrophes, and periods' }
  }
  
  return { isValid: true }
}

export const validatePrivacyPolicy = (agreed: boolean): ValidationResult => {
  if (!agreed) {
    return { 
      isValid: false, 
      error: 'You must agree to the Privacy & Data-Use Policy to continue' 
    }
  }
  
  return { isValid: true }
}

// Main validation function for patient intake data
export const validatePatientIntakeField = (
  fieldName: string, 
  value: string | boolean
): ValidationResult => {
  const stringValue = typeof value === 'string' ? value : ''
  const booleanValue = typeof value === 'boolean' ? value : false
  
  switch (fieldName) {
    case 'legalFirstName':
      return validateName(stringValue, 'Legal first name', true)
    
    case 'legalLastName':
      return validateName(stringValue, 'Legal last name', true)
    
    case 'middleName':
      return validateName(stringValue, 'Middle name', false)
    
    case 'preferredName':
      return validateName(stringValue, 'Preferred name', false)
    
    case 'title':
      // Title is optional, no specific validation needed beyond basic sanitization
      return { isValid: true }
    
    case 'dateOfBirth':
      return validateDateOfBirth(stringValue)
    
    case 'gender':
      // Gender is optional, validate if provided
      if (stringValue && !['M', 'F', 'O', 'U'].includes(stringValue)) {
        return { isValid: false, error: 'Please select a valid gender option' }
      }
      return { isValid: true }
    
    case 'phoneNumber':
      return validatePhone(stringValue, true)
    
    case 'cellPhone':
      return validatePhone(stringValue, false)
    
    case 'workPhone':
      return validatePhone(stringValue, false)
    
    case 'emailAddress':
      return validateEmail(stringValue, true)
    
    case 'streetAddress':
      return validateAddress(stringValue, 'Street address')
    
    case 'city':
      return validateCity(stringValue)
    
    case 'provinceState':
      return validateProvinceState(stringValue)
    
    case 'postalZipCode':
      return validatePostalCode(stringValue)
    
    case 'nextOfKinName':
      return validateName(stringValue, 'Next of kin name', true)
    
    case 'nextOfKinPhone':
      return validatePhone(stringValue, true)
    
    case 'relationshipToPatient':
      return validateRelationship(stringValue)
    
    case 'primaryLanguage':
      // Primary language is optional, no specific validation needed
      return { isValid: true }
    
    case 'preferredLanguage':
      // Preferred language is optional, no specific validation needed
      return { isValid: true }
    
    case 'newsletterOptIn':
      // Newsletter opt-in is boolean, always valid
      return { isValid: true }
    
    case 'privacyPolicyAgreed':
      return validatePrivacyPolicy(booleanValue)
    
    case 'healthInformationNumber':
      if (!stringValue || stringValue.length < 8) return { isValid: false, error: 'Health Information Number is required.' }
      return { isValid: true }
    
    default:
      return { isValid: true }
  }
}

// Validate entire form
export const validateIntakeForm = (formData: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  let isValid = true
  
  // Define required fields
  const requiredFields = [
    'legalFirstName', 'legalLastName', 'dateOfBirth', 'phoneNumber',
    'emailAddress', 'streetAddress', 'city', 'provinceState', 'postalZipCode',
    'nextOfKinName', 'nextOfKinPhone', 'relationshipToPatient',
    'privacyPolicyAgreed'
  ]
  
  requiredFields.forEach(field => {
    const result = validatePatientIntakeField(field, formData[field])
    if (!result.isValid && result.error) {
      errors[field] = result.error
      isValid = false
    }
  })
  
  // Optional field validation
  if (formData.preferredName && formData.preferredName.trim() !== '') {
    const result = validatePatientIntakeField('preferredName', formData.preferredName)
    if (!result.isValid && result.error) {
      errors.preferredName = result.error
      isValid = false
    }
  }
  
  return { isValid, errors }
} 