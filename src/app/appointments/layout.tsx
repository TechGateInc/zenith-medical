import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request Appointment | Zenith Medical Centre',
  description: 'Schedule your appointment at Zenith Medical Centre. Easy online booking for all medical services.',
  keywords: 'appointment booking, medical appointment, healthcare, Zenith Medical Centre',
  openGraph: {
    title: 'Request Appointment | Zenith Medical Centre',
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