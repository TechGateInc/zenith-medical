'use client'

/**
 * Team Management Page
 * Route: /admin/content/team
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminRole } from '@prisma/client'
import TeamManager from '@/components/Admin/TeamManager'
import { TableSkeleton } from '@/components/UI/SkeletonLoader'

export default function TeamManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check admin role - use proper enum value
    if (session.user.role !== AdminRole.ADMIN && session.user.role !== AdminRole.SUPER_ADMIN) {
      router.push('/admin/dashboard')
      return
    }

    setLoading(false)
  }, [session, status, router])

  if (loading) {
    return <TableSkeleton rows={5} columns={6} />
  }

  return <TeamManager />
} 