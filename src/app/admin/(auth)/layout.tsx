import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login - Zenith Medical Centre',
  description: 'Secure login for Zenith Medical Centre administrative staff',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 