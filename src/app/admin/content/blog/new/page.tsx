'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../lib/auth/use-auth'
import BlogPostForm from '../components/BlogPostForm'
import { FormSkeleton } from '@/components/UI/SkeletonLoader'

export default function NewBlogPostPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <FormSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <p className="text-gray-600">Share health insights and clinic updates with your patients</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogPostForm mode="create" />
      </div>
    </div>
  )
} 