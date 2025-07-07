'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../../../lib/auth/use-auth'
import FAQForm from '../../components/FAQForm'

interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
  createdByUser?: {
    email: string
    name?: string
  }
}

export default function EditFAQPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [faq, setFaq] = useState<FAQItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const faqId = params.id as string

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch FAQ data
  useEffect(() => {
    if (isAuthenticated && faqId) {
      fetchFAQ()
    }
  }, [isAuthenticated, faqId])

  const fetchFAQ = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/content/faq/${faqId}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('FAQ not found')
        }
        throw new Error('Failed to fetch FAQ')
      }

      const data = await response.json()
      setFaq(data.faq)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load FAQ')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Error loading FAQ</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchFAQ}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!faq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">FAQ not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit FAQ</h1>
            <p className="text-gray-600">Editing: {faq.question}</p>
            {faq.createdByUser && (
              <p className="text-sm text-gray-500 mt-1">
                Created by {faq.createdByUser.name || faq.createdByUser.email} on{' '}
                {new Date(faq.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FAQForm mode="edit" initialData={faq} />
      </div>
    </div>
  )
} 