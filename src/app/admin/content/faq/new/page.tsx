'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../lib/auth/use-auth'
import FAQForm from '../components/FAQForm'
import { FormSkeleton } from '@/components/UI/SkeletonLoader'

export default function NewFAQPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Create New FAQ</h1>
            <p className="text-gray-600">Add a new frequently asked question to help your patients</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FAQForm mode="create" />
      </div>
    </div>
  )
} 