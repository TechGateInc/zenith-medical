'use client'

import { useState, useEffect } from 'react'
import { analytics } from '../../lib/analytics/google-analytics'

export default function AnalyticsConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent')
    const bannerDismissed = localStorage.getItem('analytics_banner_dismissed')
    
    // Show banner if no consent given and banner not permanently dismissed
    if (!consent && !bannerDismissed) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = async () => {
    setIsLoading(true)
    analytics.updateConsent(true)
    localStorage.setItem('analytics_consent', 'granted')
    localStorage.setItem('analytics_banner_dismissed', 'true')
    setShowBanner(false)
    setIsLoading(false)
  }

  const handleDecline = async () => {
    setIsLoading(true)
    analytics.updateConsent(false)
    localStorage.setItem('analytics_consent', 'denied')
    localStorage.setItem('analytics_banner_dismissed', 'true')
    setShowBanner(false)
    setIsLoading(false)
  }

  const handleCustomize = () => {
    // For now, just show the simple accept/decline
    // In a full implementation, this could open a detailed preferences modal
    setShowBanner(false)
    window.open('/privacy-policy#analytics', '_blank')
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" />
      
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Privacy & Analytics
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      We use privacy-compliant analytics to improve our website experience. 
                      <strong className="text-gray-800"> No personal health information is ever tracked.</strong>
                    </p>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-blue-800 font-medium">What we track:</p>
                      <ul className="text-blue-700 text-xs mt-1 space-y-1">
                        <li>• Page visits and navigation patterns</li>
                        <li>• Form completion rates (no form content)</li>
                        <li>• Download and click interactions</li>
                        <li>• General website performance metrics</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-red-800 font-medium">What we DON&apos;T track:</p>
                      <ul className="text-red-700 text-xs mt-1 space-y-1">
                        <li>• Personal names, addresses, or contact information</li>
                        <li>• Medical information or health data</li>
                        <li>• Appointment details or patient records</li>
                        <li>• Any personally identifiable information (PII)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <button
                onClick={handleCustomize}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                disabled={isLoading}
              >
                Learn More
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Decline'}
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Accept Analytics'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Analytics Preferences Component (for settings page)
export function AnalyticsPreferences() {
  const [currentConsent, setCurrentConsent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent')
    setCurrentConsent(consent)
  }, [])

  const updateConsent = async (granted: boolean) => {
    setIsLoading(true)
    analytics.updateConsent(granted)
    const newConsent = granted ? 'granted' : 'denied'
    localStorage.setItem('analytics_consent', newConsent)
    setCurrentConsent(newConsent)
    setIsLoading(false)
  }

  const clearConsent = () => {
    localStorage.removeItem('analytics_consent')
    localStorage.removeItem('analytics_banner_dismissed')
    setCurrentConsent(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Website Analytics</h4>
            <p className="text-sm text-gray-600">
              Help us improve our website by allowing privacy-compliant analytics tracking
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current status: {
                currentConsent === 'granted' ? (
                  <span className="text-green-600 font-medium">Enabled</span>
                ) : currentConsent === 'denied' ? (
                  <span className="text-red-600 font-medium">Disabled</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Not set</span>
                )
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => updateConsent(false)}
              disabled={isLoading || currentConsent === 'denied'}
              className="px-3 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disable
            </button>
            <button
              onClick={() => updateConsent(true)}
              disabled={isLoading || currentConsent === 'granted'}
              className="px-3 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enable
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-2">Analytics Compliance Information:</p>
          <ul className="space-y-1">
            <li>• All analytics data is anonymized and aggregated</li>
            <li>• No personal health information (PHI) is ever collected</li>
            <li>• Data is only used to improve website functionality</li>
            <li>• You can change these preferences at any time</li>
          </ul>
        </div>

        {currentConsent && (
          <button
            onClick={clearConsent}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Reset analytics preferences
          </button>
        )}
      </div>
    </div>
  )
} 