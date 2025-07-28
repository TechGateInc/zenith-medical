'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/use-auth'
import { DashboardSkeleton } from '@/components/UI/SkeletonLoader'

export default function AdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        router.replace('/admin/dashboard')
      } else {
        // Redirect unauthenticated users to login
        router.replace('/admin/login')
      }
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading while determining redirect
  return <DashboardSkeleton />
} 