'use client'

import { useState } from 'react'
import Button from '../UI/Button'

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
  emergencyContactName: string
  emergencyContactPhone: string
  relationshipToPatient: string
  privacyPolicyAgreed: boolean
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
  emergencyContactName?: string
  emergencyContactPhone?: string
  relationshipToPatient?: string
  privacyPolicyAgreed?: string
}

interface IntakeFormProps {
  onSubmit: (data: PatientIntakeData) => Promise<void>
  isSubmitting?: boolean
}

export default function IntakeForm({ onSubmit, isSubmitting = false }: IntakeFormProps) {
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
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationshipToPatient: '',
    privacyPolicyAgreed: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof PatientIntakeData, boolean>>>({})

  const validateField = (name: keyof PatientIntakeData, value: string | boolean): string => {
    switch (name) {
      case 'legalFirstName':
      case 'legalLastName':
        return typeof value === 'string' && value.trim().length < 2 ? 'Must be at least 2 characters' : ''
      
      case 'dateOfBirth':
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/
        if (typeof value === 'string' && !dateRegex.test(value)) {
          return 'Please use DD-MM-YYYY format'
        }
        if (typeof value === 'string' && value) {
          const [day, month, year] = value.split('-').map(Number)
          const date = new Date(year, month - 1, day)
          const today = new Date()
          if (date > today) {
            return 'Date of birth cannot be in the future'
          }
          if (year < 1900) {
            return 'Please enter a valid year'
          }
        }
        return ''
      
      case 'phoneNumber':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        const cleanPhone = typeof value === 'string' ? value.replace(/[\s\-\(\)\.]/g, '') : ''
        return cleanPhone && !phoneRegex.test(cleanPhone) ? 'Please enter a valid phone number' : ''
      
      case 'emailAddress':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return typeof value === 'string' && value && !emailRegex.test(value) ? 'Please enter a valid email address' : ''
      
      case 'streetAddress':
      case 'city':
      case 'emergencyContactName':
        return typeof value === 'string' && value.trim().length < 2 ? 'This field is required' : ''
      
      case 'provinceState':
        return typeof value === 'string' && value.trim().length < 2 ? 'Please select or enter your province/state' : ''
      
      case 'postalZipCode':
        // Canadian postal code (A1A 1A1) or US ZIP code (12345 or 12345-1234)
        const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$|^\d{5}(-\d{4})?$/
        return typeof value === 'string' && value && !postalRegex.test(value) ? 'Please enter a valid postal/ZIP code' : ''
      
      case 'emergencyContactPhone':
        const emergencyPhoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        const cleanEmergencyPhone = typeof value === 'string' ? value.replace(/[\s\-\(\)\.]/g, '') : ''
        return cleanEmergencyPhone && !emergencyPhoneRegex.test(cleanEmergencyPhone) ? 'Please enter a valid emergency contact phone' : ''
      
      case 'relationshipToPatient':
        return typeof value === 'string' && value.trim().length < 2 ? 'Please specify relationship' : ''
      
      case 'privacyPolicyAgreed':
        return value !== true ? 'You must agree to the Privacy & Data-Use Policy' : ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const fieldName = name as keyof PatientIntakeData
    
    let newValue: string | boolean = value
    
    // Format date input
    if (fieldName === 'dateOfBirth' && type === 'text') {
      // Auto-format as user types DD-MM-YYYY
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2)
      }
      if (cleaned.length >= 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 8)
      }
      newValue = formatted
    }
    
    // Handle checkbox
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked
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
    
    const value = fieldName === 'privacyPolicyAgreed' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    
    const error = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true
    
    // Validate all required fields
    const requiredFields: (keyof PatientIntakeData)[] = [
      'legalFirstName', 'legalLastName', 'dateOfBirth', 'phoneNumber',
      'emailAddress', 'streetAddress', 'city', 'provinceState', 'postalZipCode',
      'emergencyContactName', 'emergencyContactPhone', 'relationshipToPatient',
      'privacyPolicyAgreed'
    ]
    
    requiredFields.forEach(field => {
      if (field === 'privacyPolicyAgreed') {
        if (!formData[field]) {
          newErrors[field] = 'You must agree to the Privacy & Data-Use Policy'
          isValid = false
        }
      } else {
        const value = formData[field] as string
        if (!value || value.trim() === '') {
          newErrors[field] = 'This field is required'
          isValid = false
        } else {
          const error = validateField(field, value)
          if (error) {
            newErrors[field] = error
            isValid = false
          }
        }
      }
    })
    
    setErrors(newErrors)
    setTouched(
      requiredFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {})
    )
    
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
    const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
    const hasError = touched[fieldName as keyof PatientIntakeData] && errors[fieldName]
    return hasError 
      ? `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`
      : `${baseClasses} border-slate-300`
  }

  const ErrorMessage = ({ fieldName }: { fieldName: keyof FormErrors }) => {
    if (!touched[fieldName as keyof PatientIntakeData] || !errors[fieldName]) return null
    return (
      <p className="mt-1 text-sm text-red-600" role="alert">
        {errors[fieldName]}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Personal Information Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
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
            <ErrorMessage fieldName="legalFirstName" />
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
            <ErrorMessage fieldName="legalLastName" />
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
            <ErrorMessage fieldName="preferredName" />
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
            <ErrorMessage fieldName="dateOfBirth" />
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
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
            <ErrorMessage fieldName="phoneNumber" />
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
            <ErrorMessage fieldName="emailAddress" />
          </div>
        </div>
      </section>

      {/* Address Information Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
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
            <ErrorMessage fieldName="streetAddress" />
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
              <ErrorMessage fieldName="city" />
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
              <ErrorMessage fieldName="provinceState" />
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
              <ErrorMessage fieldName="postalZipCode" />
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Emergency Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-slate-700 mb-2">
              Emergency Contact Full Name *
            </label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              required
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('emergencyContactName')}
              placeholder="Enter full name of emergency contact"
              aria-describedby="emergencyContactName-error"
            />
            <ErrorMessage fieldName="emergencyContactName" />
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-slate-700 mb-2">
              Emergency Contact Phone *
            </label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              required
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('emergencyContactPhone')}
              placeholder="(555) 123-4567"
              aria-describedby="emergencyContactPhone-error"
            />
            <ErrorMessage fieldName="emergencyContactPhone" />
          </div>

          <div>
            <label htmlFor="relationshipToPatient" className="block text-sm font-medium text-slate-700 mb-2">
              Relationship to Patient *
            </label>
            <select
              id="relationshipToPatient"
              name="relationshipToPatient"
              required
              value={formData.relationshipToPatient}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={inputClassName('relationshipToPatient')}
              aria-describedby="relationshipToPatient-error"
            >
              <option value="">Select relationship</option>
              {relationshipOptions.map(relationship => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
            <ErrorMessage fieldName="relationshipToPatient" />
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          Privacy & Data-Use Agreement
        </h2>
        
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <strong>Privacy & Data Protection:</strong> Zenith Medical Centre is committed to protecting your personal health information (PHI) in accordance with HIPAA and PIPEDA regulations.
            </p>
            <p>
              <strong>Data Collection:</strong> We collect only the information necessary to provide quality healthcare services and maintain accurate medical records.
            </p>
            <p>
              <strong>Data Security:</strong> All patient information is encrypted using AES-256 encryption and stored securely. Access is limited to authorized healthcare personnel.
            </p>
            <p>
              <strong>Data Use:</strong> Your information will be used for appointment scheduling, medical care coordination, billing, and healthcare quality improvement.
            </p>
            <p>
              <strong>Data Sharing:</strong> We do not share your information with third parties except as required for your medical care, billing, or as required by law.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="privacyPolicyAgreed"
            name="privacyPolicyAgreed"
            checked={formData.privacyPolicyAgreed}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            aria-describedby="privacyPolicyAgreed-error"
          />
          <label htmlFor="privacyPolicyAgreed" className="text-sm text-slate-700">
            I acknowledge that I have read and agree to the Privacy & Data-Use Policy outlined above. I understand that my personal health information will be collected, used, and protected as described. *
          </label>
        </div>
        <ErrorMessage fieldName="privacyPolicyAgreed" />
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
            {isSubmitting ? 'Submitting...' : 'Complete Intake Form'}
          </Button>
        </div>
      </div>
    </form>
  )
} 