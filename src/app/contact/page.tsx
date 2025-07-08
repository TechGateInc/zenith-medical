'use client'

import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    appointmentType: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, ] = useState('')
  const [, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSubmitted(true)
    } catch (error) {
      console.error('Contact form submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', hours: 'Emergency Only' }
  ]

  const contactMethods = [
    {
      title: 'Phone',
      primary: '(555) 123-CARE',
      secondary: 'Main office line',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      title: 'Email',
      primary: 'info@zenithmedical.com',
      secondary: 'General inquiries',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Emergency',
      primary: '911',
      secondary: 'Life-threatening emergencies',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      title: 'Fax',
      primary: '(555) 123-4568',
      secondary: 'Medical records & referrals',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 2M17 4l2 2M5 8h14l-1 8H6L5 8z" />
        </svg>
      )
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Get in touch with our medical team. We&apos;re here to help with your healthcare needs.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact Info */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{method.title}</h3>
                <p className="text-xl font-bold text-blue-600 mb-1">{method.primary}</p>
                <p className="text-sm text-slate-600">{method.secondary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <section>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Send Us a Message</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitMessage.includes('error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="appointmentType" className="block text-sm font-medium text-slate-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select appointment type</option>
                      <option value="routine">Routine Check-up</option>
                      <option value="urgent">Urgent Care</option>
                      <option value="chronic">Chronic Care Follow-up</option>
                      <option value="physical">Physical Exam</option>
                      <option value="consultation">Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide details about your inquiry or appointment request..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  For urgent medical needs, please call us directly at{' '}
                  <span className="font-semibold text-blue-600">(555) 123-CARE</span>
                </p>
              </div>
            </div>
          </section>

          {/* Location & Hours */}
          <section>
            <div className="space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Office Hours</h2>
                <div className="space-y-4">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
                      <span className="font-medium text-slate-700">{schedule.day}</span>
                      <span className="text-slate-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We offer same-day appointments for urgent care needs. 
                    Please call ahead to check availability.
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Location</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">Zenith Medical Centre</p>
                      <p className="text-slate-600">123 Healthcare Drive</p>
                      <p className="text-slate-600">Medical District, MD 21201</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-3">Parking & Accessibility</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Free parking available
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Wheelchair accessible
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Public transit nearby
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Ready to Schedule?</h3>
                <p className="mb-4 opacity-90">
                  Start your healthcare journey with a simple intake form or call us directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/intake"
                    className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    Patient Intake Form
                  </Link>
                  <a
                    href="tel:5551234567"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

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
                  For life-threatening emergencies, do not use this contact form. Call 911 immediately 
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