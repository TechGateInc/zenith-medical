import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.com'

export const metadata: Metadata = {
  title: 'Patient Intake Form - Zenith Medical Centre',
  description: 'Complete your secure patient intake form online before your appointment at Zenith Medical Centre. HIPAA & PIPEDA compliant with 256-bit encryption.',
  keywords: 'patient intake form, medical forms, new patient registration, Zenith Medical Centre, secure patient portal, HIPAA compliant',
  openGraph: {
    title: 'Patient Intake Form - Zenith Medical Centre',
    description: 'Complete your secure patient intake form online before your appointment at Zenith Medical Centre. HIPAA & PIPEDA compliant with 256-bit encryption.',
    url: `${baseUrl}/intake`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/zenith-medical-og.jpg`,
        width: 1200,
        height: 630,
        alt: 'Zenith Medical Centre Patient Intake',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Intake Form - Zenith Medical Centre',
    description: 'Complete your secure patient intake form online before your appointment at Zenith Medical Centre. HIPAA & PIPEDA compliant with 256-bit encryption.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/intake`,
  },
}

export default function IntakeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for the patient intake form
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Patient Intake Form",
    "description": "Complete your secure patient intake form online before your appointment at Zenith Medical Centre.",
    "url": `${baseUrl}/intake`,
    "mainEntity": {
      "@type": "MedicalOrganization",
      "name": "Zenith Medical Centre",
      "url": baseUrl,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Medical Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalProcedure",
              "name": "Patient Intake and Registration",
              "description": "Secure online patient intake form for new and existing patients"
            }
          }
        ]
      }
    },
    "provider": {
      "@type": "MedicalOrganization",
      "name": "Zenith Medical Centre",
      "url": baseUrl,
      "telephone": "(555) 123-CARE",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Medical Plaza Drive",
        "addressLocality": "Medical District",
        "addressRegion": "MD",
        "postalCode": "12345",
        "addressCountry": "US"
      }
    },
    "potentialAction": {
      "@type": "Action",
      "name": "Complete Patient Intake Form",
      "target": `${baseUrl}/intake`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
} 