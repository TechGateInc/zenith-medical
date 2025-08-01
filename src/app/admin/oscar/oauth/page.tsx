'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface OAuthSetupForm {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
  callbackUrl?: string
}

export default function OscarOAuthSetupPage() {
  const { data: session, status } = useSession()
  const [form, setForm] = useState<OAuthSetupForm>({
    baseUrl: '',
    consumerKey: '',
    consumerSecret: '',
    callbackUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not admin
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role)) {
    redirect('/admin/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/oscar/oauth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate OAuth setup')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof OAuthSetupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Oscar EMR OAuth Setup
          </h1>
          <p className="mt-2 text-gray-600">
            Configure OAuth authentication with your Oscar EMR system
          </p>
        </div>

        <div className="p-6">
          {/* Information Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Before You Begin
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure Oscar EMR REST API module is enabled</li>
              <li>• Have your Oscar administrator register this application</li>
              <li>• Obtain Consumer Key and Consumer Secret from Oscar</li>
              <li>• Make sure you have admin access to your Oscar system</li>
            </ul>
          </div>

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oscar EMR Base URL
                </label>
                <input
                  type="url"
                  value={form.baseUrl}
                  onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                  placeholder="https://your-oscar-server.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  The base URL of your Oscar EMR installation (without trailing slash)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Key
                </label>
                <input
                  type="text"
                  value={form.consumerKey}
                  onChange={(e) => handleInputChange('consumerKey', e.target.value)}
                  placeholder="your-oscar-consumer-key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Provided by your Oscar administrator when registering the application
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Secret
                </label>
                <input
                  type="password"
                  value={form.consumerSecret}
                  onChange={(e) => handleInputChange('consumerSecret', e.target.value)}
                  placeholder="your-oscar-consumer-secret"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Keep this secret secure - it&apos;s used to authenticate your application
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Callback URL (Optional)
                </label>
                <input
                  type="url"
                  value={form.callbackUrl}
                  onChange={(e) => handleInputChange('callbackUrl', e.target.value)}
                  placeholder={`${typeof window !== 'undefined' ? window.location.origin : ''}/admin/oscar/oauth/callback`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave blank to use the default callback URL
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Initiating OAuth Setup...' : 'Start OAuth Setup'}
              </button>
            </form>
          )}

          {result && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  OAuth Setup Initiated Successfully!
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  {result.message}
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-green-900">Next Steps:</h4>
                  <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                    {result.instructions?.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <a
                    href={result.authorizeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Open Authorization URL
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Important:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Complete the authorization in the same browser session</li>
                  <li>• Do not close this window until the process is complete</li>
                  <li>• You will be redirected back automatically after authorization</li>
                  <li>• The OAuth tokens will expire if not completed within 1 hour</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setResult(null)
                  setForm({
                    baseUrl: '',
                    consumerKey: '',
                    consumerSecret: '',
                    callbackUrl: ''
                  })
                }}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 