'use client'

import { useState, useEffect, useRef } from 'react'
import Button from '../UI/Button'
import { 
  validatePatientIntakeField, 
  validateIntakeForm, 
  formatPhone, 
  normalizePostalCode,
  sanitizeInput
} from '../../lib/utils/validation'
import PrivacyPolicyAgreement from './PrivacyPolicyAgreement'
import { 
  announceToScreenReader,
  formAccessibility,
  responsiveAccessibility
} from '../../lib/utils/accessibility'

export interface PatientIntakeData {
  legalFirstName: string
  legalLastName: string
  preferredName: string
  dateOfBirth: string
  phoneNumber: string
  emailAddress: string
  streetAddress: string
  city: string
  provinceState: string
  postalZipCode: string
  nextOfKinName: string
  nextOfKinPhone: string
  relationshipToPatient: string
  privacyPolicyAgreed: boolean
  healthInformationNumber: string
}

interface FormErrors {
  legalFirstName?: string
  legalLastName?: string
  preferredName?: string
  dateOfBirth?: string
  phoneNumber?: string
  emailAddress?: string
  streetAddress?: string
  city?: string
  provinceState?: string
  postalZipCode?: string
  nextOfKinName?: string
  nextOfKinPhone?: string
  relationshipToPatient?: string
  privacyPolicyAgreed?: string
  healthInformationNumber?: string
}

interface IntakeFormProps {
  onSubmit: (data: PatientIntakeData) => Promise<void>
  isSubmitting?: boolean
}

