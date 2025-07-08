import type { Metadata } from 'next'
import AdminNavigation from '@/components/Admin/AdminNavigation'

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
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main>
        {children}
      </main>
    </div>
  )
} 