'use client'

import { useState } from 'react'

interface PrivacyPolicyAgreementProps {
  agreed: boolean
  onAgreementChange: (agreed: boolean) => void
  showError?: boolean
  errorMessage?: string
}

interface PolicySection {
  id: string
  title: string
  content: string[]
  important?: boolean
}

export default function PrivacyPolicyAgreement({ 
  agreed, 
  onAgreementChange, 
  showError = false,
  errorMessage = 'You must agree to the Privacy & Data-Use Policy to continue'
}: PrivacyPolicyAgreementProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const expandAll = () => {
    setExpandedSections(policySections.map(section => section.id))
  }

  const collapseAll = () => {
    setExpandedSections([])
  }

  const policySections: PolicySection[] = [
    {
      id: 'data-collection',
      title: 'Personal Health Information Collection',
      important: true,
      content: [
        'We collect personal health information (PHI) necessary to provide quality healthcare services, maintain accurate medical records, and ensure continuity of care.',
        'Information collected includes: medical history, treatment records, diagnostic results, contact information, insurance details, and emergency contact information.',
        'Collection occurs through patient intake forms, medical examinations, diagnostic procedures, insurance verification, and communication with healthcare providers.',
        'All information is collected with your knowledge and consent, except in emergency situations where immediate medical care is required.'
      ]
    },
    {
      id: 'data-use',
      title: 'How We Use Your Information',
      important: true,
      content: [
        'Treatment: To provide, coordinate, and manage your healthcare services and treatment.',
        'Payment: To obtain reimbursement for services provided, verify insurance coverage, and process billing.',
        'Healthcare Operations: For quality assurance, care coordination, medical education, and improving our services.',
        'Communication: To schedule appointments, send reminders, provide test results, and communicate about your care.',
        'Legal Requirements: When required by law, court orders, or regulatory authorities.'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security & Protection',
      important: true,
      content: [
        'All patient information is encrypted using AES-256 encryption both in transit and at rest.',
        'Access to your information is limited to authorized healthcare personnel involved in your care.',
        'Our systems are protected by multi-factor authentication, regular security audits, and industry-standard cybersecurity measures.',
        'Physical records are stored in locked, secure facilities with restricted access.',
        'Regular staff training ensures compliance with privacy and security protocols.',
        'We maintain comprehensive audit logs of all access to patient information.'
      ]
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing & Disclosure',
      content: [
        'We do not sell, rent, or trade your personal health information to third parties.',
        'Information may be shared with healthcare providers directly involved in your care (specialists, hospitals, laboratories).',
        'Disclosure to family members or friends only occurs with your written authorization or in emergency situations.',
        'Insurance companies may receive information necessary for payment and coverage verification.',
        'We may disclose information when required by law (public health agencies, law enforcement, court orders).',
        'Business associates who provide services to us are bound by strict confidentiality agreements.'
      ]
    },
    {
      id: 'patient-rights',
      title: 'Your Privacy Rights',
      content: [
        'Right to Access: You may request copies of your medical records and review how your information is used.',
        'Right to Amendment: You may request corrections to your medical records if you believe they contain errors.',
        'Right to Accounting: You may request a list of disclosures of your health information.',
        'Right to Restrict: You may request limitations on how your health information is used or shared.',
        'Right to Confidential Communication: You may request that we communicate with you in a specific way or location.',
        'Right to Complaint: You may file a complaint if you believe your privacy rights have been violated.'
      ]
    },
    {
      id: 'compliance',
      title: 'Regulatory Compliance',
      content: [
        'HIPAA Compliance: We fully comply with the Health Insurance Portability and Accountability Act (HIPAA) and its Privacy Rule.',
        'PIPEDA Compliance: We adhere to Canada\'s Personal Information Protection and Electronic Documents Act (PIPEDA) requirements.',
        'State/Provincial Laws: We comply with applicable state and provincial privacy legislation.',
        'Regular Audits: We conduct regular compliance audits and update our policies to meet evolving regulatory requirements.',
        'Staff Training: All staff receive regular training on privacy laws and our privacy policies.'
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention & Disposal',
      content: [
        'Medical records are retained according to legal requirements and professional standards.',
        'Active patient records are maintained for the duration of the patient relationship.',
        'After termination of care, records are retained for the legally required period (typically 7-10 years for adults, longer for minors).',
        'Records are disposed of securely through certified destruction methods when retention periods expire.',
        'Electronic records are permanently deleted using secure data wiping techniques.'
      ]
    },
    {
      id: 'policy-updates',
      title: 'Policy Updates & Contact',
      content: [
        'This privacy policy may be updated periodically to reflect changes in regulations or our practices.',
        'Significant changes will be communicated to patients through posted notices and direct communication.',
        'For questions about this policy or to exercise your privacy rights, contact our Privacy Officer.',
        'You may also contact us to request a copy of our complete Notice of Privacy Practices.',
        'Complaints may be filed with us or directly with regulatory authorities (HHS Office for Civil Rights, Privacy Commissioner).'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Privacy & Data-Use Policy
            </h3>
            <p className="text-blue-700 text-sm">
              Your privacy is important to us. Please review our data collection, use, and protection practices below. 
              This policy complies with HIPAA and PIPEDA regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Controls */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-slate-800">Policy Details</h4>
        <div className="space-x-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Expand All
          </button>
          <span className="text-slate-400">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-4">
        {policySections.map((section) => {
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <div
              key={section.id}
              className={`border rounded-lg ${section.important ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-white'}`}
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {section.important && (
                    <svg className="h-4 w-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <h5 className={`font-medium ${section.important ? 'text-orange-800' : 'text-slate-800'}`}>
                    {section.title}
                    {section.important && <span className="ml-2 text-xs text-orange-600 font-normal">(Important)</span>}
                  </h5>
                </div>
                <svg
                  className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="space-y-3 text-sm text-slate-700">
                    {section.content.map((paragraph, index) => (
                      <p key={index} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h4 className="font-semibold text-slate-800 mb-3">Summary of Key Points:</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start space-x-2">
            <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>We collect only necessary health information to provide quality care</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>All data is encrypted with AES-256 and securely stored</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>We comply with HIPAA and PIPEDA privacy regulations</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You have rights to access, amend, and control your information</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>We do not sell or trade your information to third parties</span>
          </li>
        </ul>
      </div>

      {/* Agreement Checkbox */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="privacyPolicyAgreed"
            name="privacyPolicyAgreed"
            checked={agreed}
            onChange={(e) => onAgreementChange(e.target.checked)}
            className={`mt-1 h-4 w-4 rounded border-2 focus:ring-2 focus:ring-offset-2 transition-colors ${
              showError && !agreed
                ? 'border-red-400 text-red-600 focus:ring-red-500'
                : 'border-slate-300 text-blue-600 focus:ring-blue-500'
            }`}
            aria-describedby="privacy-policy-error"
          />
          <div className="flex-1">
            <label htmlFor="privacyPolicyAgreed" className="text-sm font-medium text-slate-800 cursor-pointer">
              I acknowledge that I have read and understand the Privacy & Data-Use Policy outlined above.
            </label>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p>By checking this box, I confirm that:</p>
              <ul className="ml-4 space-y-1">
                <li>• I understand how my personal health information will be collected, used, and protected</li>
                <li>• I consent to the collection and use of my information as described in this policy</li>
                <li>• I understand my rights regarding my personal health information</li>
                <li>• I acknowledge this policy complies with HIPAA and PIPEDA regulations</li>
              </ul>
            </div>
          </div>
        </div>
        
        {showError && !agreed && (
          <div className="mt-3 flex items-center space-x-2">
            <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600" role="alert" id="privacy-policy-error">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="text-xs text-slate-500 bg-slate-50 rounded p-4">
        <h5 className="font-medium text-slate-700 mb-2">Questions about this policy?</h5>
        <p>
          Contact our Privacy Officer at{' '}
                          <a href="mailto:privacy@zenithmedical.ca" className="text-blue-600 hover:text-blue-700">
                  privacy@zenithmedical.ca
          </a>{' '}
          or call{' '}
                          <a href="tel:2498060128" className="text-blue-600 hover:text-blue-700">
                  249 806 0128
          </a>
        </p>
        <p className="mt-1">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  )
} 