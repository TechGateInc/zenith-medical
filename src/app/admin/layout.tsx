'use client'

import AdminSidebar from '@/components/Admin/AdminSidebar'
import { SidebarProvider, useSidebar } from '@/lib/contexts/SidebarContext'
import { usePathname } from 'next/navigation'
import ToastProvider from '@/components/UI/ToastProvider'
import SessionHandler from '@/lib/auth/session-handler'

// Note: Since this is now a client component, metadata is handled at page level
function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  
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
      <div className={`transition-all duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SessionHandler>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </SessionHandler>
      <ToastProvider />
    </SidebarProvider>
  )
} 