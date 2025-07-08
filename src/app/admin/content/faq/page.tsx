'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../lib/auth/use-auth'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function FAQManagementPage() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch FAQs
  useEffect(() => {
    if (isAuthenticated) {
      fetchFAQs()
    }
  }, [isAuthenticated])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content/faq', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch FAQs')
      }

      const data = await response.json()
      setFaqs(data.faqs)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.faqs.map((faq: FAQItem) => faq.category))].filter(Boolean) as string[]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (faqId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/faq/${faqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ published: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update FAQ status')
      }

      // Refresh the FAQs list
      fetchFAQs()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update FAQ status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const updateSortOrder = async (faqId: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/admin/content/faq/${faqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ sortOrder: newOrder })
      })

      if (!response.ok) {
        throw new Error('Failed to update FAQ order')
      }

      // Refresh the FAQs list
      fetchFAQs()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update FAQ order: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const deleteFAQ = async (faqId: string, question: string) => {
    if (!confirm(`Are you sure you want to delete "${question}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/content/faq/${faqId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      // Refresh the FAQs list
      fetchFAQs()
      alert('FAQ deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete FAQ: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const moveFAQ = (faqId: string, direction: 'up' | 'down') => {
    const currentFAQ = faqs.find(f => f.id === faqId)
    if (!currentFAQ) return

    const sortedFAQs = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder)
    const currentIndex = sortedFAQs.findIndex(f => f.id === faqId)
    
    if (direction === 'up' && currentIndex > 0) {
      const targetFAQ = sortedFAQs[currentIndex - 1]
      updateSortOrder(faqId, targetFAQ.sortOrder)
      updateSortOrder(targetFAQ.id, currentFAQ.sortOrder)
    } else if (direction === 'down' && currentIndex < sortedFAQs.length - 1) {
      const targetFAQ = sortedFAQs[currentIndex + 1]
      updateSortOrder(faqId, targetFAQ.sortOrder)
      updateSortOrder(targetFAQ.id, currentFAQ.sortOrder)
    }
  }

  const filteredFAQs = faqs
    .filter(faq => {
      if (filter === 'published') return faq.published
      if (filter === 'draft') return !faq.published
      return true
    })
    .filter(faq => {
      if (categoryFilter === 'all') return true
      return faq.category === categoryFilter
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

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
                <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
                <p className="text-gray-600">Manage frequently asked questions and patient resources</p>
              </div>
            </div>
            <Link
              href="/admin/content/faq/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New FAQ
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">Filter FAQs</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All FAQs ({faqs.length})</option>
                <option value="published">Published ({faqs.filter(f => f.published).length})</option>
                <option value="draft">Drafts ({faqs.filter(f => !f.published).length})</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchFAQs}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* FAQs List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading FAQs...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 font-medium">Error loading FAQs</p>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchFAQs}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No FAQs found</p>
            <p className="text-gray-400">
              {filter === 'all' ? 'Create your first FAQ to get started.' : `No ${filter} FAQs found.`}
            </p>
            <Link
              href="/admin/content/faq/new"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create First FAQ
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={faq.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          faq.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {faq.published ? 'Published' : 'Draft'}
                        </span>
                        {faq.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{faq.answer}</p>
                      <p className="text-xs text-gray-400">
                        Order: {faq.sortOrder} • Created: {new Date(faq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => moveFAQ(faq.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveFAQ(faq.id, 'down')}
                        disabled={index === filteredFAQs.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/admin/content/faq/${faq.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublished(faq.id, faq.published)}
                        className={`text-sm font-medium ${
                          faq.published 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {faq.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteFAQ(faq.id, faq.question)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 