import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import SessionProvider from '../lib/auth/session-provider'
import { AnalyticsProvider, ScrollTracker, TimeTracker } from '../components/Analytics/AnalyticsProvider'
import AnalyticsConsent from '../components/Analytics/AnalyticsConsent'
import ToastProvider from '../components/UI/ToastProvider'


// Primary font for body text and UI elements
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zenithmedical.ca'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Zenith Medical Centre - Comprehensive Family Healthcare',
    template: '%s | Zenith Medical Centre',
  },
  description: 'Quality family medicine and healthcare services in Medical District, MD. Preventive care, chronic disease management, and comprehensive health services for all ages.',
  keywords: 'family medicine, healthcare, medical center, doctor, physician, health clinic, primary care, Medical District MD',
  authors: [{ name: 'Zenith Medical Centre' }],
  creator: 'Zenith Medical Centre',
  publisher: 'Zenith Medical Centre',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/images/zenith-medical-logo single new.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    shortcut: '/images/zenith-medical-logo single new.png',
    apple: [
      {
        url: '/images/zenith-medical-logo single new.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'medical',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Zenith Medical Centre',
    title: 'Zenith Medical Centre - Comprehensive Family Healthcare',
    description: 'Quality family medicine and healthcare services in Medical District, MD. Preventive care, chronic disease management, and comprehensive health services for all ages.',
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Zenith Medical Centre',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ZenithMedical',
    creator: '@ZenithMedical',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isAdmin = pathname.startsWith('/admin')
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <SessionProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <ToastProvider />
              {children}
              <ScrollTracker />
              <TimeTracker />
              {!isAdmin && <AnalyticsConsent />}
            </AnalyticsProvider>
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  )
} 