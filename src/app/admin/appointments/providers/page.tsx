'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ProviderHealthCheck, ValidationResult, TestResult } from '../../../../lib/integrations/booking-provider-validator'

interface BookingProvider {
  name: string
  type: string
  active: boolean
  isActiveProvider: boolean
  configurationStatus: 'valid' | 'invalid'
  errorCount: number
  warningCount: number
  suggestionCount: number
  validation?: ValidationResult
  configuration?: {
    hasApiKey: boolean
    hasApiSecret: boolean
    hasEmbedUrl: boolean
    hasWebhookUrl: boolean
    hasSubdomain: boolean
    redirectUrl?: string
  }
}

interface ProviderSummary {
  total: number
  active: number
  valid: number
  invalid: number
  activeProvider: string | null
}

interface TestSummary {
  totalProviders: number
  healthyProviders: number
  warningProviders: number
  errorProviders: number
  untestedProviders: number
}

export default function BookingProvidersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [providers, setProviders] = useState<BookingProvider[]>([])
  const [summary, setSummary] = useState<ProviderSummary | null>(null)
  const [testResults, setTestResults] = useState<ProviderHealthCheck[]>([])
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  // Fetch provider data
  useEffect(() => {
    if (session?.user?.role && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      fetchProviders()
    }
  }, [session])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments/providers?details=true')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
        setSummary(data.summary || null)
      } else {
        console.error('Failed to fetch providers')
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const testProviders = async (providerType?: string) => {
    try {
      setTesting(true)
      const response = await fetch('/api/appointments/providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerType,
          testConnectivity: true,
          testConfiguration: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTestResults(data.results || [])
        setTestSummary(data.summary || null)
      } else {
        console.error('Failed to test providers')
      }
    } catch (error) {
      console.error('Error testing providers:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'valid': return 'text-green-600 bg-green-50'
      case 'invalid': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'acuity': return '📅'
      case 'calendly': return '🗓️'
      case 'simplepractice': return '🏥'
      case 'generic_webhook': return '🔗'
      case 'embed': return '🖼️'
      default: return '❓'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Providers</h1>
          <p className="text-gray-600">Manage and monitor appointment booking integrations</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Providers</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Active Providers</div>
              <div className="text-2xl font-bold text-green-600">{summary.active}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Valid Configurations</div>
              <div className="text-2xl font-bold text-blue-600">{summary.valid}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Current Provider</div>
              <div className="text-sm font-medium text-gray-900">
                {summary.activeProvider || 'None Selected'}
              </div>
            </div>
          </div>
        )}

        {/* Test Results Summary */}
        {testSummary && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Test Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{testSummary.totalProviders}</div>
                <div className="text-sm text-gray-500">Total Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testSummary.healthyProviders}</div>
                <div className="text-sm text-gray-500">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testSummary.warningProviders}</div>
                <div className="text-sm text-gray-500">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testSummary.errorProviders}</div>
                <div className="text-sm text-gray-500">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{testSummary.untestedProviders}</div>
                <div className="text-sm text-gray-500">Untested</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => testProviders()}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              <>
                🧪 Test All Providers
              </>
            )}
          </button>
          
          <button
            onClick={fetchProviders}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            {showDetails ? '🔼 Hide Details' : '🔽 Show Details'}
          </button>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Provider Status</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => {
                  const testResult = testResults.find(r => r.provider.type === provider.type)
                  
                  return (
                    <tr key={provider.type} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getProviderTypeIcon(provider.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                            <div className="text-sm text-gray-500">
                              {provider.type}
                              {provider.isActiveProvider && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.configurationStatus)}`}>
                            {provider.configurationStatus}
                          </span>
                          {testResult && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(testResult.overallStatus)}`}>
                              {testResult.overallStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {showDetails && provider.configuration && (
                          <div className="space-y-1">
                            {provider.configuration.hasApiKey && <div>✅ API Key</div>}
                            {provider.configuration.hasApiSecret && <div>✅ API Secret</div>}
                            {provider.configuration.hasEmbedUrl && <div>✅ Embed URL</div>}
                            {provider.configuration.hasWebhookUrl && <div>✅ Webhook URL</div>}
                            {provider.configuration.hasSubdomain && <div>✅ Subdomain</div>}
                            {provider.configuration.redirectUrl && <div>🔗 Redirect URL</div>}
                          </div>
                        )}
                        {!showDetails && (
                          <div className="text-xs">
                            {provider.active ? 'Enabled' : 'Disabled'}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {provider.errorCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {provider.errorCount} errors
                            </span>
                          )}
                          {provider.warningCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {provider.warningCount} warnings
                            </span>
                          )}
                          {provider.suggestionCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {provider.suggestionCount} suggestions
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => testProviders(provider.type)}
                            disabled={testing}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => setSelectedProvider(selectedProvider === provider.type ? null : provider.type)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider Details Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Provider Details: {providers.find(p => p.type === selectedProvider)?.name}
                  </h3>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {(() => {
                  const provider = providers.find(p => p.type === selectedProvider)
                  const testResult = testResults.find(r => r.provider.type === selectedProvider)
                  
                  return (
                    <div className="space-y-4">
                      {/* Configuration Validation */}
                      {provider?.validation && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Configuration Validation</h4>
                          {provider.validation.errors.length > 0 && (
                            <div className="mb-2">
                              <div className="text-sm font-medium text-red-600 mb-1">Errors:</div>
                              <ul className="text-sm text-red-600 list-disc list-inside">
                                {provider.validation.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {provider.validation.warnings.length > 0 && (
                            <div className="mb-2">
                              <div className="text-sm font-medium text-yellow-600 mb-1">Warnings:</div>
                              <ul className="text-sm text-yellow-600 list-disc list-inside">
                                {provider.validation.warnings.map((warning, idx) => (
                                  <li key={idx}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {provider.validation.suggestions.length > 0 && (
                            <div className="mb-2">
                              <div className="text-sm font-medium text-blue-600 mb-1">Suggestions:</div>
                              <ul className="text-sm text-blue-600 list-disc list-inside">
                                {provider.validation.suggestions.map((suggestion, idx) => (
                                  <li key={idx}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Test Results */}
                      {testResult && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Test Results</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Connectivity:</span>
                                <span className={`ml-2 ${testResult.connectivityTest.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {testResult.connectivityTest.success ? 'Success' : 'Failed'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Response Time:</span>
                                <span className="ml-2 text-gray-600">
                                  {testResult.connectivityTest.responseTime}ms
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Last Checked:</span>
                                <span className="ml-2 text-gray-600">
                                  {new Date(testResult.lastChecked).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Overall Status:</span>
                                <span className={`ml-2 ${getStatusColor(testResult.overallStatus).split(' ')[0]}`}>
                                  {testResult.overallStatus}
                                </span>
                              </div>
                            </div>
                            {testResult.connectivityTest.errorMessage && (
                              <div className="mt-2 text-sm text-red-600">
                                <span className="font-medium">Error:</span> {testResult.connectivityTest.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 