export default function IntakeForm({ onSubmit, isSubmitting = false }: IntakeFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState<PatientIntakeData>({
    legalFirstName: '',
    legalLastName: '',
    preferredName: '',
    dateOfBirth: '',
    phoneNumber: '',
    emailAddress: '',
    streetAddress: '',
    city: '',
    provinceState: '',
    postalZipCode: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    relationshipToPatient: '',
    privacyPolicyAgreed: false,
    healthInformationNumber: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof PatientIntakeData, boolean>>>({})

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
      
      // Move focus to error summary if it exists
      if (errorSummaryRef.current) {
        setTimeout(() => {
          errorSummaryRef.current?.focus()
        }, 100)
      }
    }
  }, [errors])

  const validateField = (name: keyof PatientIntakeData, value: string | boolean): string => {
    const result = validatePatientIntakeField(name, value)
    return result.isValid ? '' : (result.error || '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const fieldName = name as keyof PatientIntakeData
    
    let newValue: string | boolean = value
    
    // Handle checkbox
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
    } else {
      // Sanitize string inputs
      let sanitizedValue = sanitizeInput(value)
      
      // Format specific fields
      if (fieldName === 'dateOfBirth' && type === 'text') {
        // Auto-format as user types DD-MM-YYYY
        const cleaned = sanitizedValue.replace(/\D/g, '')
        let formatted = cleaned
        if (cleaned.length >= 2) {
          formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2)
        }
        if (cleaned.length >= 4) {
          formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 8)
        }
        sanitizedValue = formatted
      } else if (fieldName === 'postalZipCode') {
        // Normalize postal code formatting
        sanitizedValue = normalizePostalCode(sanitizedValue)
      } else if (fieldName === 'phoneNumber' || fieldName === 'nextOfKinPhone') {
        // Allow phone formatting characters while typing
        sanitizedValue = value // Don't auto-format while typing to avoid cursor jumping
      } else if (fieldName === 'healthInformationNumber') {
        sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '')
      }
      
      newValue = sanitizedValue
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: newValue
    }))
    
    // Validate field on change if it has been touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, newValue)
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name as keyof PatientIntakeData
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    let value = fieldName === 'privacyPolicyAgreed' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    
    // Format fields on blur for better UX
    if (typeof value === 'string') {
      if (fieldName === 'phoneNumber' || fieldName === 'nextOfKinPhone') {
        const formatted = formatPhone(value)
        setFormData(prev => ({
          ...prev,
          [fieldName]: formatted
        }))
        value = formatted
      } else if (fieldName === 'postalZipCode') {
        const normalized = normalizePostalCode(value)
        setFormData(prev => ({
          ...prev,
          [fieldName]: normalized
        }))
        value = normalized
      } else if (fieldName === 'healthInformationNumber') {
        // Optionally format or validate here
      }
    }
    
    const error = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
  }

  const validateForm = (): boolean => {
    const validation = validateIntakeForm(formData)
    
    setErrors(validation.errors as FormErrors)
    
    // Mark all fields as touched to show errors
    const allFields: (keyof PatientIntakeData)[] = [
      'legalFirstName', 'legalLastName', 'preferredName', 'dateOfBirth', 'phoneNumber',
      'emailAddress', 'streetAddress', 'city', 'provinceState', 'postalZipCode',
      'nextOfKinName', 'nextOfKinPhone', 'relationshipToPatient',
      'privacyPolicyAgreed', 'healthInformationNumber'
    ]
    
    setTouched(
      allFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {})
    )
    
    return validation.isValid
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

  const provinceStateOptions = [
    // Canadian Provinces
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' },
    // US States (major ones)
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ]

  const relationshipOptions = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Relative',
    'Friend',
    'Partner',
    'Guardian',
    'Other'
  ]

  const inputClassName = (fieldName: keyof FormErrors) => {
    const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200'
    const isTouched = touched[fieldName as keyof PatientIntakeData]
    const hasError = isTouched && errors[fieldName]
    const hasValue = formData[fieldName as keyof PatientIntakeData]
    const isValid = isTouched && !errors[fieldName] && hasValue
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`
    } else if (isValid) {
      return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50`
    } else {
      return `${baseClasses} border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white`
    }
  }

  const ValidationMessage = ({ fieldName }: { fieldName: keyof FormErrors }) => {
    const isTouched = touched[fieldName as keyof PatientIntakeData]
    const hasError = errors[fieldName]
    const hasValue = formData[fieldName as keyof PatientIntakeData]
    const isValid = isTouched && !hasError && hasValue
    
    if (!isTouched) return null
    
    if (hasError) {
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
    
    if (isValid) {
      return (
        <div className="mt-1 flex items-center space-x-1">
          <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-600">
            Valid
          </p>
        </div>
      )
    }
    
    return null
  }

  // Generate field attributes with accessibility features - REMOVED (unused)

  const hasFormErrors = Object.keys(errors).some(key => errors[key as keyof FormErrors])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Skip Link */}
      <a 
        href="#submit-section" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 text-sm font-medium"
      >
        Skip to submit button
      </a>

      {/* Form Title and Description */}
      <div className="text-center mb-8">
        <h1 id="intake-form-title" className="text-3xl font-bold text-slate-800 mb-4">
          Patient Intake Form
        </h1>
        <p id="intake-form-description" className="text-lg text-slate-600 max-w-2xl mx-auto">
          Please complete all required fields marked with an asterisk (*). 
          Your information is encrypted and protected according to HIPAA and PIPEDA standards.
        </p>
      </div>

      {/* Error Summary */}
      {hasFormErrors && (
        <div 
          ref={errorSummaryRef}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8"
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
        >
          <h2 id="error-summary-title" className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please correct the following {Object.keys(errors).filter(key => errors[key as keyof FormErrors]).length} error{Object.keys(errors).filter(key => errors[key as keyof FormErrors]).length !== 1 ? 's' : ''}:
          </h2>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            {Object.entries(errors).map(([field, error]) => 
              error ? (
                <li key={field}>
                  <a 
                    href={`#${formAccessibility.generateFieldId(field)}`}
                    className="underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.getElementById(formAccessibility.generateFieldId(field))
                      if (element) {
                        element.focus()
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        announceToScreenReader(`Moved to ${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} field`, 'assertive')
                      }
                    }}
                  >
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {error}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="space-y-8"
        role="form"
        aria-labelledby="intake-form-title"
        aria-describedby="intake-form-description"
        noValidate
      >
        {/* Personal Information Section */}
        <section aria-labelledby="personal-info-heading">
        <h2 id="personal-info-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Personal Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="legalFirstName" className="block text-sm font-medium text-slate-700 mb-2">
              Legal First Name *
            </label>
            <input
              type="text"
              id="legalFirstName"
              name="legalFirstName"
              required
              value={formData.legalFirstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('legalFirstName')}
              placeholder="Enter your legal first name"
              aria-describedby="legalFirstName-error"
              autoComplete="given-name"
            />
            <ValidationMessage fieldName="legalFirstName" />
          </div>

          <div>
            <label htmlFor="legalLastName" className="block text-sm font-medium text-slate-700 mb-2">
              Legal Last Name *
            </label>
            <input
              type="text"
              id="legalLastName"
              name="legalLastName"
              required
              value={formData.legalLastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('legalLastName')}
              placeholder="Enter your legal last name"
              aria-describedby="legalLastName-error"
              autoComplete="family-name"
            />
            <ValidationMessage fieldName="legalLastName" />
          </div>

          <div>
            <label htmlFor="preferredName" className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Name <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="preferredName"
              name="preferredName"
              value={formData.preferredName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('preferredName')}
              placeholder="How would you like to be addressed?"
              aria-describedby="preferredName-error"
              autoComplete="nickname"
            />
            <ValidationMessage fieldName="preferredName" />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="text"
              id="dateOfBirth"
              name="dateOfBirth"
              required
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('dateOfBirth')}
              placeholder="DD-MM-YYYY"
              maxLength={10}
              aria-describedby="dateOfBirth-error"
              autoComplete="bday"
            />
            <p className="mt-1 text-xs text-slate-500">Please use DD-MM-YYYY format (e.g., 15-03-1990)</p>
            <ValidationMessage fieldName="dateOfBirth" />
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section aria-labelledby="contact-info-heading">
        <h2 id="contact-info-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('phoneNumber')}
              placeholder="(555) 123-4567"
              aria-describedby="phoneNumber-error"
              autoComplete="tel"
            />
            <ValidationMessage fieldName="phoneNumber" />
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              required
              value={formData.emailAddress}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('emailAddress')}
              placeholder="your.email@example.com"
              aria-describedby="emailAddress-error"
              autoComplete="email"
            />
            <ValidationMessage fieldName="emailAddress" />
          </div>
        </div>
      </section>

      {/* Address Information Section */}
      <section aria-labelledby="address-info-heading">
        <h2 id="address-info-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Address Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-slate-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              required
              value={formData.streetAddress}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('streetAddress')}
              placeholder="123 Main Street, Apt 4B"
              aria-describedby="streetAddress-error"
              autoComplete="street-address"
            />
            <ValidationMessage fieldName="streetAddress" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={inputClassName('city')}
                placeholder="Toronto"
                aria-describedby="city-error"
                autoComplete="address-level2"
              />
              <ValidationMessage fieldName="city" />
            </div>

            <div>
              <label htmlFor="provinceState" className="block text-sm font-medium text-slate-700 mb-2">
                Province/State *
              </label>
              <select
                id="provinceState"
                name="provinceState"
                required
                value={formData.provinceState}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={inputClassName('provinceState')}
                aria-describedby="provinceState-error"
                autoComplete="address-level1"
              >
                <option value="">Select province/state</option>
                {provinceStateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ValidationMessage fieldName="provinceState" />
            </div>

            <div>
              <label htmlFor="postalZipCode" className="block text-sm font-medium text-slate-700 mb-2">
                Postal/ZIP Code *
              </label>
              <input
                type="text"
                id="postalZipCode"
                name="postalZipCode"
                required
                value={formData.postalZipCode}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={inputClassName('postalZipCode')}
                placeholder="M5V 3A8 or 12345"
                aria-describedby="postalZipCode-error"
                autoComplete="postal-code"
              />
              <ValidationMessage fieldName="postalZipCode" />
            </div>
          </div>
        </div>
      </section>

      {/* Next of Kin Section */}
      <section aria-labelledby="next-of-kin-heading">
        <h2 id="next-of-kin-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Next of Kin Information
        </h2>
        <label htmlFor="nextOfKinName" className="block text-sm font-medium text-slate-700 mb-2">
          Next of Kin Full Name *
        </label>
        <input
          id="nextOfKinName"
          name="nextOfKinName"
          value={formData.nextOfKinName}
          onChange={handleInputChange}
          className={inputClassName('nextOfKinName')}
          placeholder="Enter full name of next of kin"
          aria-describedby="nextOfKinName-error"
          required
        />
        <ValidationMessage fieldName="nextOfKinName" />
        <label htmlFor="nextOfKinPhone" className="block text-sm font-medium text-slate-700 mb-2 mt-4">
          Next of Kin Phone *
        </label>
        <input
          id="nextOfKinPhone"
          name="nextOfKinPhone"
          value={formData.nextOfKinPhone}
          onChange={handleInputChange}
          className={inputClassName('nextOfKinPhone')}
          placeholder="Enter phone number of next of kin"
          aria-describedby="nextOfKinPhone-error"
          required
        />
        <ValidationMessage fieldName="nextOfKinPhone" />
        <label htmlFor="relationshipToPatient" className="block text-sm font-medium text-slate-700 mb-2 mt-4">
          Relationship to Patient *
        </label>
        <select
          id="relationshipToPatient"
          name="relationshipToPatient"
          value={formData.relationshipToPatient}
          onChange={handleInputChange}
          className={inputClassName('relationshipToPatient')}
          aria-describedby="relationshipToPatient-error"
          required
        >
          <option value="">Select relationship</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>
        <ValidationMessage fieldName="relationshipToPatient" />
      </section>

      {/* Health Information Number Section */}
      <section aria-labelledby="health-info-heading">
        <h2 id="health-info-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Health Information Number
        </h2>
        <label htmlFor="healthInformationNumber" className="block text-sm font-medium text-slate-700 mb-2">
          Health Information Number *
        </label>
        <input
          id="healthInformationNumber"
          name="healthInformationNumber"
          value={formData.healthInformationNumber}
          onChange={handleInputChange}
          className={inputClassName('healthInformationNumber')}
          placeholder="Enter your health information number"
          aria-describedby="healthInformationNumber-error"
          required
        />
        <ValidationMessage fieldName="healthInformationNumber" />
      </section>

      {/* Privacy Policy Section */}
      <section aria-labelledby="privacy-policy-heading">
        <h2 id="privacy-policy-heading" className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Privacy & Data-Use Agreement
        </h2>
        
        <PrivacyPolicyAgreement
          agreed={formData.privacyPolicyAgreed}
          onAgreementChange={(agreed) => {
            setFormData(prev => ({
              ...prev,
              privacyPolicyAgreed: agreed
            }))
            
            // Validate immediately when changed
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
      <div id="submit-section" className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p className="text-sm text-slate-600">
            * Required fields. All information is encrypted and securely stored.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            aria-describedby="submit-description"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Intake Form'}
          </Button>
        </div>
        <p id="submit-description" className="sr-only">
          Submit the patient intake form. All information will be encrypted and securely stored.
        </p>
      </div>
    </form>
    </div>
  )
} 