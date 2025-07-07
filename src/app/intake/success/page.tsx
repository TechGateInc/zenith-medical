'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '../../../components/Layout/Layout'
import Button from '../../../components/UI/Button'
import Link from 'next/link'

export default function IntakeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')
    setSubmissionId(id)
    
    // If no submission ID, redirect back to intake form after a short delay
    if (!id) {
      setTimeout(() => {
        router.push('/intake')
      }, 5000)
    }
  }, [searchParams, router])

  const handleAppointmentBooking = () => {
    // In a real implementation, this would redirect to the actual appointment booking system
    // For now, we'll redirect to the contact page as a placeholder
    window.open('/contact?booking=true', '_blank')
  }

  const handleAutomaticRedirect = () => {
    setRedirectCountdown(10)
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          handleAppointmentBooking()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const nextSteps = [
    {
      step: 1,
      title: 'Book Your Appointment',
      description: 'Schedule your first visit using our secure booking system.',
      action: 'Book Now',
      urgent: true
    },
    {
      step: 2,
      title: 'Prepare for Your Visit',
      description: 'Bring your ID, insurance card, and any relevant medical records.',
      action: 'View Checklist',
      urgent: false
    },
    {
      step: 3,
      title: 'Arrive Early',
      description: 'Please arrive 15 minutes before your scheduled appointment.',
      action: 'Get Directions',
      urgent: false
    }
  ]

  return (
    <Layout className="bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {submissionId ? (
          <>
            {/* Success Confirmation */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Intake Form Submitted Successfully!
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Thank you for completing your patient intake form. Your information has been securely submitted 
                and encrypted according to HIPAA and PIPEDA standards.
              </p>
            </div>

            {/* Submission Details */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Submission Confirmation</h2>
                <div className="flex items-center space-x-2 text-green-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Verified</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Submission ID</h3>
                  <p className="text-slate-600 font-mono text-sm bg-slate-50 px-3 py-2 rounded">
                    {submissionId}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Please keep this ID for your records
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Submitted On</h3>
                  <p className="text-slate-600">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA - Book Appointment */}
            <div className="bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg p-8 mb-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Schedule Your Appointment?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Complete your healthcare journey by booking your first appointment with our medical team.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleAppointmentBooking}
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg"
                  >
                    Book Appointment Now
                  </Button>
                  
                  {!redirectCountdown && (
                    <button
                      onClick={handleAutomaticRedirect}
                      className="text-white hover:text-gray-200 underline text-sm"
                    >
                      Auto-redirect in 10 seconds
                    </button>
                  )}
                  
                  {redirectCountdown && (
                    <div className="text-white text-sm">
                      Redirecting to booking in {redirectCountdown} seconds...
                      <button
                        onClick={() => setRedirectCountdown(null)}
                        className="ml-2 underline hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">What Happens Next?</h2>
              
              <div className="space-y-6">
                {nextSteps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.urgent ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 mb-1">
                        {step.title}
                        {step.urgent && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">{step.description}</p>
                      {step.step === 1 && (
                        <button
                          onClick={handleAppointmentBooking}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          {step.action} →
                        </button>
                      )}
                      {step.step === 2 && (
                        <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {step.action} →
                        </Link>
                      )}
                      {step.step === 3 && (
                        <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {step.action} →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Important Reminders</h3>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Your intake information is securely encrypted and stored</li>
                    <li>• You must book an appointment to complete the registration process</li>
                    <li>• Bring a photo ID and insurance card to your first appointment</li>
                    <li>• Arrive 15 minutes early for check-in and additional paperwork</li>
                    <li>• Contact us if you need to update any information before your visit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">Phone</p>
                      <p className="text-slate-600">(555) 123-CARE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">Email</p>
                      <p className="text-slate-600">intake@zenithmedical.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monday - Friday</span>
                    <span className="text-slate-800 font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Saturday</span>
                    <span className="text-slate-800 font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sunday</span>
                    <span className="text-slate-800 font-medium">Emergency Only</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Submission ID Error */
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              No Submission Found
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              We couldn't find a valid submission ID. You may have accessed this page directly or 
              your submission may not have completed successfully.
            </p>
            
            <div className="space-y-4">
              <Link href="/intake">
                <Button size="lg" className="px-8">
                  Complete Intake Form
                </Button>
              </Link>
              <p className="text-sm text-slate-500">
                Redirecting to intake form in 5 seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 