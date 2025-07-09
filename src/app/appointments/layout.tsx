import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schedule Appointment | Zenith Medical Centre',
  description: 'Book your medical appointment online with our experienced healthcare team. Easy scheduling for consultations, check-ups, and specialized care.',
  keywords: 'appointment booking, medical appointment, healthcare scheduling, doctor appointment, family medicine',
  openGraph: {
    title: 'Schedule Your Medical Appointment',
    description: 'Book your appointment online with Zenith Medical Centre. Professional healthcare services with convenient online scheduling.',
    type: 'website'
  }
}

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 