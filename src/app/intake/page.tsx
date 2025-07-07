'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout/Layout'
import IntakeForm, { type PatientIntakeData } from '../../components/Forms/IntakeForm'

export default function IntakePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFormSubmit = async (formData: PatientIntakeData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit intake form')
      }

      const result = await response.json()
      
      // Redirect to success page with submission ID
      router.push(`/intake/success?id=${result.submissionId}`)
      
    } catch (err) {
      console.error('Intake submission error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout className="bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Patient Intake Form
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Complete this intake form before your appointment to help us provide you with the best possible care. 
            All information is securely encrypted and kept confidential.
          </p>
        </div>

        {/* Progress Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Before You Begin</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• This form typically takes 5-10 minutes to complete</li>
                <li>• All fields marked with * are required</li>
                <li>• Your information is encrypted and securely stored</li>
                <li>• You'll be redirected to book your appointment after submission</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Submission Error</h3>
                <p className="text-red-700">{error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please try again or contact us at (555) 123-CARE if the problem persists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <IntakeForm 
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-700 mb-2">Technical Support</h3>
              <p className="text-slate-600 text-sm mb-2">
                Having trouble with the form? Our staff can help you complete it over the phone.
              </p>
              <p className="text-blue-600 font-medium text-sm">
                Call: (555) 123-CARE
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-700 mb-2">Questions About Information</h3>
              <p className="text-slate-600 text-sm mb-2">
                Not sure what information to provide? We can answer any questions about the intake process.
              </p>
              <p className="text-blue-600 font-medium text-sm">
                Email: intake@zenithmedical.com
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured with 256-bit encryption • HIPAA & PIPEDA Compliant</span>
          </div>
        </div>
      </div>
    </Layout>
  )
} 