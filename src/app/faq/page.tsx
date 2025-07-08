'use client'

import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { generateFAQStructuredData } from '../../lib/utils/seo'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('all')

  const faqData: FAQItem[] = [
    // Appointments & Scheduling
    {
      id: 'apt-1',
      question: 'How do I schedule an appointment?',
      answer: 'You can schedule an appointment by calling our office at (555) 123-CARE, using our online contact form, or completing the patient intake form. We offer both routine appointments and same-day appointments for urgent care needs.',
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
      answer: 'For routine check-ups, we recommend booking 2-4 weeks in advance. For urgent care needs, we reserve same-day appointments. Annual physicals and specialized consultations may require longer lead times during busy periods.',
      category: 'appointments'
    },
    {
      id: 'apt-4',
      question: 'Do you offer same-day appointments?',
      answer: 'Yes, we reserve time slots daily for urgent medical needs that cannot wait for a regular appointment. Call us early in the day for the best availability. Same-day appointments are available for acute illnesses, minor injuries, and urgent health concerns.',
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
      answer: 'While we are not an emergency room, we offer same-day appointments for urgent care needs. For life-threatening emergencies, please call 911 or go to your nearest emergency room immediately. We can provide follow-up care after emergency treatment.',
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
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-slate-600 font-medium">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact CTA */}
        <section className="mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-lg text-slate-700 mb-4">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="tel:5551234567"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Call (555) 123-CARE
              </a>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Items */}
        <section className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <h3 className="text-lg font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg
                      className={`h-5 w-5 text-slate-500 transform transition-transform duration-200 ${
                        expandedItems.includes(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Patient Intake</h3>
              <p className="text-slate-600 mb-4">
                Complete your intake form before your first visit to save time and ensure we have all necessary information.
              </p>
              <Link
                href="/intake"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Start Intake Form
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Schedule Appointment</h3>
              <p className="text-slate-600 mb-4">
                Book your next appointment online or call our office. We offer both routine and same-day appointments.
              </p>
              <Link
                href="/contact"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Book Appointment
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Health Resources</h3>
              <p className="text-slate-600 mb-4">
                Access our health blog for medical information, wellness tips, and updates from our medical team.
              </p>
              <Link
                href="/blog"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Visit Health Blog
              </Link>
            </div>
          </div>
        </section>

        {/* Emergency Notice */}
        <section className="mt-16">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Medical Emergency</h3>
                <p className="text-red-700">
                  For life-threatening emergencies, do not delay seeking care. Call 911 immediately 
                  or go to your nearest emergency room.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 