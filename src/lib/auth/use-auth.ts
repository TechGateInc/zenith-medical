'use client'

import { useSession } from 'next-auth/react'
import { AdminRole } from '@prisma/client'
import { hasPermission } from './config'

export function useAuth() {
  const { data: session, status } = useSession()
  
  const user = session?.user
  const isLoading = status === 'loading'
  const isAuthenticated = !!user && status === 'authenticated'

  const checkPermission = (requiredRole: AdminRole): boolean => {
    if (!user?.role) return false
    return hasPermission(user.role as AdminRole, requiredRole)
  }

  const isEditor = user?.role === AdminRole.EDITOR
  const isAdmin = user?.role === AdminRole.ADMIN || user?.role === AdminRole.SUPER_ADMIN
  const isSuperAdmin = user?.role === AdminRole.SUPER_ADMIN

  return {
    user,
    isLoading,
    isAuthenticated,
    checkPermission,
    isEditor,
    isAdmin,
    isSuperAdmin,
    session
  }
}

export type AuthUser = {
  id: string
  email: string
  name: string
  role: AdminRole
} 