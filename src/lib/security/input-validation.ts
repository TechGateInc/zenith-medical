import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { logSecurityEvent } from './security-headers'

// Medical-specific validation patterns
export const ValidationPatterns = {
  // Personal Information
  NAME: /^[a-zA-Z\s\-'\.]{1,50}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  
  // Medical Information  
  MEDICAL_RECORD_NUMBER: /^[A-Z0-9]{6,12}$/,
  INSURANCE_ID: /^[A-Z0-9\-]{5,20}$/,
  
  // Address Components
  POSTAL_CODE: /^[A-Z0-9\s\-]{3,10}$/,
  STREET_ADDRESS: /^[a-zA-Z0-9\s\-\.\,\#]{1,100}$/,
  CITY: /^[a-zA-Z\s\-'\.]{1,50}$/,
  
  // System IDs
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  CUID: /^c[^\s-]{8,}$/,
  
  // Content
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  URL: /^https?:\/\/[^\s$.?#].[^\s]*$/,
  
  // Date formats
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Security
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // File names
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/
}

// Dangerous patterns to detect
export const DangerousPatterns = {
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\b(OR|AND)\b.*[=<>])/i,
    /((\'\s*(OR|AND))|(\'\s*\d+\s*=\s*\d+))/i
  ],
  
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe|<object|<embed|<form/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ],
  
  COMMAND_INJECTION: [
    /[;&|`$(){}[\]\\]/,
    /\b(cat|ls|pwd|id|whoami|uname|netstat|ps|kill|rm|mv|cp|chmod|chown)\b/i
  ],
  
  PATH_TRAVERSAL: [
    /\.\.[\/\\]/,
    /\.(exe|bat|cmd|sh|ps1|vbs|jar)$/i,
    /(\/etc\/|\/bin\/|\/usr\/|\/var\/)/i
  ],
  
  LDAP_INJECTION: [
    /[()=*|&!]/,
    /\x00/
  ]
}

export interface ValidationResult {
  isValid: boolean
  sanitized?: any
  errors: string[]
  warnings: string[]
  securityIssues: string[]
}

export class InputValidator {
  private static instance: InputValidator
  
  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator()
    }
    return InputValidator.instance
  }

  // Sanitize HTML content
  public sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return ''
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: []
    })
  }

  // Sanitize plain text
  public sanitizeText(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 1000) // Limit length
  }

  // Validate and sanitize email
  public validateEmail(email: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    if (typeof email !== 'string') {
      result.errors.push('Email must be a string')
      return result
    }

    const sanitized = email.toLowerCase().trim()
    
    if (!ValidationPatterns.EMAIL.test(sanitized)) {
      result.errors.push('Invalid email format')
      return result
    }

    if (sanitized.length > 254) {
      result.errors.push('Email too long')
      return result
    }

    // Check for suspicious patterns
    if (this.containsDangerousPatterns(sanitized, 'XSS')) {
      result.securityIssues.push('Email contains suspicious patterns')
      return result
    }

    result.isValid = true
    result.sanitized = sanitized
    return result
  }

  // Validate and sanitize phone number
  public validatePhone(phone: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    if (typeof phone !== 'string') {
      result.errors.push('Phone must be a string')
      return result
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    if (!ValidationPatterns.PHONE.test(cleaned)) {
      result.errors.push('Invalid phone number format')
      return result
    }

    result.isValid = true
    result.sanitized = cleaned
    return result
  }

  // Validate and sanitize name
  public validateName(name: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    if (typeof name !== 'string') {
      result.errors.push('Name must be a string')
      return result
    }

    const sanitized = this.sanitizeText(name)
    
    if (!ValidationPatterns.NAME.test(sanitized)) {
      result.errors.push('Name contains invalid characters')
      return result
    }

    if (sanitized.length < 1) {
      result.errors.push('Name is required')
      return result
    }

    if (sanitized.length > 50) {
      result.errors.push('Name too long')
      return result
    }

    result.isValid = true
    result.sanitized = sanitized
    return result
  }

  // Validate medical content with strict security
  public validateMedicalContent(content: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    if (typeof content !== 'string') {
      result.errors.push('Content must be a string')
      return result
    }

    // Check for dangerous patterns first
    Object.entries(DangerousPatterns).forEach(([patternType, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          result.securityIssues.push(`Potential ${patternType.toLowerCase()} detected`)
        }
      })
    })

    if (result.securityIssues.length > 0) {
      return result
    }

    // Sanitize HTML content
    const sanitized = this.sanitizeHTML(content)
    
    if (sanitized.length > 10000) {
      result.errors.push('Content too long')
      return result
    }

    result.isValid = true
    result.sanitized = sanitized
    return result
  }

  // Validate file upload
  public validateFileUpload(file: File, allowedTypes: string[], maxSize: number): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    if (!file) {
      result.errors.push('No file provided')
      return result
    }

    // Check file size
    if (file.size > maxSize) {
      result.errors.push(`File size exceeds limit of ${maxSize} bytes`)
      return result
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      result.errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      return result
    }

    // Check filename for safety
    if (!ValidationPatterns.SAFE_FILENAME.test(file.name)) {
      result.securityIssues.push('Unsafe filename')
      return result
    }

    // Additional security checks
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'jar', 'php', 'asp', 'jsp']
    if (dangerousExtensions.includes(fileExtension)) {
      result.securityIssues.push('Potentially dangerous file type')
      return result
    }

    result.isValid = true
    return result
  }

  // Check for dangerous patterns
  private containsDangerousPatterns(input: string, type?: keyof typeof DangerousPatterns): boolean {
    const patternsToCheck = type ? [DangerousPatterns[type]] : Object.values(DangerousPatterns)
    
    return patternsToCheck.some(patternGroup => 
      patternGroup.some(pattern => pattern.test(input))
    )
  }

  // Comprehensive input validation for API requests
  public validateAPIInput(input: any, schema: z.ZodSchema, requestInfo?: {
    ip?: string
    userAgent?: string
    path?: string
  }): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      securityIssues: []
    }

    try {
      // First check for dangerous patterns in string values
      this.recursiveSecurityCheck(input, result)
      
      if (result.securityIssues.length > 0) {
        // Log security event
        if (requestInfo) {
          logSecurityEvent({
            type: 'SECURITY_VIOLATION',
            severity: 'HIGH',
            description: 'Dangerous patterns detected in input',
            ipAddress: requestInfo.ip || 'unknown',
            userAgent: requestInfo.userAgent || 'unknown',
            path: requestInfo.path || 'unknown',
            metadata: {
              securityIssues: result.securityIssues,
              input: typeof input === 'object' ? JSON.stringify(input) : String(input)
            }
          })
        }
        return result
      }

      // Validate with Zod schema
      const validated = schema.parse(input)
      result.isValid = true
      result.sanitized = validated
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      } else {
        result.errors.push('Validation failed')
      }
    }

    return result
  }

  // Recursively check object for security issues
  private recursiveSecurityCheck(obj: any, result: ValidationResult, depth = 0): void {
    // Prevent deep recursion attacks
    if (depth > 10) {
      result.securityIssues.push('Object nesting too deep')
      return
    }

    if (typeof obj === 'string') {
      if (this.containsDangerousPatterns(obj)) {
        result.securityIssues.push('Dangerous patterns detected in string value')
      }
    } else if (Array.isArray(obj)) {
      // Prevent array bombing
      if (obj.length > 1000) {
        result.securityIssues.push('Array too large')
        return
      }
      obj.forEach(item => this.recursiveSecurityCheck(item, result, depth + 1))
    } else if (typeof obj === 'object' && obj !== null) {
      // Prevent object bombing
      if (Object.keys(obj).length > 100) {
        result.securityIssues.push('Object has too many properties')
        return
      }
      Object.values(obj).forEach(value => this.recursiveSecurityCheck(value, result, depth + 1))
    }
  }
}

// Zod schema extensions for medical data
export const MedicalSchemas = {
  patientName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .regex(ValidationPatterns.NAME, 'Invalid name format'),
    
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long'),
    
  phone: z.string()
    .regex(ValidationPatterns.PHONE, 'Invalid phone number'),
    
  dateOfBirth: z.string()
    .regex(ValidationPatterns.DATE_ISO, 'Invalid date format (YYYY-MM-DD)'),
    
  postalCode: z.string()
    .regex(ValidationPatterns.POSTAL_CODE, 'Invalid postal code'),
    
  medicalRecordNumber: z.string()
    .regex(ValidationPatterns.MEDICAL_RECORD_NUMBER, 'Invalid medical record number'),
    
  safeText: z.string()
    .max(1000, 'Text too long')
    .transform((val) => InputValidator.getInstance().sanitizeText(val)),
    
  safeHTML: z.string()
    .max(10000, 'Content too long')
    .transform((val) => InputValidator.getInstance().sanitizeHTML(val)),
    
  uuid: z.string()
    .regex(ValidationPatterns.UUID, 'Invalid UUID format'),
    
  cuid: z.string()
    .regex(ValidationPatterns.CUID, 'Invalid CUID format')
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance() 