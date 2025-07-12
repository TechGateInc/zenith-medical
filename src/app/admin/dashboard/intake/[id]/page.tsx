'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../../lib/auth/use-auth'
import { FormSkeleton } from '@/components/UI/SkeletonLoader'

interface FullIntakeSubmission {
  id: string
  legalFirstName: string
  legalLastName: string
  preferredName?: string
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
  status: 'SUBMITTED' | 'REVIEWED' | 'APPOINTMENT_SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED'
  appointmentBooked: boolean
  appointmentBookedAt?: string
  privacyPolicyAccepted: boolean
  createdAt: string
  updatedAt: string
  ipAddress?: string
  userAgent?: string
}

const statusOptions = [
  { value: 'SUBMITTED', label: 'Pending Review', color: 'yellow' },
  { value: 'REVIEWED', label: 'Reviewed', color: 'blue' },
  { value: 'APPOINTMENT_SCHEDULED', label: 'Appointment Scheduled', color: 'green' },
  { value: 'CHECKED_IN', label: 'Checked In', color: 'purple' },
  { value: 'COMPLETED', label: 'Completed', color: 'gray' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
]

export default function IntakeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoading, isAuthenticated, isAdmin } = useAuth()
  const [submission, setSubmission] = useState<FullIntakeSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch submission details
  useEffect(() => {
    if (!isAuthenticated || !id) return

    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/intake/${id}`, {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Intake submission not found')
          }
          throw new Error('Failed to fetch submission details')
        }

        const data = await response.json()
        setSubmission(data.submission)
        setNewStatus(data.submission.status)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load submission')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissionDetails()
  }, [isAuthenticated, id])

  const updateStatus = async (status: string) => {
    if (!submission || !isAdmin) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/intake/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const data = await response.json()
      setSubmission(data.submission)
      setNewStatus(data.submission.status)
      
      // Show success message
      alert('Status updated successfully!')
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  const markAppointmentBooked = async () => {
    if (!submission || !isAdmin) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/intake/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          appointmentBooked: true,
          status: 'APPOINTMENT_SCHEDULED'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark appointment as booked')
      }

      const data = await response.json()
      setSubmission(data.submission)
      setNewStatus(data.submission.status)
      
      alert('Appointment marked as booked!')
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update appointment status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[statusConfig.color as keyof typeof colorClasses]}`}>
        {statusConfig.label}
      </span>
    )
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Submission</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/admin/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <FormSkeleton />
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-4">The requested intake submission could not be found.</p>
          <Link
            href="/admin/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Intake Details</h1>
                <p className="text-gray-600">Submission ID: {submission.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(submission.status)}
              <button
                onClick={() => window.print()}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Legal First Name</label>
                  <p className="text-gray-900">{submission.legalFirstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Legal Last Name</label>
                  <p className="text-gray-900">{submission.legalLastName}</p>
                </div>
                {submission.preferredName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Preferred Name</label>
                    <p className="text-gray-900">{submission.preferredName}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{submission.dateOfBirth}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{submission.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-gray-900">{submission.emailAddress}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Street Address</label>
                  <p className="text-gray-900">{submission.streetAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900">{submission.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Province/State</label>
                  <p className="text-gray-900">{submission.provinceState}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Postal/ZIP Code</label>
                  <p className="text-gray-900">{submission.postalZipCode}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Next of Kin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Name</label>
                  <p className="text-gray-900">{submission.nextOfKinName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Phone</label>
                  <p className="text-gray-900">{submission.nextOfKinPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Relationship to Patient</label>
                  <p className="text-gray-900">{submission.relationshipToPatient}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => updateStatus(newStatus)}
                    disabled={updating || newStatus === submission.status}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                  
                  {!submission.appointmentBooked && (
                    <button
                      onClick={markAppointmentBooked}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Mark Appointment Booked
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Submission Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Submitted</label>
                  <p className="text-gray-900">
                    {new Date(submission.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">
                    {new Date(submission.updatedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Privacy Policy</label>
                  <p className="text-gray-900">
                    {submission.privacyPolicyAccepted ? 'Accepted' : 'Not Accepted'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Appointment Status</label>
                  <p className="text-gray-900">
                    {submission.appointmentBooked ? 'Booked' : 'Not Booked'}
                  </p>
                </div>
                {submission.appointmentBookedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Appointment Booked At</label>
                    <p className="text-gray-900">
                      {new Date(submission.appointmentBookedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Information */}
            {submission.ipAddress && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-gray-900 font-mono text-sm">{submission.ipAddress}</p>
                  </div>
                  {submission.userAgent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">User Agent</label>
                      <p className="text-gray-900 text-sm break-all">{submission.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 