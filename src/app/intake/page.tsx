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
    <Layout>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Patient Registration
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Patient Intake Form
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Complete this secure intake form before your appointment to help us provide you with the best possible care. All information is encrypted and kept confidential.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">5-10</div>
                  <div className="text-slate-600 font-medium">Minutes to Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">Secure</div>
                  <div className="text-slate-600 font-medium">HIPAA Compliant</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">Fast</div>
                  <div className="text-slate-600 font-medium">Streamlined Process</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Information */}
          <section className="mb-16">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Before You Begin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        This form typically takes 5-10 minutes to complete
                      </li>
                      <li className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        All fields marked with * are required
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        Your information is encrypted and securely stored
                      </li>
                      <li className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        You&apos;ll receive confirmation after submission
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <section className="mb-12">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800 mb-2">Submission Error</h3>
                    <p className="text-red-700 mb-2">{error}</p>
                    <p className="text-red-600 text-sm">
                      Please try again or contact us at 249 806 0128 if the problem persists.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main Form */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <IntakeForm 
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </section>

          {/* Help Section */}
          <section className="mb-16">
            <div className="max-w-6xl mx-auto">
              {/* Section Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                    Support Available
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Need Assistance?</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Our team is here to help you complete the intake process smoothly
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Technical Support</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Having trouble with the form? Our staff can help you complete it over the phone during business hours.
                  </p>
                  <a
                                            href="tel:2498060128"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                                            Call 249 806 0128
                  </a>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Questions About Information</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Not sure what information to provide? We can answer any questions about the intake process via email.
                  </p>
                  <a
                    href="mailto:intake@zenithmedical.com"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Security Notice */}
          <section className="text-center">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Privacy & Security</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We take your privacy seriously. All information is protected with enterprise-grade security.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  256-bit Encryption
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  HIPAA Compliant
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  PIPEDA Compliant
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
} 