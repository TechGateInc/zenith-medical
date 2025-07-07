import type { Metadata } from 'next'

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
  return children
} 