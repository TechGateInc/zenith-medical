import { type Metadata } from 'next'

interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogType?: 'website' | 'article'
  ogImage?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zenithmedical.ca'
const siteName = 'Zenith Medical Centre'
const defaultImage = `${baseUrl}/api/og`

export function generateMetadata(data: SEOData): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogType = 'website',
    ogImage = defaultImage,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = data

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const url = canonical ? `${baseUrl}${canonical}` : baseUrl

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: siteName }],
    publisher: siteName,
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
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ZenithMedical',
      creator: author ? `@${author.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}` : '@ZenithMedical',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      'business:contact_data:locality': 'Medical District',
      'business:contact_data:region': 'MD',
      'business:contact_data:postal_code': '21201',
      'business:contact_data:country_name': 'United States',
      'business:contact_data:phone_number': '+15551234567',
      'business:contact_data:website': baseUrl,
    },
  }

  return metadata
}

export function generateHomepageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: siteName,
    description: 'Comprehensive family medicine and healthcare services providing compassionate, patient-centered care for individuals and families.',
    url: baseUrl,
    logo: `${baseUrl}/images/zenith-medical-logo.png`,
    image: `${baseUrl}/images/zenith-medical-center.jpg`,
    telephone: '+1-555-123-2273',
    email: 'info@zenithmediacl.ca',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Healthcare Drive',
      addressLocality: 'Medical District',
      addressRegion: 'MD',
      postalCode: '21201',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '39.2904',
      longitude: '-76.6122',
    },
    openingHours: [
      'Mo-Fr 08:00-18:00',
      'Sa 09:00-14:00',
      'Su closed',
    ],
    priceRange: '$$',
    medicalSpecialty: [
      'Family Medicine',
      'Preventive Care',
      'Chronic Disease Management',
      'Pediatric Care',
      'Geriatric Care',
      'Women\'s Health',
      'Mental Health',
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Medical License',
      recognizedBy: {
        '@type': 'Organization',
        name: 'State Medical Board',
      },
    },
    sameAs: [
      'https://www.facebook.com/zenithmedical',
      'https://www.twitter.com/zenithmedical',
      'https://www.linkedin.com/company/zenithmedical',
      'https://www.instagram.com/zenithmedical',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-2273',
        contactType: 'customer service',
        availableLanguage: ['English'],
        areaServed: 'MD',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+1-911',
        contactType: 'emergency',
        availableLanguage: ['English'],
        areaServed: 'US',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '247',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Excellent care from Dr. Mitchell and the entire team. They take time to listen and provide thorough explanations.',
        datePublished: '2024-01-10',
      },
    ],
  }
}

export function generateBlogStructuredData(post: {
  title: string
  excerpt: string
  author: string
  publishDate: string
  slug: string
  tags: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `${baseUrl}/images/blog/${post.slug}.jpg`,
    author: {
      '@type': 'Person',
      name: post.author,
      affiliation: {
        '@type': 'Organization',
        name: siteName,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/zenith-medical-logo.png`,
      },
    },
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: 'Health & Wellness',
    about: {
      '@type': 'Thing',
      name: 'Healthcare',
    },
  }
}

export function generateDoctorStructuredData(doctor: {
  name: string
  title: string
  specialties: string[]
  education?: string[]
  experience?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.name,
    jobTitle: doctor.title,
    worksFor: {
      '@type': 'MedicalOrganization',
      name: siteName,
    },
    medicalSpecialty: doctor.specialties,
    ...(doctor.education && {
      alumniOf: doctor.education.map(edu => ({
        '@type': 'EducationalOrganization',
        name: edu,
      })),
    }),
    ...(doctor.experience && { description: doctor.experience }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Healthcare Drive',
      addressLocality: 'Medical District',
      addressRegion: 'MD',
      postalCode: '21201',
      addressCountry: 'US',
    },
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  }
}

// Common keyword sets for different page types
export const KEYWORDS = {
  medical: [
    'family medicine',
    'healthcare',
    'medical center',
    'doctor',
    'physician',
    'health clinic',
    'primary care',
    'medical services',
  ],
  preventive: [
    'preventive care',
    'health screening',
    'physical exam',
    'vaccination',
    'wellness check',
    'health maintenance',
  ],
  chronic: [
    'chronic disease',
    'diabetes',
    'hypertension',
    'heart disease',
    'chronic care management',
    'disease management',
  ],
  mental: [
    'mental health',
    'depression',
    'anxiety',
    'counseling',
    'therapy',
    'psychological care',
  ],
  womens: [
    'women\'s health',
    'gynecology',
    'mammogram',
    'pap smear',
    'reproductive health',
    'women\'s wellness',
  ],
  pediatric: [
    'pediatric care',
    'children\'s health',
    'pediatrician',
    'child development',
    'infant care',
    'adolescent health',
  ],
  senior: [
    'geriatric care',
    'senior health',
    'elderly care',
    'aging',
    'geriatrician',
    'senior wellness',
  ],
}

// Pre-built metadata for common pages
export const PAGE_METADATA = {
  home: {
    title: 'Zenith Medical Centre - Comprehensive Family Healthcare',
    description: 'Quality family medicine and healthcare services in Medical District, MD. Preventive care, chronic disease management, and comprehensive health services for all ages.',
    keywords: [...KEYWORDS.medical, ...KEYWORDS.preventive],
  },
  about: {
    title: 'About Our Medical Team',
    description: 'Meet our experienced physicians and healthcare professionals at Zenith Medical Centre. Learn about our mission, values, and commitment to exceptional patient care.',
    keywords: [...KEYWORDS.medical, 'medical team', 'physicians', 'healthcare professionals'],
  },
  services: {
    title: 'Medical Services & Specialties',
    description: 'Comprehensive medical services including family medicine, preventive care, chronic disease management, women\'s health, pediatric care, and mental health services.',
    keywords: [...KEYWORDS.medical, ...KEYWORDS.preventive, ...KEYWORDS.chronic],
  },
  contact: {
    title: 'Contact Us & Location',
    description: 'Contact Zenith Medical Centre for appointments, questions, or information. Located in Medical District, MD with convenient hours and same-day appointments available.',
    keywords: [...KEYWORDS.medical, 'contact', 'location', 'appointments', 'office hours'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our medical services, appointments, insurance, and patient care at Zenith Medical Centre.',
    keywords: [...KEYWORDS.medical, 'faq', 'questions', 'patient information', 'insurance'],
  },
  blog: {
    title: 'Health & Wellness Blog',
    description: 'Expert medical insights, health tips, and wellness guidance from the healthcare professionals at Zenith Medical Centre.',
    keywords: [...KEYWORDS.medical, 'health blog', 'medical articles', 'health tips', 'wellness'],
  },
} 