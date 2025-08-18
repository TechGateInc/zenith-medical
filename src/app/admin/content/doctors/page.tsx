'use client'

/**
 * Doctor Profiles Management Page
 * Route: /admin/content/doctors
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminRole } from '@prisma/client'
import DoctorManager from '@/components/Admin/DoctorManager'
import { TableSkeleton } from '@/components/UI/SkeletonLoader'

export default function DoctorProfilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check admin role
    if (session.user.role !== AdminRole.ADMIN && session.user.role !== AdminRole.SUPER_ADMIN) {
      router.push('/admin/dashboard')
      return
    }

    setLoading(false)
  }, [session, status, router])

  if (loading) {
    return <TableSkeleton rows={5} columns={6} />
  }

  return <DoctorManager />
}
