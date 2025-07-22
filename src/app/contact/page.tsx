'use client'

import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    healthInformationNumber: '',
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
    { day: 'Monday - Saturday', hours: '9:00 AM - 5:00 PM' }
  ]

  const contactMethods = [
    {
      title: 'Phone',
      primary: '249 806 0128',
      secondary: 'Main office line',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      title: 'Fax',
      primary: '613 680 5833',
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
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Get in Touch
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Contact Zenith Medical Centre
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                Ready to take the next step in your healthcare journey? Our team is here to help with appointments, questions, and comprehensive medical care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact Info */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Contact Information
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">How to Reach Us</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                You can reach us by phone or fax. For the fastest response, we encourage you to use the contact form below!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{method.title}</h3>
                  <p className="text-xl font-bold text-blue-600 mb-2">{method.primary}</p>
                  <p className="text-sm text-slate-600">{method.secondary}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-base text-slate-700 font-medium">For the fastest response, please use the contact form below. Our team will get back to you as soon as possible!</p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <section>
              {/* Section Badge */}
              <div className="text-center lg:text-left mb-8">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                    Send Message
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">Get in Touch</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Send us a message and we&apos;ll get back to you as soon as possible
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
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
                        placeholder="249 806 0128"
                      />
                    </div>
                    <div>
                      <label htmlFor="healthInformationNumber" className="block text-sm font-medium text-slate-700 mb-2">
                        Health Information Number
                      </label>
                      <input
                        type="text"
                        id="healthInformationNumber"
                        name="healthInformationNumber"
                        value={formData.healthInformationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your health information number (optional)"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <span className="font-semibold text-blue-600">249 806 0128</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Location & Hours */}
            <section>
              {/* Section Badge */}
              <div className="text-center lg:text-left mb-8">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                    Visit Us
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">Location & Hours</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Find us easily and plan your visit with our convenient hours
                </p>
              </div>
              
              <div className="space-y-8">
                {/* Office Hours */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Office Hours</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
                      <span className="font-semibold text-slate-700">Monday - Saturday</span>
                      <span className="text-slate-600 font-medium">9:00 AM - 5:00 PM</span>
                      </div>
                  </div>
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-green-800 mb-1">Walk-In Patients Welcome</p>
                        <p className="text-sm text-green-700">
                          Walk-in patients are always welcome. Being seen depends on doctor availability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Our Location</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <svg className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-slate-800 text-lg">Zenith Medical Centre</p>
                        <p className="text-slate-600">Unit 216, 1980 Ogilvie Road</p>
                        <p className="text-slate-600">Gloucester, Ottawa, K1J 9L3</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                        <svg className="h-5 w-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Parking & Accessibility
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-slate-600">Free parking available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-slate-600">Wheelchair accessible</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-slate-600">Public transit nearby</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-blue-500 rounded-full"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-blue-800">Ready to Schedule?</h3>
                    </div>
                    <p className="text-blue-700 mb-6 text-lg leading-relaxed">
                      Start your healthcare journey with a simple intake form or call us directly for immediate assistance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/intake"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold rounded-lg transition-colors shadow-lg"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Patient Intake Form
                      </Link>
                      <a
                        href="tel:2498060128"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 hover:bg-slate-50 font-semibold rounded-lg transition-colors border-2 border-blue-200"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Emergency Notice */}
        <section className="mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-red-400 rounded-full"></div>
              </div>
              
              <div className="relative z-10 flex items-start">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-800 mb-3">Medical Emergency</h3>
                  <p className="text-red-700 text-lg leading-relaxed">
                    For life-threatening emergencies, do not use this contact form. Call <strong>911</strong> immediately 
                    or go to your nearest emergency room for immediate medical attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 