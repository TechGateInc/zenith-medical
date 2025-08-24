'use client'

import { useState, useEffect, useRef } from 'react'
import Button from '../UI/Button'
import { 
  formatPhone, 
  normalizePostalCode,
  sanitizeInput,
  sanitizeNameInput,
  validatePhone,
  validateDateOfBirthYYYYMMDD,
  validateDateYYYYMMDD,
  validateCanadianPostalCode,
  validateHealthNumber
} from '../../lib/utils/validation'
import PrivacyPolicyAgreement from './PrivacyPolicyAgreement'
import { 
  announceToScreenReader,
  formAccessibility,
  responsiveAccessibility
} from '../../lib/utils/accessibility'

// Section 1: Self-enrollment data
export interface Section1Data {
  lastName: string
  firstName: string
  healthNumber: string
  dateOfBirth: string // yyyy/mm/dd format
  sex: string // 'M' or 'F'
  emailAddress: string
  residenceApartmentNumber: string
  residenceStreetAddress: string
  residenceCity: string
  residencePostalCode: string
}

// Section 2: Dependent enrollment data (optional)
export interface DependentData {
  lastName: string
  firstName: string
  healthNumber: string
  dateOfBirth: string // yyyy/mm/dd format
  sex: string // 'M' or 'F'
  relationship: string // 'parent', 'legal guardian', 'attorney for personal care'
  residenceAddressSameAsSection1: boolean
  residenceApartmentNumber: string
  residenceStreetAddress: string
  residenceCity: string
  residencePostalCode: string
}

// Section 3: Emergency Contact & Signature data
export interface Section3Data {
  // Emergency Contact Information
  nextOfKinName: string
  nextOfKinPhone: string
  relationshipToPatient: string
  // Signature Information
  signingFor: string[] // ['myself', 'children', 'dependentAdults']
  patientName: string
  signature: string
  signatureDate: string // yyyy/mm/dd format
  phoneNumber: string
}

// Section 4: Family doctor information (static display)
export interface Section4Data {
  doctorName: string
  isStatic: boolean
}

// Complete patient intake data structure
export interface PatientIntakeData {
  section1: Section1Data
  section2: DependentData[]
  section3: Section3Data
  section4: Section4Data
  privacyPolicyAgreed: boolean
}

interface FormErrors {
  // Section 1 errors
  'section1.lastName'?: string
  'section1.firstName'?: string
  'section1.healthNumber'?: string
  'section1.dateOfBirth'?: string
  'section1.sex'?: string
  'section1.emailAddress'?: string
  'section1.residenceApartmentNumber'?: string
  'section1.residenceStreetAddress'?: string
  'section1.residenceCity'?: string
  'section1.residencePostalCode'?: string
  
  // Section 2 errors (dynamic for multiple dependents)
  [key: string]: string | undefined  // To handle section2[index].fieldName pattern
  
  // Section 3 errors - Emergency Contact
  'section3.nextOfKinName'?: string
  'section3.nextOfKinPhone'?: string
  'section3.relationshipToPatient'?: string
  // Section 3 errors - Signature
  'section3.signingFor'?: string
  'section3.patientName'?: string
  'section3.signature'?: string
  'section3.signatureDate'?: string
  'section3.phoneNumber'?: string
  'section3.workPhone'?: string
  
  // Section 4 - no errors needed (static display)
  
  // Privacy policy
  privacyPolicyAgreed?: string
}

interface IntakeFormProps {
  onSubmit: (data: PatientIntakeData) => Promise<void>
  isSubmitting?: boolean
}

