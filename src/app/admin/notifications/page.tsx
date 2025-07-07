'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth/use-auth'

interface NotificationTemplate {
  id: string
  name: string
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMATION' | 'FOLLOW_UP' | 'GENERAL'
  method: 'EMAIL' | 'SMS' | 'BOTH'
  subject?: string
  message: string
  triggerHours: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ScheduledNotification {
  id: string
  templateId: string
  template: NotificationTemplate
  recipientEmail?: string
  recipientPhone?: string
  patientName: string
  appointmentDate: string
  scheduledFor: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
  sentAt?: string
  error?: string
  createdAt: string
}

export default function NotificationManagementPage() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'templates' | 'scheduled' | 'history'>('templates')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'templates') {
        await fetchTemplates()
      } else {
        await fetchScheduledNotifications()
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    const response = await fetch('/api/admin/notifications/templates', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notification templates')
    }

    const data = await response.json()
    setTemplates(data.templates)
  }

  const fetchScheduledNotifications = async () => {
    const response = await fetch('/api/admin/notifications/scheduled', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled notifications')
    }

    const data = await response.json()
    setScheduledNotifications(data.notifications)
  }

  const toggleTemplateActive = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/notifications/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ active: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update template status')
      }

      await fetchTemplates()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update template status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const testNotification = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ templateId })
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }

      alert('Test notification sent successfully!')
    } catch (err) {
      console.error('Test error:', err)
      alert('Failed to send test notification: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const cancelNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to cancel this notification?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/notifications/scheduled/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel notification')
      }

      await fetchScheduledNotifications()
      alert('Notification cancelled successfully!')
    } catch (err) {
      console.error('Cancel error:', err)
      alert('Failed to cancel notification: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeStyles = {
      APPOINTMENT_REMINDER: 'bg-blue-100 text-blue-800',
      APPOINTMENT_CONFIRMATION: 'bg-green-100 text-green-800',
      FOLLOW_UP: 'bg-purple-100 text-purple-800',
      GENERAL: 'bg-gray-100 text-gray-800'
    }

    const typeLabels = {
      APPOINTMENT_REMINDER: 'Reminder',
      APPOINTMENT_CONFIRMATION: 'Confirmation',
      FOLLOW_UP: 'Follow-up',
      GENERAL: 'General'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[type as keyof typeof typeStyles]}`}>
        {typeLabels[type as keyof typeof typeLabels]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
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
                <h1 className="text-3xl font-bold text-gray-900">Notification System</h1>
                <p className="text-gray-600">Manage appointment reminders and patient communications</p>
              </div>
            </div>
            {activeTab === 'templates' && (
              <Link
                href="/admin/notifications/templates/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Template
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Templates ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled ({scheduledNotifications.filter(n => n.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History ({scheduledNotifications.filter(n => n.status !== 'PENDING').length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">Error loading data</p>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : activeTab === 'templates' ? (
              // Templates Tab
              <div>
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No notification templates found</p>
                    <p className="text-gray-400">Create your first template to send automated notifications.</p>
                    <Link
                      href="/admin/notifications/templates/new"
                      className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create First Template
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                              {getTypeBadge(template.type)}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                template.active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {template.active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {template.method}
                              </span>
                            </div>
                            {template.subject && (
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Subject: {template.subject}
                              </p>
                            )}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.message}</p>
                            <p className="text-xs text-gray-500">
                              Trigger: {template.triggerHours} hours before appointment
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => testNotification(template.id)}
                              className="p-2 text-gray-400 hover:text-blue-600"
                              title="Send test"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <Link
                              href={`/admin/notifications/templates/${template.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => toggleTemplateActive(template.id, template.active)}
                              className={`text-sm font-medium ${
                                template.active 
                                  ? 'text-orange-600 hover:text-orange-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {template.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            Updated: {new Date(template.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Scheduled/History Tab
              <div>
                {scheduledNotifications.filter(n => 
                  activeTab === 'scheduled' ? n.status === 'PENDING' : n.status !== 'PENDING'
                ).length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No {activeTab === 'scheduled' ? 'scheduled' : 'sent'} notifications found
                    </p>
                    <p className="text-gray-400">
                      {activeTab === 'scheduled' 
                        ? 'Notifications will appear here when appointments are scheduled.'
                        : 'Notification history will appear here after notifications are sent.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Template
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Appointment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scheduled For
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scheduledNotifications
                          .filter(n => activeTab === 'scheduled' ? n.status === 'PENDING' : n.status !== 'PENDING')
                          .map((notification) => (
                          <tr key={notification.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{notification.patientName}</p>
                                <p className="text-sm text-gray-500">
                                  {notification.recipientEmail || notification.recipientPhone}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{notification.template.name}</p>
                                {getTypeBadge(notification.template.type)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(notification.appointmentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(notification.scheduledFor).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(notification.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {notification.status === 'PENDING' && (
                                <button
                                  onClick={() => cancelNotification(notification.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              )}
                              {notification.status === 'FAILED' && notification.error && (
                                <button
                                  onClick={() => alert(`Error: ${notification.error}`)}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  View Error
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 