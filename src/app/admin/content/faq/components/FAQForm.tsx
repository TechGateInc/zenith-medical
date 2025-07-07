'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

interface FAQFormProps {
  mode: 'create' | 'edit'
  initialData?: FAQItem
}

export default function FAQForm({ mode, initialData }: FAQFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    published: false,
    sortOrder: 1
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  // Common FAQ categories
  const commonCategories = [
    'General Information',
    'Appointments',
    'Insurance & Billing',
    'Services',
    'Patient Care',
    'Medications',
    'Forms & Documents',
    'Contact & Location'
  ]

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        category: initialData.category || '',
        published: initialData.published,
        sortOrder: initialData.sortOrder
      })
    }
  }, [mode, initialData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required'
    } else if (formData.question.length > 500) {
      newErrors.question = 'Question should be 500 characters or less'
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required'
    } else if (formData.answer.length > 2000) {
      newErrors.answer = 'Answer should be 2000 characters or less'
    }

    if (formData.category && formData.category.length > 100) {
      newErrors.category = 'Category should be 100 characters or less'
    }

    if (formData.sortOrder < 1 || formData.sortOrder > 1000) {
      newErrors.sortOrder = 'Sort order must be between 1 and 1000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submissionData = {
        ...formData,
        published: publish || formData.published,
        category: formData.category.trim() || null
      }

      const url = mode === 'create' 
        ? '/api/admin/content/faq'
        : `/api/admin/content/faq/${initialData?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save FAQ')
      }

      const data = await response.json()
      
      // Success - redirect to FAQ management
      router.push('/admin/content/faq')
      
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving FAQ: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/content/faq"
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to FAQ Management
          </Link>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-gray-500 hover:text-gray-700"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question */}
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  id="question"
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.question ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the frequently asked question"
                />
                {errors.question && <p className="mt-1 text-sm text-red-600">{errors.question}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.question.length}/500 characters
                </p>
              </div>

              {/* Answer */}
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Answer *
                </label>
                {previewMode ? (
                  <div className="border border-gray-300 rounded-lg p-4 min-h-48 bg-gray-50">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.answer.replace(/\n/g, '<br />') }}
                    />
                  </div>
                ) : (
                  <textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => handleInputChange('answer', e.target.value)}
                    rows={12}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.answer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Provide a comprehensive answer to the question. You can use HTML tags for formatting."
                  />
                )}
                {errors.answer && <p className="mt-1 text-sm text-red-600">{errors.answer}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.answer.length}/2000 characters. You can use HTML tags for formatting.
                </p>
              </div>

              {/* Preview Card */}
              {previewMode && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{formData.question}</h4>
                      <div className="flex items-center space-x-2">
                        {formData.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formData.category}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formData.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formData.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="text-gray-600 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.answer.replace(/\n/g, '<br />') }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      list="categories"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter or select category"
                    />
                    <datalist id="categories">
                      {commonCategories.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.category.length}/100 characters
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Common categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {commonCategories.slice(0, 4).map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleInputChange('category', category)}
                          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs transition-colors"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                      Published
                    </label>
                  </div>

                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      min="1"
                      max="1000"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.sortOrder ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.sortOrder && <p className="mt-1 text-xs text-red-600">{errors.sortOrder}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saving...' : mode === 'create' ? 'Create FAQ' : 'Update FAQ'}
                </button>

                {mode === 'create' && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Publishing...' : 'Create & Publish'}
                  </button>
                )}

                <Link
                  href="/admin/content/faq"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors text-center block"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 