export default function IntakeForm({ onSubmit, isSubmitting = false }: IntakeFormProps) {
  
  const [formData, setFormData] = useState<PatientIntakeData>({
        section1: {
      lastName: '',
      firstName: '',
      healthNumber: '',
      dateOfBirth: '',
      sex: '',
      emailAddress: '',
      residenceApartmentNumber: '',
      residenceStreetAddress: '',
      residenceCity: '',
      residencePostalCode: ''
    },
    section2: [],
    section3: {
      nextOfKinName: '',
      nextOfKinPhone: '',
      relationshipToPatient: '',
      signingFor: [],
      patientName: '',
      signature: '',
      signatureDate: '',
      phoneNumber: ''
    },
    section4: {
      doctorName: 'Dr Oyelayo Gabriel',
      isStatic: true
    },
    privacyPolicyAgreed: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Accessibility initialization
  useEffect(() => {
    const cleanupReducedMotion = responsiveAccessibility.respectReducedMotion()
    const cleanupFocusVisible = responsiveAccessibility.addFocusVisibleSupport()
    
    // Announce form purpose to screen readers
    announceToScreenReader(
      'Patient intake form loaded. Please complete all required fields marked with an asterisk.',
      'polite'
    )

    return () => {
      cleanupReducedMotion?.()
      cleanupFocusVisible?.()
    }
  }, [])

  // Announce validation errors to screen readers
  useEffect(() => {
    const errorCount = Object.keys(errors).filter(key => errors[key as keyof FormErrors]).length
    if (errorCount > 0) {
      formAccessibility.announceFormErrors(errors as Record<string, string>)
      
      // Don't automatically focus error summary to avoid scrolling
      // Users can still access it via keyboard navigation
    }
  }, [errors])

  const validateField = (fieldPath: string, value: string | boolean | string[]): string => {
    // Custom validation for the new form structure
    if (fieldPath === 'privacyPolicyAgreed') {
      return !value ? 'You must agree to the Privacy & Data-Use Policy to continue' : ''
    }
    
    // Section 1 validation
    if (fieldPath.startsWith('section1.')) {
      const field = fieldPath.split('.')[1]
      const stringValue = typeof value === 'string' ? value : ''
      
      switch (field) {
        case 'lastName':
        case 'firstName':
          if (!stringValue.trim()) {
            return `${field === 'lastName' ? 'Last' : 'First'} name is required`
          }
          if (stringValue.length < 2) {
            return `${field === 'lastName' ? 'Last' : 'First'} name must be at least 2 characters`
          }
          if (stringValue.length > 50) {
            return `${field === 'lastName' ? 'Last' : 'First'} name must be less than 50 characters`
          }
          // Allow only letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return `${field === 'lastName' ? 'Last' : 'First'} name contains invalid characters`
          }
          return ''
        case 'healthNumber':
          const healthValidation = validateHealthNumber(stringValue)
          return healthValidation.isValid ? '' : (healthValidation.error || 'Invalid health number')
        case 'residenceStreetAddress':
          if (!stringValue.trim()) {
            return 'Street address is required'
          }
          if (stringValue.length > 100) {
            return 'Street address must be less than 100 characters'
          }
          // Allow alphanumeric, spaces, commas, hyphens, periods, apostrophes, and #
          if (!/^[a-zA-Z0-9\s,'\-\.#]+$/.test(stringValue)) {
            return 'Street address contains invalid characters'
          }
          return ''
        case 'residenceCity':
          if (!stringValue.trim()) {
            return 'City is required'
          }
          if (stringValue.length > 50) {
            return 'City name must be less than 50 characters'
          }
          // Allow letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return 'City name contains invalid characters'
          }
          return ''
        case 'residencePostalCode':
          const postalValidation = validateCanadianPostalCode(stringValue)
          return postalValidation.isValid ? '' : (postalValidation.error || 'Invalid postal code')
        case 'dateOfBirth':
          const dobValidation = validateDateOfBirthYYYYMMDD(stringValue)
          return dobValidation.isValid ? '' : (dobValidation.error || 'Invalid date of birth')
        case 'sex':
          return !stringValue.trim() ? 'Sex is required' : ''
        case 'emailAddress':
          if (!stringValue.trim()) {
            return 'Email address is required'
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
            return 'Please enter a valid email address'
          }
          return ''
      }
    }
    
    // Section 3 validation
    if (fieldPath.startsWith('section3.')) {
      const field = fieldPath.split('.')[1]
      const stringValue = typeof value === 'string' ? value : ''
      
      switch (field) {
        case 'nextOfKinName':
          if (!stringValue.trim()) {
            return 'Next of kin name is required'
          }
          if (stringValue.length > 100) {
            return 'Next of kin name must be less than 100 characters'
          }
          // Allow letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return 'Next of kin name contains invalid characters'
          }
          return ''
        case 'nextOfKinPhone':
          if (!stringValue.trim()) {
            return 'Next of kin phone number is required'
          }
          const nextOfKinPhoneValidation = validatePhone(stringValue, true)
          return nextOfKinPhoneValidation.isValid ? '' : (nextOfKinPhoneValidation.error || 'Invalid next of kin phone number')
        case 'relationshipToPatient':
          if (!stringValue.trim()) {
            return 'Relationship to patient is required'
          }
          if (stringValue.length > 50) {
            return 'Relationship must be less than 50 characters'
          }
          // Allow letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return 'Relationship contains invalid characters'
          }
          return ''
        case 'patientName':
          if (!stringValue.trim()) {
            return 'Patient name is required'
          }
          if (stringValue.length > 100) {
            return 'Patient name must be less than 100 characters'
          }
          // Allow letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return 'Patient name contains invalid characters'
          }
          return ''
        case 'signature':
          if (!stringValue.trim()) {
            return 'Signature is required'
          }
          if (stringValue.length > 100) {
            return 'Signature must be less than 100 characters'
          }
          // Allow letters, spaces, hyphens, apostrophes, and periods
          if (!/^[a-zA-Z\s'\-\.]+$/.test(stringValue)) {
            return 'Signature contains invalid characters'
          }
          return ''
        case 'signatureDate':
          const sigDateValidation = validateDateYYYYMMDD(stringValue)
          return sigDateValidation.isValid ? '' : (sigDateValidation.error || 'Invalid signature date')
        case 'phoneNumber':
          if (!stringValue.trim()) return 'Phone number is required'
          const phoneValidation = validatePhone(stringValue, true)
          return phoneValidation.isValid ? '' : (phoneValidation.error || 'Invalid phone number')
      }
    }
    
    return ''
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let newValue: string | boolean = value
    
    // Handle checkbox
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
    } else {
      // Format specific fields
      if (name.includes('dateOfBirth') || name.includes('signatureDate')) {
        // Auto-format as user types YYYY/MM/DD
        const cleaned = value.replace(/\D/g, '')
        let formatted = cleaned
        if (cleaned.length >= 4) {
          formatted = cleaned.slice(0, 4) + '/' + cleaned.slice(4)
        }
        if (cleaned.length >= 6) {
          formatted = cleaned.slice(0, 4) + '/' + cleaned.slice(4, 6) + '/' + cleaned.slice(6, 8)
        }
        newValue = formatted
      } else if (name.includes('postalCode')) {
        // Normalize postal code formatting
        newValue = normalizePostalCode(value)
      } else if (name.includes('Phone') || name.includes('phoneNumber')) {
        // Format phone as user types but allow partial entry
        const digitsOnly = value.replace(/[^\d]/g, '')
        if (digitsOnly.length <= 3) {
          newValue = digitsOnly
        } else if (digitsOnly.length <= 6) {
          newValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`
        } else if (digitsOnly.length <= 10) {
          newValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
        } else {
          // Don't allow more than 10 digits for Canadian numbers
          const truncated = digitsOnly.slice(0, 10)
          newValue = `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`
        }
      } else if (name.includes('healthNumber')) {
        newValue = value.replace(/[^a-zA-Z0-9]/g, '')
      } else {
        newValue = value
      }
    }
    
    // Update form data based on field path
    if (name === 'privacyPolicyAgreed') {
    setFormData(prev => ({
      ...prev,
        privacyPolicyAgreed: newValue as boolean
      }))
    } else if (name.startsWith('section1.')) {
      const field = name.split('.')[1] as keyof Section1Data
      setFormData(prev => ({
        ...prev,
        section1: {
          ...prev.section1,
          [field]: newValue
        }
      }))
    } else if (name.startsWith('section3.')) {
      const field = name.split('.')[1] as keyof Section3Data
      setFormData(prev => ({
        ...prev,
        section3: {
          ...prev.section3,
          [field]: newValue
        }
      }))
    } else if (name.startsWith('section4.')) {
      const field = name.split('.')[1] as keyof Section4Data
      setFormData(prev => ({
        ...prev,
        section4: {
          ...prev.section4,
          [field]: newValue
        }
      }))
    }
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    let value = fieldName === 'privacyPolicyAgreed' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    
    // Apply sanitization and formatting on blur for better UX
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (fieldName.includes('Name') || fieldName.includes('name')) {
        // Use less aggressive sanitization for name fields
        value = sanitizeNameInput(value)
      } else {
        // Use standard sanitization for other fields
        value = sanitizeInput(value)
      }
      
            // Format specific fields
      if (fieldName.includes('Phone') || fieldName.includes('phoneNumber')) {
        const formatted = formatPhone(value)
        // Update the appropriate section based on field path
        if (fieldName.startsWith('section3.')) {
          const field = fieldName.split('.')[1] as keyof Section3Data
          setFormData(prev => ({
            ...prev,
            section3: {
              ...prev.section3,
              [field]: formatted
            }
          }))
        }
        value = formatted
      } else if (fieldName.includes('postalCode')) {
        const normalized = normalizePostalCode(value)
        // Update the appropriate section
        if (fieldName.startsWith('section1.')) {
          const field = fieldName.split('.')[1] as keyof Section1Data
        setFormData(prev => ({
          ...prev,
            section1: {
              ...prev.section1,
              [field]: normalized
            }
        }))
        }
        value = normalized
      }
    }
    
    const error = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    let isValid = true
    
    // Required fields for Section 1
    const section1RequiredFields = [
      'lastName', 'firstName', 'healthNumber', 'residenceStreetAddress', 
      'residenceCity', 'residencePostalCode', 'dateOfBirth', 'sex', 'emailAddress'
    ]
    
    section1RequiredFields.forEach(field => {
      const fieldPath = `section1.${field}`
      const value = formData.section1[field as keyof Section1Data]
      const error = validateField(fieldPath, value)
      if (error) {
        errors[fieldPath as keyof FormErrors] = error
        isValid = false
      }
    })
    
    // Required fields for Section 3
    const section3RequiredFields = ['nextOfKinName', 'nextOfKinPhone', 'relationshipToPatient', 'patientName', 'signature', 'signatureDate', 'phoneNumber']
    
    section3RequiredFields.forEach(field => {
      const fieldPath = `section3.${field}`
      const value = formData.section3[field as keyof Section3Data]
      const error = validateField(fieldPath, value)
      if (error) {
        errors[fieldPath as keyof FormErrors] = error
        isValid = false
      }
    })
    
    // Privacy policy validation
    const privacyError = validateField('privacyPolicyAgreed', formData.privacyPolicyAgreed)
    if (privacyError) {
      errors.privacyPolicyAgreed = privacyError
      isValid = false
    }
    
    setErrors(errors)
    
    // Mark all fields as touched to show errors
    const touchedFields: Record<string, boolean> = {}
    section1RequiredFields.forEach(field => {
      touchedFields[`section1.${field}`] = true
    })
    section3RequiredFields.forEach(field => {
      touchedFields[`section3.${field}`] = true
    })
    touchedFields['privacyPolicyAgreed'] = true
    touchedFields['section1.emailAddress'] = true
    
    setTouched(touchedFields)
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  // Add dependent to Section 2
  const addDependent = () => {
    const newDependent: DependentData = {
      lastName: '',
      firstName: '',
      healthNumber: '',
      dateOfBirth: '',
      sex: '',
      relationship: '',
      residenceAddressSameAsSection1: false,
      residenceApartmentNumber: '',
      residenceStreetAddress: '',
      residenceCity: '',
      residencePostalCode: ''
    }
    
    setFormData(prev => ({
      ...prev,
      section2: [...prev.section2, newDependent]
    }))
  }

  const removeDependent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      section2: prev.section2.filter((_, i) => i !== index)
    }))
  }

  const inputClassName = (fieldName: string) => {
    const baseClasses = 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-200'
    const isTouched = touched[fieldName]
    const hasError = isTouched && errors[fieldName as keyof FormErrors]
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`
    } else {
      return `${baseClasses} border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white`
    }
  }

  const ValidationMessage = ({ fieldName }: { fieldName: string }) => {
    const isTouched = touched[fieldName]
    const hasError = errors[fieldName as keyof FormErrors]
    
    if (!isTouched || !hasError) return null
    
      return (
        <div className="mt-1 flex items-center space-x-1">
          <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600" role="alert">
            {hasError}
          </p>
        </div>
      )
  }

  // Generate field attributes with accessibility features - REMOVED (unused)

  const hasFormErrors = Object.keys(errors).some(key => errors[key as keyof FormErrors])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Form Title and Description */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Patient Enrollment Form
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Please complete all required sections. Section 2 is optional for enrolling dependents under 16 or dependent adults.
        </p>
      </div>

      {/* Error Summary */}
      {hasFormErrors && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8" role="alert">
          <h2 className="text-lg font-semibold text-red-800 mb-4">
            Please correct the following errors:
          </h2>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            {Object.entries(errors).map(([field, error]) => 
              error ? <li key={field}>{field}: {error}</li> : null
            )}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Section 1 - Self Enrollment */}
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-300 pb-3">
            Section 1 - I want to enrol myself with the family doctor identified in Section 4
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Names */}
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name *
            </label>
            <input
              type="text"
                name="section1.lastName"
                value={formData.section1.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section1.lastName')}
                required
              />
              <ValidationMessage fieldName="section1.lastName" />
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name *
            </label>
            <input
              type="text"
                name="section1.firstName"
                value={formData.section1.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section1.firstName')}
                required
              />
              <ValidationMessage fieldName="section1.firstName" />
          </div>

            {/* Health Number */}
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Health Number *
            </label>
              <input
                type="text"
                name="section1.healthNumber"
                value={formData.section1.healthNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section1.healthNumber')}
                required
              />
              <ValidationMessage fieldName="section1.healthNumber" />
          </div>

            {/* Date of Birth */}
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth (YYYY/MM/DD) *
            </label>
            <input
              type="text"
                name="section1.dateOfBirth"
                value={formData.section1.dateOfBirth}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section1.dateOfBirth')}
                placeholder="YYYY/MM/DD"
                maxLength={10}
                required
              />
              <ValidationMessage fieldName="section1.dateOfBirth" />
            </div>
          </div>

          {/* Sex Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Sex *
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="section1.sex"
                  value="M"
                  checked={formData.section1.sex === 'M'}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                M (Male)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="section1.sex"
                  value="F"
                  checked={formData.section1.sex === 'F'}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                F (Female)
              </label>
            </div>
            <ValidationMessage fieldName="section1.sex" />
          </div>

                    {/* Address */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Apartment #
            </label>
            <input
              type="text"
                  name="section1.residenceApartmentNumber"
                  value={formData.section1.residenceApartmentNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
                  className={inputClassName('section1.residenceApartmentNumber')}
            />
                <ValidationMessage fieldName="section1.residenceApartmentNumber" />
          </div>

          <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Street No. and Name *
            </label>
            <input
              type="text"
                  name="section1.residenceStreetAddress"
                  value={formData.section1.residenceStreetAddress}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={inputClassName('section1.residenceStreetAddress')}
              required
                />
                <ValidationMessage fieldName="section1.residenceStreetAddress" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City/Town *
                </label>
                <input
                  type="text"
                  name="section1.residenceCity"
                  value={formData.section1.residenceCity}
              onChange={handleInputChange}
              onBlur={handleBlur}
                  className={inputClassName('section1.residenceCity')}
                  required
                />
                <ValidationMessage fieldName="section1.residenceCity" />
          </div>

          <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Postal Code *
            </label>
                <input
                  type="text"
                  name="section1.residencePostalCode"
                  value={formData.section1.residencePostalCode}
              onChange={handleInputChange}
              onBlur={handleBlur}
                  className={inputClassName('section1.residencePostalCode')}
                  required
                />
                <ValidationMessage fieldName="section1.residencePostalCode" />
              </div>
          </div>
        </div>

          {/* Email Address */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="section1.emailAddress"
            value={formData.section1.emailAddress}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={inputClassName('section1.emailAddress')}
            placeholder="your.email@example.com"
            required
          />
          <ValidationMessage fieldName="section1.emailAddress" />
        </div>

          
        </section>

        {/* Section 2 - Dependents (Optional) */}
        <section className="bg-blue-50 p-8 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-300 pb-3">
              Section 2 - I want to enrol my child(ren) under 16 and/or dependent adults (Optional)
            </h2>
            <Button
              type="button"
              onClick={addDependent}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Dependent
            </Button>
            </div>

          {formData.section2.length === 0 && (
            <p className="text-slate-600 italic text-center py-8">
              No dependents added. Click &quot;Add Dependent&quot; to enroll children under 16 or dependent adults.
            </p>
          )}

          {formData.section2.map((dependent, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Dependent {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeDependent(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
          </div>
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name={`section2.${index}.lastName`}
                    value={dependent.lastName}
                    onChange={(e) => {
                      const newSection2 = [...formData.section2]
                      newSection2[index] = { ...newSection2[index], lastName: e.target.value }
                      setFormData(prev => ({ ...prev, section2: newSection2 }))
                    }}
                    className={inputClassName(`section2.${index}.lastName`)}
                    required
                  />
                  <ValidationMessage fieldName={`section2.${index}.lastName`} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name={`section2.${index}.firstName`}
                    value={dependent.firstName}
                    onChange={(e) => {
                      const newSection2 = [...formData.section2]
                      newSection2[index] = { ...newSection2[index], firstName: e.target.value }
                      setFormData(prev => ({ ...prev, section2: newSection2 }))
                    }}
                    className={inputClassName(`section2.${index}.firstName`)}
                    required
                  />
                  <ValidationMessage fieldName={`section2.${index}.firstName`} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Health Number *
                  </label>
                  <input
                    type="text"
                    name={`section2.${index}.healthNumber`}
                    value={dependent.healthNumber}
                    onChange={(e) => {
                      const newSection2 = [...formData.section2]
                      newSection2[index] = { ...newSection2[index], healthNumber: e.target.value }
                      setFormData(prev => ({ ...prev, section2: newSection2 }))
                    }}
                    className={inputClassName(`section2.${index}.healthNumber`)}
                    required
                  />
                  <ValidationMessage fieldName={`section2.${index}.healthNumber`} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth (YYYY/MM/DD) *
                  </label>
                  <input
                    type="text"
                    name={`section2.${index}.dateOfBirth`}
                    value={dependent.dateOfBirth}
                    onChange={(e) => {
                      const value = e.target.value
                      // Auto-format as user types YYYY/MM/DD
                      const cleaned = value.replace(/\D/g, '')
                      let formatted = cleaned
                      if (cleaned.length >= 4) {
                        formatted = cleaned.slice(0, 4) + '/' + cleaned.slice(4)
                      }
                      if (cleaned.length >= 6) {
                        formatted = cleaned.slice(0, 4) + '/' + cleaned.slice(4, 6) + '/' + cleaned.slice(6, 8)
                      }
                      
                      const newSection2 = [...formData.section2]
                      newSection2[index] = { ...newSection2[index], dateOfBirth: formatted }
                      setFormData(prev => ({ ...prev, section2: newSection2 }))
                    }}
                    className={inputClassName(`section2.${index}.dateOfBirth`)}
                    placeholder="YYYY/MM/DD"
                    maxLength={10}
                    required
                  />
                  <ValidationMessage fieldName={`section2.${index}.dateOfBirth`} />
                </div>
              </div>

              {/* Sex Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Sex *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`section2.${index}.sex`}
                      value="M"
                      checked={dependent.sex === 'M'}
                      onChange={(e) => {
                        const newSection2 = [...formData.section2]
                        newSection2[index] = { ...newSection2[index], sex: e.target.value }
                        setFormData(prev => ({ ...prev, section2: newSection2 }))
                      }}
                      className="mr-2"
                      required
                    />
                    M (Male)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`section2.${index}.sex`}
                      value="F"
                      checked={dependent.sex === 'F'}
                      onChange={(e) => {
                        const newSection2 = [...formData.section2]
                        newSection2[index] = { ...newSection2[index], sex: e.target.value }
                        setFormData(prev => ({ ...prev, section2: newSection2 }))
                      }}
                      className="mr-2"
                      required
                    />
                    F (Female)
                  </label>
                </div>
                <ValidationMessage fieldName={`section2.${index}.sex`} />
              </div>

              {/* Relationship */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  I am this person&apos;s *
              </label>
              <select
                  name={`section2.${index}.relationship`}
                  value={dependent.relationship}
                  onChange={(e) => {
                    const newSection2 = [...formData.section2]
                    newSection2[index] = { ...newSection2[index], relationship: e.target.value }
                    setFormData(prev => ({ ...prev, section2: newSection2 }))
                  }}
                  className={inputClassName(`section2.${index}.relationship`)}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="parent">Parent</option>
                  <option value="legal guardian">Legal Guardian</option>
                  <option value="attorney for personal care">Attorney for Personal Care</option>
              </select>
                <ValidationMessage fieldName={`section2.${index}.relationship`} />
            </div>

              {/* Address: Same as Section 1 checkbox for now */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name={`section2.${index}.residenceAddressSameAsSection1`}
                    checked={dependent.residenceAddressSameAsSection1}
                    onChange={(e) => {
                      const newSection2 = [...formData.section2]
                      newSection2[index] = { ...newSection2[index], residenceAddressSameAsSection1: e.target.checked }
                      setFormData(prev => ({ ...prev, section2: newSection2 }))
                    }}
                    className="mr-2"
                  />
                  Same address as Section 1
                </label>
          </div>
        </div>
          ))}
      </section>

        {/* Section 3 - Emergency Contact & Signature */}
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-300 pb-3">
            Section 3 - Emergency Contact & Signature
        </h2>
          
          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next of Kin Name *
                </label>
                <input
                  type="text"
                  name="section3.nextOfKinName"
                  value={formData.section3.nextOfKinName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={inputClassName('section3.nextOfKinName')}
                  required
                />
                <ValidationMessage fieldName="section3.nextOfKinName" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next of Kin Phone Number *
                </label>
                <input
                  type="tel"
                  name="section3.nextOfKinPhone"
                  value={formData.section3.nextOfKinPhone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={inputClassName('section3.nextOfKinPhone')}
                  placeholder="(416) 555-1234"
                  required
                />
                <ValidationMessage fieldName="section3.nextOfKinPhone" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Relationship to Patient *
                </label>
                <input
                  type="text"
                  name="section3.relationshipToPatient"
                  value={formData.section3.relationshipToPatient}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={inputClassName('section3.relationshipToPatient')}
                  placeholder="e.g., Spouse, Parent, Child, Sibling"
                  required
                />
                <ValidationMessage fieldName="section3.relationshipToPatient" />
              </div>
            </div>
          </div>
          
          {/* Signature Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Signature</h3>
            <p className="text-sm text-slate-700 mb-4">
              I have read and agree to the Patient Commitment, the Consent to Release Personal Health Information 
              and the Cancellation Conditions on the back of this form. I acknowledge that this Enrolment is not 
              intended to be a legally binding contract and is not intended to give rise to any new legal obligations 
              between my family doctor and me.
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                My Name (Last name, First name) *
            </label>
            <input
                type="text"
                name="section3.patientName"
                value={formData.section3.patientName}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section3.patientName')}
                required
              />
              <ValidationMessage fieldName="section3.patientName" />
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Signature *
            </label>
            <input
                type="text"
                name="section3.signature"
                value={formData.section3.signature}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section3.signature')}
                placeholder="Type your full name as signature"
                required
              />
              <ValidationMessage fieldName="section3.signature" />
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date (YYYY/MM/DD) *
            </label>
            <input
                type="text"
                name="section3.signatureDate"
                value={formData.section3.signatureDate}
              onChange={handleInputChange}
              onBlur={handleBlur}
                className={inputClassName('section3.signatureDate')}
                placeholder="YYYY/MM/DD"
                maxLength={10}
                required
              />
              <ValidationMessage fieldName="section3.signatureDate" />
          </div>

                      <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telephone No. *
              </label>
              <input
                type="tel"
                name="section3.phoneNumber"
                value={formData.section3.phoneNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={inputClassName('section3.phoneNumber')}
                placeholder="(416) 555-1234"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Enter a 10-digit Canadian phone number</p>
              <ValidationMessage fieldName="section3.phoneNumber" />
            </div>
        </div>
      </section>

        {/* Section 4 - Family Doctor Information */}
        <section className="bg-green-50 p-8 rounded-lg border border-green-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-300 pb-3">
            Section 4 - Family Doctor Information
          </h2>
          
          <div className="bg-white p-6 rounded-lg border border-green-300 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Family Doctor</h3>
                <p className="text-2xl font-bold text-green-700">{formData.section4.doctorName}</p>
                <p className="text-sm text-slate-600 mt-2">Assigned Family Physician</p>
              </div>
            </div>
          </div>
        </section>

      {/* Privacy Policy Section */}
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-300 pb-3">
          Privacy & Data-Use Agreement
        </h2>
        
        <PrivacyPolicyAgreement
          agreed={formData.privacyPolicyAgreed}
          onAgreementChange={(agreed) => {
            setFormData(prev => ({
              ...prev,
              privacyPolicyAgreed: agreed
            }))
            
            if (touched.privacyPolicyAgreed) {
              const error = validateField('privacyPolicyAgreed', agreed)
              setErrors(prev => ({
                ...prev,
                privacyPolicyAgreed: error
              }))
            }
          }}
          showError={touched.privacyPolicyAgreed && !!errors.privacyPolicyAgreed}
          errorMessage={errors.privacyPolicyAgreed}
        />
      </section>

      {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p className="text-sm text-slate-600">
            * Required fields. All information is encrypted and securely stored.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
              {isSubmitting ? 'Submitting...' : 'Submit Enrollment Form'}
          </Button>
        </div>
      </div>
    </form>
    </div>
  )
} 