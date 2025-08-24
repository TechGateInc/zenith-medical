'use client'

import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { generateFAQStructuredData } from '../../lib/utils/seo'
import { useCachedPrimaryPhone } from '@/lib/hooks/useCachedAddress'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone()

  const faqData: FAQItem[] = [
    // Appointments & Scheduling
    {
      id: 'apt-1',
      question: 'How do I schedule an appointment?',
      answer: `You can schedule an appointment by calling our office at ${phoneLoading ? '249 806 0128' : primaryPhone}, using our online contact form, or completing the patient intake form. We offer both routine appointments and welcome walk-in patients for urgent care needs.`,
      category: 'appointments'
    },
    {
      id: 'apt-2', 
      question: 'What should I bring to my first appointment?',
      answer: 'Please bring a valid photo ID, your health insurance card, a list of current medications, any relevant medical records or test results, and completed patient intake forms. If you have specific health concerns, prepare a list of symptoms and questions.',
      category: 'appointments'
    },
    {
      id: 'apt-3',
      question: 'How far in advance should I book an appointment?',
      answer: 'For routine check-ups, we recommend booking 2-4 weeks in advance. For urgent care needs, walk-in patients are welcome. Annual physicals and specialized consultations may require longer lead times during busy periods.',
      category: 'appointments'
    },
    {
      id: 'apt-4',
      question: 'Do you accept walk-in patients?',
      answer: 'Yes, walk-in patients are always welcome. Being seen depends on doctor availability. We recommend calling ahead to check availability for urgent medical needs like acute illnesses, minor injuries, and urgent health concerns.',
      category: 'appointments'
    },

    // Insurance & Billing
    {
      id: 'ins-1',
      question: 'What insurance plans do you accept?',
      answer: 'We accept most major insurance plans including provincial health insurance (OHIP, MSP, etc.), extended health insurance plans, workers\' compensation claims, and third-party insurance. Please call to verify your specific plan coverage.',
      category: 'insurance'
    },
    {
      id: 'ins-2',
      question: 'What if I don\'t have insurance?',
      answer: 'We offer flexible payment options for uninsured patients, including payment plans and competitive self-pay rates. Please speak with our billing department to discuss your options and find a solution that works for your budget.',
      category: 'insurance'
    },
    {
      id: 'ins-3',
      question: 'Do you offer direct billing?',
      answer: 'Yes, we offer direct billing for most extended health insurance plans. This means you may only need to pay your co-payment or deductible at the time of service. We handle the insurance claim process for you.',
      category: 'insurance'
    },

    // Services & Treatments
    {
      id: 'svc-1',
      question: 'What services do you provide?',
      answer: 'We offer comprehensive family medicine including routine check-ups, preventive care, chronic disease management, women\'s health, pediatric care, geriatric care, mental health support, minor procedures, laboratory testing, and more. Visit our Services page for a complete list.',
      category: 'services'
    },
    {
      id: 'svc-2',
      question: 'Do you provide emergency care?',
      answer: 'While we are not an emergency room, we welcome walk-in patients for urgent care needs. Being seen depends on doctor availability. For life-threatening emergencies, please call 911 or go to your nearest emergency room immediately. We can provide follow-up care after emergency treatment.',
      category: 'services'
    },
    {
      id: 'svc-3',
      question: 'Do you see patients of all ages?',
      answer: 'Yes, we provide comprehensive family medicine for patients of all ages, from newborns to seniors. Our physicians are trained in pediatric care, adult medicine, and geriatric care to serve your entire family\'s healthcare needs.',
      category: 'services'
    },
    {
      id: 'svc-4',
      question: 'Can you provide referrals to specialists?',
      answer: 'Absolutely. When specialized care is needed, we provide referrals to trusted specialists in our network. We coordinate your care and ensure that specialist recommendations are integrated into your overall treatment plan.',
      category: 'services'
    },

    // Patient Information
    {
      id: 'pat-1',
      question: 'How do I access my medical records?',
      answer: 'You can request copies of your medical records by contacting our office. We maintain secure electronic health records and can provide records in digital or paper format. Some records may be available through our patient portal system.',
      category: 'patient-info'
    },
    {
      id: 'pat-2',
      question: 'What is your cancellation policy?',
      answer: 'We request at least 24 hours notice for appointment cancellations to allow other patients to schedule. Late cancellations or no-shows may result in a cancellation fee. We understand emergencies happen and handle each situation individually.',
      category: 'patient-info'
    },
    {
      id: 'pat-3',
      question: 'Are my medical records kept confidential?',
      answer: 'Yes, we maintain strict confidentiality and comply with all HIPAA and PIPEDA privacy regulations. Your medical information is secured with encryption and access is limited to authorized healthcare professionals involved in your care.',
      category: 'patient-info'
    },
    {
      id: 'pat-4',
      question: 'Can family members access my information?',
      answer: 'Medical information can only be shared with family members if you provide written consent or in specific emergency situations. We take patient privacy seriously and follow all applicable privacy laws and regulations.',
      category: 'patient-info'
    },

    // COVID & Safety
    {
      id: 'covid-1',
      question: 'What COVID-19 safety measures do you have in place?',
      answer: 'We follow all current health guidelines including enhanced cleaning protocols, proper ventilation, staff vaccination requirements, and symptom screening. Masks may be required during certain periods. Please check our current policies when scheduling.',
      category: 'covid'
    },
    {
      id: 'covid-2',
      question: 'Do you offer telehealth appointments?',
      answer: 'Yes, we offer telehealth consultations for appropriate medical concerns including follow-up visits, medication reviews, and non-emergency consultations. Please ask when scheduling if your appointment can be conducted virtually.',
      category: 'covid'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'appointments', name: 'Appointments & Scheduling' },
    { id: 'insurance', name: 'Insurance & Billing' },
    { id: 'services', name: 'Services & Treatments' },
    { id: 'patient-info', name: 'Patient Information' },
    { id: 'covid', name: 'COVID & Safety' }
  ]

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory)

  // Generate FAQ structured data
  const faqStructuredData = generateFAQStructuredData(
    faqData.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  )

  return (
    <Layout>
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Patient Support
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Find answers to common questions about our medical services, appointments, and patient care to help make your healthcare experience seamless.
              </p>

              {/* FAQ Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Quick</div>
                  <div className="text-slate-600 font-medium">Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Common</div>
                  <div className="text-slate-600 font-medium">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Clinic</div>
                  <div className="text-slate-600 font-medium">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact CTA */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Need Help?
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Our healthcare team is here to help! Contact us directly for personalized assistance with any questions about our services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </Link>
                  <a
                    href={`tel:${phoneLoading ? '2498060128' : primaryPhone.replace(/\s/g, '')}`}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call {phoneLoading ? '249 806 0128' : primaryPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Browse by Category</h2>
              <p className="text-lg text-slate-600">Filter questions by topic to find exactly what you need</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Items */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Additional Resources
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">Helpful Resources</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Access essential tools and information to support your healthcare journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Patient Intake</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Complete your intake form before your first visit to save time and ensure we have all necessary information.
                </p>
                <Link
                  href="https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Complete Patient Intake
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Schedule Appointment</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Book your next appointment online or call our office. We offer both routine appointments and welcome walk-in patients.
                </p>
                <a
                  href="https://zenithmedical.cortico.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white hover:text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Book Appointment
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Health Resources</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Access our health blog for medical information, wellness tips, and updates from our medical team.
                </p>
                <Link
                  href="/blog"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Visit Health Blog
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Notice */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-2xl p-8 shadow-lg relative overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-red-400 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-red-400 rounded-full"></div>
                <div className="absolute top-1/2 right-12 w-8 h-8 border-2 border-red-400 rounded-full"></div>
              </div>
              
              <div className="relative z-10">
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
                      For life-threatening emergencies, do not delay seeking care. Call 911 immediately 
                      or go to your nearest emergency room. Our clinic provides follow-up care and routine medical services.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="tel:911"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call 911
                      </a>
                      <Link
                        href="/contact"
                        className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all inline-flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Non-Emergency Contact
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 