'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '../../../components/Layout/Layout'
import Button from '../../../components/UI/Button'
import Link from 'next/link'

interface BookingProvider {
  name: string
  type: string
  active: boolean
}

interface AppointmentBookingResult {
  success: boolean
  appointment?: {
    id: string
    appointmentDate: string
    appointmentTime: string
    provider: string
  }
  redirectUrl?: string
  bookingUrl?: string
  error?: string
  fallbackMessage?: string
}

export default function IntakeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [bookingProviders, setBookingProviders] = useState<BookingProvider[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState<AppointmentBookingResult | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'Consultation',
    notes: ''
  })
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const id = searchParams.get('id')
    setSubmissionId(id)
    
    // Load patient data from localStorage if available
    const savedPatientData = localStorage.getItem('intakePatientData')
    if (savedPatientData) {
      try {
        const data = JSON.parse(savedPatientData)
        setPatientData({
          name: `${data.legalFirstName || ''} ${data.legalLastName || ''}`.trim(),
          email: data.emailAddress || '',
          phone: data.phoneNumber || ''
        })
      } catch (error) {
        console.error('Error parsing patient data:', error)
      }
    }
    
    // Load available booking providers
    fetchBookingProviders()
    
    // If no submission ID, redirect back to intake form after a short delay
    if (!id) {
      setTimeout(() => {
        router.push('/intake')
      }, 5000)
    }
  }, [searchParams, router])

  const fetchBookingProviders = async () => {
    try {
      const response = await fetch('/api/appointments/providers')
      if (response.ok) {
        const data = await response.json()
        setBookingProviders(data.providers || [])
        
        // Set default provider
        const activeProviders = data.providers?.filter((p: BookingProvider) => p.active) || []
        if (activeProviders.length > 0) {
          setSelectedProvider(activeProviders[0].type)
        }
      }
    } catch (error) {
      console.error('Error fetching booking providers:', error)
    }
  }

  const handleAppointmentBooking = async () => {
    if (!selectedProvider || !appointmentData.appointmentDate || !appointmentData.appointmentTime) {
      setShowBookingForm(true)
      return
    }

    setIsBooking(true)
    setBookingResult(null)

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientIntakeId: submissionId,
          patientName: patientData.name,
          patientEmail: patientData.email,
          patientPhone: patientData.phone,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          appointmentType: appointmentData.appointmentType,
          notes: appointmentData.notes,
          preferredProvider: selectedProvider
        })
      })

      const result = await response.json()
      setBookingResult(result)

      if (result.success && result.redirectUrl) {
        // Redirect to booking provider's interface
        setTimeout(() => {
          window.open(result.redirectUrl, '_blank')
        }, 2000)
      }
    } catch (error) {
      console.error('Booking error:', error)
      setBookingResult({
        success: false,
        error: 'Failed to connect to booking system',
        fallbackMessage: 'Please call (555) 123-4567 to schedule your appointment.'
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleAutomaticRedirect = () => {
    setRedirectCountdown(10)
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          if (bookingProviders.length > 0) {
            setShowBookingForm(true)
          } else {
            // Fallback to contact page
            window.open('/contact?booking=true', '_blank')
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const renderBookingForm = () => {
    if (!showBookingForm) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Book Your Appointment</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {bookingProviders.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Booking System
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {bookingProviders.map((provider) => (
                    <option key={provider.type} value={provider.type}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={appointmentData.appointmentDate}
                  onChange={(e) => setAppointmentData({...appointmentData, appointmentDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time *
                </label>
                <select
                  value={appointmentData.appointmentTime}
                  onChange={(e) => setAppointmentData({...appointmentData, appointmentTime: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentData.appointmentType}
                  onChange={(e) => setAppointmentData({...appointmentData, appointmentType: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Consultation">Initial Consultation</option>
                  <option value="Follow-up">Follow-up Appointment</option>
                  <option value="Checkup">Annual Checkup</option>
                  <option value="Urgent">Urgent Care</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific concerns or requests..."
                />
              </div>
            </div>

            {bookingResult && (
              <div className={`mt-4 p-3 rounded-md ${
                bookingResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {bookingResult.success ? (
                  <div>
                    <p className="font-medium">Appointment booked successfully!</p>
                    {bookingResult.appointment && (
                      <p className="text-sm mt-1">
                        {bookingResult.appointment.appointmentDate} at {bookingResult.appointment.appointmentTime}
                      </p>
                    )}
                    {bookingResult.redirectUrl && (
                      <p className="text-sm mt-1">Redirecting to booking system...</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Booking failed</p>
                    <p className="text-sm mt-1">{bookingResult.error}</p>
                    {bookingResult.fallbackMessage && (
                      <p className="text-sm mt-2 font-medium">{bookingResult.fallbackMessage}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleAppointmentBooking}
                disabled={isBooking || !appointmentData.appointmentDate || !appointmentData.appointmentTime}
                className="flex-1"
              >
                {isBooking ? 'Booking...' : 'Book Appointment'}
              </Button>
              <button
                onClick={() => setShowBookingForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                    onClick={() => setShowBookingForm(true)}
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg"
                    disabled={isBooking}
                  >
                    {isBooking ? 'Booking...' : 'Book Appointment Now'}
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
                      Opening booking form in {redirectCountdown} seconds...
                      <button
                        onClick={() => setRedirectCountdown(null)}
                        className="ml-2 underline hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {bookingProviders.length === 0 && (
                  <div className="mt-4 text-sm opacity-80">
                    <p>Booking system unavailable.</p>
                    <p>Please call <strong>(555) 123-4567</strong> to schedule your appointment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Success/Error Display */}
            {bookingResult && !showBookingForm && (
              <div className={`rounded-lg p-6 mb-8 ${
                bookingResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    bookingResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {bookingResult.success ? (
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      bookingResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {bookingResult.success ? 'Appointment Booked!' : 'Booking Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      bookingResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {bookingResult.success 
                        ? `Your appointment has been scheduled. You'll be redirected to complete the booking process.`
                        : bookingResult.error
                      }
                    </p>
                    {bookingResult.fallbackMessage && (
                      <p className="text-sm mt-2 font-medium text-red-700">
                        {bookingResult.fallbackMessage}
                      </p>
                    )}
                    {bookingResult.success && (
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="text-sm text-green-700 hover:text-green-800 underline mt-2"
                      >
                        Book another appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                          onClick={() => setShowBookingForm(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          {step.action} →
                        </button>
                      )}
                      {step.step === 2 && (
                        <Link href="/resources/visit-preparation" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {step.action} →
                        </Link>
                      )}
                      {step.step === 3 && (
                        <Link href="/contact#directions" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {step.action} →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Phone Support</h3>
                  <p className="text-slate-600">Call us at <strong>(555) 123-4567</strong></p>
                  <p className="text-sm text-slate-500">Monday - Friday, 8:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Email Support</h3>
                  <p className="text-slate-600">
                    <a href="mailto:appointments@zenithmedical.com" className="text-blue-600 hover:text-blue-700">
                      appointments@zenithmedical.com
                    </a>
                  </p>
                  <p className="text-sm text-slate-500">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">No Submission Found</h1>
            <p className="text-slate-600 mb-6">
              We couldn't find your intake submission. You'll be redirected to the intake form in a moment.
            </p>
            <Button onClick={() => router.push('/intake')}>
              Return to Intake Form
            </Button>
          </div>
        )}
      </div>

      {renderBookingForm()}
    </Layout>
  )
} 