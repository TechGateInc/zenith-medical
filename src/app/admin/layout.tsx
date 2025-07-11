'use client'

import type { Metadata } from 'next'
import AdminSidebar from '@/components/Admin/AdminSidebar'
import { usePathname } from 'next/navigation'

// Note: Since this is now a client component, metadata is handled at page level
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't show sidebar on login page
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="lg:pl-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
} 