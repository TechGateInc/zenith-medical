'use client'

import { useState, useEffect } from 'react'
import { analytics } from '../../lib/analytics/google-analytics'

export default function AnalyticsConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

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

  const handleLearnMore = () => {
    setShowDetails(!showDetails)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Privacy & Analytics</h3>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            We use privacy-compliant analytics to improve our website. 
            <strong className="text-slate-800"> No health data is tracked.</strong>
          </p>
          
          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-semibold text-green-800 mb-1">✓ What we track:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• Page visits & navigation</li>
                  <li>• Form completion rates</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-800 mb-1">✗ Never tracked:</p>
                <ul className="text-red-700 space-y-1">
                  <li>• Personal information</li>
                  <li>• Medical data</li>
                  <li>• Patient records</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Decline'}
            </button>
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Accept'}
            </button>
          </div>
          <button
            onClick={handleLearnMore}
            className="w-full text-xs text-slate-500 hover:text-blue-600 transition-colors"
          >
            {showDetails ? 'Show less' : 'Learn more'}
          </button>
        </div>

        {/* Small compliance indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
                            <span>Privacy Compliant</span>
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Analytics Preferences</h3>
      </div>
      
      <div className="space-y-6">
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Website Analytics</h4>
              <p className="text-slate-600 mb-3 leading-relaxed">
                Help us improve our website by allowing privacy-compliant analytics tracking
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentConsent === 'granted' ? 'bg-green-500' : 
                  currentConsent === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium text-slate-700">
                  Status: {
                    currentConsent === 'granted' ? (
                      <span className="text-green-600">Enabled</span>
                    ) : currentConsent === 'denied' ? (
                      <span className="text-red-600">Disabled</span>
                    ) : (
                      <span className="text-yellow-600">Not set</span>
                    )
                  }
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => updateConsent(false)}
                disabled={isLoading || currentConsent === 'denied'}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disable
              </button>
              <button
                onClick={() => updateConsent(true)}
                disabled={isLoading || currentConsent === 'granted'}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enable
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-800 mb-3">Analytics Compliance Information</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              All analytics data is anonymized and aggregated
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              No personal health information (PHI) is ever collected
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              Data is only used to improve website functionality
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              You can change these preferences at any time
            </li>
          </ul>
        </div>

        {currentConsent && (
          <div className="text-center">
            <button
              onClick={clearConsent}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Reset analytics preferences
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 