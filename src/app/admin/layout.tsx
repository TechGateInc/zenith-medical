import type { Metadata } from 'next'
import AdminSidebar from '@/components/Admin/AdminSidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Zenith Medical Centre',
  description: 'Secure administrative dashboard for Zenith Medical Centre staff',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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