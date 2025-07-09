'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '../../../components/Layout/Layout'
import Link from 'next/link'

interface AppointmentDetails {
  id: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  provider: string
  patientName: string
  patientEmail: string
}

export default function AppointmentSuccess() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails(appointmentId)
    } else {
      setLoading(false)
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data.appointment)
      } else {
        setError('Could not load appointment details')
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
      setError('Could not load appointment details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Appointment Confirmed!
              </h1>
              <p className="text-xl text-gray-600">
                Your appointment has been successfully scheduled with Zenith Medical Centre.
              </p>
            </div>

            {/* Appointment Details Card */}
            {appointment && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Appointment Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Patient Name:</span>
                    <span className="text-gray-900">{appointment.patientName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Appointment Type:</span>
                    <span className="text-gray-900">{appointment.appointmentType}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="text-gray-900">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Time:</span>
                    <span className="text-gray-900">
                      {new Date(`2000-01-01T${appointment.appointmentTime}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 font-medium">Provider:</span>
                    <span className="text-gray-900">{appointment.provider}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Confirmation ID:</strong> {appointment.id}
                  </p>
                </div>
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What Happens Next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmation Email</h4>
                    <p className="text-gray-600 text-sm">
                      You will receive a confirmation email within the next few minutes with your appointment details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Appointment Reminder</h4>
                    <p className="text-gray-600 text-sm">
                      We&apos;ll send you a reminder 24 hours before your appointment via email and SMS.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Prepare for Your Visit</h4>
                    <p className="text-gray-600 text-sm">
                      Bring a valid ID, insurance card, and any relevant medical records or medications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Information</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Please arrive 15 minutes early for check-in</li>
                    <li>• Bring your insurance card and a valid photo ID</li>
                    <li>• If you need to cancel or reschedule, please call us at least 24 hours in advance</li>
                    <li>• For urgent medical concerns, please call our office immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Call Our Office</h4>
                  <p className="text-blue-600 font-medium text-lg">(555) 123-4567</p>
                  <p className="text-gray-600 text-sm">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-600 text-sm">Saturday: 9:00 AM - 2:00 PM</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Emergency</h4>
                  <p className="text-red-600 font-medium text-lg">Call 911</p>
                  <p className="text-gray-600 text-sm">For life-threatening emergencies</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-center transition-colors"
              >
                Return to Homepage
              </Link>
              
              <Link
                href="/appointments"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium text-center transition-colors"
              >
                Schedule Another Appointment
              </Link>
              
              <Link
                href="/contact"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-medium text-center transition-colors"
              >
                Contact Us
              </Link>
            </div>

            {error && (
              <div className="mt-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 