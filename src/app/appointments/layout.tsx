import type { Metadata } from 'next'
import Layout from '../../components/Layout/Layout'

export const metadata: Metadata = {
  title: 'Book Appointment | Zenith Medical Centre',
  description: 'Schedule your appointment at Zenith Medical Centre. Easy online booking for all medical services.',
  keywords: 'appointment booking, medical appointment, healthcare, Zenith Medical Centre',
  openGraph: {
    title: 'Book Appointment | Zenith Medical Centre',
    description: 'Schedule your appointment at Zenith Medical Centre. Easy online booking for all medical services.',
    type: 'website',
  },
}

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 