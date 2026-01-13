'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string | null
}

interface Location {
  id: string
  name: string
  slug: string
  primaryPhone: string
  primaryColor: string
  bookingUrl: string | null
  patientIntakeUrl: string | null
}

export default function LocationFAQPage() {
  const params = useParams()
  const locationSlug = params.location as string

  const [location, setLocation] = useState<Location | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [locRes, faqRes] = await Promise.all([
          fetch(`/api/locations/${locationSlug}`),
          fetch(`/api/faq?location=${locationSlug}`)
        ])

        if (locRes.ok) {
          const locData = await locRes.json()
          setLocation(locData.location)
        }

        if (faqRes.ok) {
          const faqData = await faqRes.json()
          setFaqs(faqData.faqs || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [locationSlug])

  const categories = [
    { id: 'all', name: 'All Questions' },
    ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean)))
      .map(cat => ({ id: cat as string, name: cat as string }))
  ]

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = activeCategory === 'all'
    ? faqs
    : faqs.filter(item => item.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Location Not Found</h1>
          <Link href="/location-selector" className="text-blue-600 hover:underline">
            Return to Location Selector
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  {location.name}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Find answers to common questions about our medical services at {location.name}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact CTA */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Our healthcare team is here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/${location.slug}/contact`}
                    className="text-white font-semibold py-3 px-8 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                    style={{ backgroundColor: location.primaryColor }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </Link>
                  <a
                    href={`tel:${location.primaryPhone.replace(/\s/g, '')}`}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call {location.primaryPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        {categories.length > 1 && (
          <section className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Browse by Category</h2>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      activeCategory === category.id
                        ? 'text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-300'
                    }`}
                    style={activeCategory === category.id ? { backgroundColor: location.primaryColor } : {}}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Items */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                No FAQs available at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    >
                      <h3 className="text-lg font-semibold text-slate-800 pr-4 leading-relaxed">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center transition-all ${
                          expandedItems.includes(faq.id) ? 'border-blue-500 bg-blue-500' : 'hover:border-blue-400'
                        }`}>
                          <svg
                            className={`h-4 w-4 transition-all duration-200 ${
                              expandedItems.includes(faq.id) ? 'rotate-180 text-white' : 'text-slate-500'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {expandedItems.includes(faq.id) && (
                      <div className="px-8 pb-6">
                        <div className="border-t border-slate-200 pt-6">
                          <p className="text-slate-600 leading-relaxed text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Emergency Notice */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-2xl p-8 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-red-800 mb-4">Medical Emergency</h3>
                  <p className="text-red-700 text-lg mb-6 leading-relaxed">
                    For life-threatening emergencies, call 911 immediately or go to your nearest emergency room.
                  </p>
                  <a
                    href="tel:911"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call 911
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
