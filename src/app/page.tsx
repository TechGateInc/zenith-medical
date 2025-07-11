import Layout from '../components/Layout/Layout'
import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, generateHomepageStructuredData, PAGE_METADATA } from '../lib/utils/seo'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  author: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog?limit=2`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Failed to fetch blog posts')
      return []
    }
    
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.home,
  canonical: '/',
})

export default async function Home() {
  const structuredData = generateHomepageStructuredData()
  const blogPosts = await getBlogPosts()

  return (
    <Layout className="bg-slate-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section with Prominent CTAs */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Efficient Medical Centre
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-slate-800 leading-tight">
                  Your Health, Our Innovation
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Experience healthcare reimagined at our state-of-the-art medical centre. We combine efficient medical technology with compassionate patient care to deliver exceptional healthcare for you and your family.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </Link>
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-lg whitespace-nowrap"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Patient Intake Form
                  </Link>
                </div>

                <div className="inline-flex items-center justify-center lg:justify-start px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-slate-700">
                    <span className="text-sm">Now Open:</span>
                    <span className="font-semibold ml-1">Accepting New Patients</span>
                    <span className="text-sm ml-2">• Walk-In Patients Welcome</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-blue-600 rounded-full"></div>
                    <div className="absolute top-12 right-8 w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="absolute bottom-8 left-8 w-4 h-4 bg-blue-700 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-blue-400 rounded-full"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-800 mb-2">State-of-the-Art Facility</h3>
                    <p className="text-blue-700">Brand new efficient medical centre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Services Overview */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Medical Services
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">Our Medical Services</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive healthcare services for you and your family with efficient medical expertise and compassionate care
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Family Medicine</h3>
                <p className="text-slate-600">Complete primary care for patients of all ages with personalized treatment plans.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v1M9 5a2 2 0 012 2v1M9 5V3m4 4V3m0 4h5a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Preventive Care</h3>
                <p className="text-slate-600">Regular check-ups, screenings, and vaccinations to keep you healthy.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Chronic Disease Management</h3>
                <p className="text-slate-600">Ongoing management of chronic conditions with coordinated care plans.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Mental Health Care</h3>
                <p className="text-slate-600">Comprehensive mental health support and counseling services for emotional wellness.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">General Health Checks</h3>
                <p className="text-slate-600">Comprehensive health assessments and routine medical examinations.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Acute Illness Care</h3>
                <p className="text-slate-600">Immediate treatment for sudden illnesses, infections, and urgent health concerns.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Immunization</h3>
                <p className="text-slate-600">Vaccinations for all ages including routine immunizations and travel vaccines.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">Why Choose Zenith Medical Centre?</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Experience the difference that our efficient medical facility, advanced technology, and patient-focused care make in your healthcare journey
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content - Features Grid */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Experienced Medical Team</h3>
                    <p className="text-slate-600 leading-relaxed">Board-certified physicians with decades of combined experience in family medicine and specialized care.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Walk-In Patients Welcome</h3>
                    <p className="text-slate-600 leading-relaxed">Walk-in patients are always welcome. Being seen depends on doctor availability, ensuring you get care when our medical team is available.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Efficient Facilities</h3>
                    <p className="text-slate-600 leading-relaxed">State-of-the-art medical equipment and comfortable, clean facilities designed for optimal patient care.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Patient-Centered Care</h3>
                    <p className="text-slate-600 leading-relaxed">Personalized treatment plans focused on your individual health goals, needs, and comprehensive wellness.</p>
                  </div>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-6 left-6 w-12 h-12 bg-purple-600 rounded-full"></div>
                    <div className="absolute top-16 right-12 w-8 h-8 bg-purple-500 rounded-full"></div>
                    <div className="absolute bottom-12 left-12 w-6 h-6 bg-purple-700 rounded-full"></div>
                    <div className="absolute bottom-6 right-6 w-16 h-16 bg-purple-400 rounded-full"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-800 mb-2">Excellence in Care</h3>
                    <p className="text-purple-700">Trusted by thousands of families</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-slate-50 rounded-xl p-8 mb-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Healthcare Access
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                  Ready to Start Your Healthcare Journey?
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Experience comprehensive healthcare with efficient medical expertise and compassionate patient care. 
                  Join thousands of patients who trust Zenith Medical Centre for their healthcare needs.
                </p>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Walk-In Patients Welcome</h3>
                    <p className="text-sm text-slate-600">
                      Walk-in anytime - care provided based on doctor availability.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Secure Health Records</h3>
                    <p className="text-sm text-slate-600">
                      HIPAA-compliant digital records with secure patient portal access.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 3v12m0 0l3-3m-3 3l-3-3m12-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Instant Updates</h3>
                    <p className="text-sm text-slate-600">
                      Get real-time notifications about appointments and health updates.
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Schedule Appointment
                  </Link>
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-lg whitespace-nowrap"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Complete Intake Form
                  </Link>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">Your Health Journey</h3>
                      <p className="text-blue-700">Starts with a single appointment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News and Insights Blog Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Health Insights
              </span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Latest Health Insights</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Stay informed with the latest health tips, medical insights, and updates from our healthcare professionals.
            </p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {blogPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-slate-500">
                      <span className="font-medium">{post.author}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Health insights coming soon</h3>
              <p className="text-slate-600">Check back for the latest health tips and medical insights from our team.</p>
            </div>
          )}

          {blogPosts.length > 0 && (
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                View All Articles
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* Quick Access Cards */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Quick Access
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">Get Started Today</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Choose your next step towards better health and wellness
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/contact" className="block">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Schedule Appointment</h3>
              <p className="text-slate-600">Book your next visit with our medical team</p>
            </div>
          </Link>

          <Link href="/intake" className="block">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Patient Intake</h3>
              <p className="text-slate-600">Complete your intake form before your visit</p>
            </div>
          </Link>

          <Link href="/faq" className="block">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Questions?</h3>
              <p className="text-slate-600">Find answers to common patient questions</p>
            </div>
          </Link>
        </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 