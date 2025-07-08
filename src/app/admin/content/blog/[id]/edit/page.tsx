'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../../../lib/auth/use-auth'
import BlogPostForm from '../../components/BlogPostForm'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured: boolean
  published: boolean
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
  createdByUser?: {
    email: string
    name?: string
  }
}

export default function EditBlogPostPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const postId = params.id as string

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch blog post data
  useEffect(() => {
    if (!isAuthenticated || !postId) return

    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content/blog/${postId}`, {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found')
          }
          throw new Error('Failed to fetch blog post')
        }

        const data = await response.json()
        setPost(data.post)
        setError(null) // Clear any previous errors
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [isAuthenticated, postId, retryCount])

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
          <p className="text-red-800 font-medium">Error loading blog post</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-gray-500 font-medium">Blog post not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600">Editing: {post.title}</p>
            {post.createdByUser && (
              <p className="text-sm text-gray-500 mt-1">
                Created by {post.createdByUser.name || post.createdByUser.email} on{' '}
                {new Date(post.createdAt).toLocaleDateString('en-US', {
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
        <BlogPostForm mode="edit" initialData={post} />
      </div>
    </div>
  )
} 