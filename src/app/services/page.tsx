import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, PAGE_METADATA } from '../../lib/utils/seo'

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.services,
  canonical: '/services',
})

export default function Services() {
  const primaryServices = [
    {
      title: "Family Medicine",
      description: "Comprehensive primary healthcare for patients of all ages, from newborns to seniors.",
      features: [
        "Annual physical exams and wellness checks",
        "Acute illness diagnosis and treatment",
        "Chronic disease management",
        "Immunizations and vaccinations",
        "Health screenings and preventive care",
        "Health education and lifestyle counseling"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: "Preventive Care",
      description: "Proactive healthcare services to prevent illness and maintain optimal health.",
      features: [
        "Regular health screenings and checkups",
        "Cancer screening (mammograms, colonoscopies, Pap tests)",
        "Cardiovascular risk assessment",
        "Diabetes screening and monitoring",
        "Osteoporosis screening",
        "Mental health assessments"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Chronic Disease Management",
      description: "Ongoing care and support for patients with chronic health conditions.",
      features: [
        "Diabetes management and monitoring",
        "Hypertension treatment and control",
        "Heart disease management",
        "Arthritis and joint pain treatment",
        "COPD and asthma management",
        "Mental health support and treatment"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Mental Health Care",
      description: "Comprehensive mental health support and counseling services for emotional wellness.",
      features: [
        "Depression and anxiety screening",
        "Stress management counseling",
        "Substance abuse screening",
        "Mental health referrals",
        "Crisis intervention support",
        "Medication management for mental health"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "General Health Checks",
      description: "Comprehensive health assessments and routine medical examinations.",
      features: [
        "Annual physical examinations",
        "Comprehensive health assessments",
        "Routine medical screenings",
        "Health risk evaluations",
        "Wellness consultations",
        "Preventive health planning"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Acute Illness Care",
      description: "Immediate treatment for sudden illnesses, infections, and urgent health concerns.",
      features: [
        "Sudden illness diagnosis and treatment",
        "Infection management",
        "Urgent health concern care",
        "Symptom relief and management",
        "Follow-up care coordination",
        "Emergency care referrals when needed"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: "Immunization",
      description: "Vaccinations for all ages including routine immunizations and travel vaccines.",
      features: [
        "Routine childhood immunizations",
        "Adult vaccination schedules",
        "Travel vaccines and consultations",
        "Flu shots and seasonal vaccines",
        "COVID-19 vaccinations",
        "Vaccination record management"
      ],
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]



  const additionalServices = [
    "Minor procedures and wound care",
    "Laboratory testing and diagnostics",
    "ECG and cardiac monitoring",
    "Travel medicine and vaccinations",
    "Occupational health services"
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
                  Comprehensive Healthcare Services
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Our Medical Services
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Comprehensive healthcare services in our efficient medical facility, designed to keep you and your family healthy throughout every stage of life.
              </p>

              {/* Stats or Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">7</div>
                  <div className="text-slate-600 font-medium">Primary Care Areas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">5</div>
                  <div className="text-slate-600 font-medium">Additional Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Walk-In</div>
                  <div className="text-slate-600 font-medium">Patients Welcome</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Primary Services */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
          <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Primary Care
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">Primary Care Services</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Our core medical services provide the foundation for your ongoing health and wellness journey with comprehensive care for every age.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {primaryServices.map((service, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{service.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
          </div>
        </section>



        {/* Additional Services */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Additional Services
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">Extended Medical Services</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Comprehensive additional medical services to meet all your healthcare needs
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-slate-700 font-medium leading-relaxed">{service}</span>
                </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        </section>

        {/* Emergency & Urgent Care */}
        <section className="bg-red-50 border-l-4 border-red-500 p-8 rounded-r-lg mb-16">
          <div className="flex items-start">
            <svg className="h-8 w-8 text-red-500 mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-red-800 mb-4">Emergency & Urgent Care</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Walk-In Patients Welcome</h4>
                  <p className="text-red-700 mb-4">
                    Walk-in patients are always welcome. Being seen depends on doctor availability for urgent medical needs.
                  </p>
                  <ul className="space-y-1 text-red-700">
                    <li>• Acute illness and infections</li>
                    <li>• Severe cold and flu symptoms</li>
                    <li>• Allergic reactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">When to Call 911</h4>
                  <p className="text-red-700 mb-4">
                    For life-threatening emergencies, always call 911 immediately:
                  </p>
                  <ul className="space-y-1 text-red-700">
                    <li>• Chest pain or heart attack symptoms</li>
                    <li>• Difficulty breathing</li>
                    <li>• Severe bleeding or trauma</li>
                    <li>• Loss of consciousness</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Walk-In Welcome
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance & Payment */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Insurance & Payment
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">Payment & Insurance Options</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                We accept most major insurance plans and offer flexible payment options for your convenience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content - Payment Options */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Insurance Plans</h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    We accept OHIP and work with most major insurance providers to ensure you get the coverage you deserve.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">OHIP accepted for covered services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">Most major health insurance plans</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">Out-of-pocket payment for non-OHIP services</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Payment Options</h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Secure payment options to make healthcare accessible and convenient.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">Debit and credit cards</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">Interac e-transfer</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-slate-700">Bank transfers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-6 left-6 w-12 h-12 bg-green-600 rounded-full"></div>
                    <div className="absolute top-16 right-12 w-8 h-8 bg-green-500 rounded-full"></div>
                    <div className="absolute bottom-12 left-12 w-6 h-6 bg-green-700 rounded-full"></div>
                    <div className="absolute bottom-6 right-6 w-16 h-16 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Affordable Healthcare</h3>
                    <p className="text-green-700">Accessible to everyone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
                  Ready to Experience Our Comprehensive Care?
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Schedule an appointment today and discover how our efficient medical facility and experienced team can serve your healthcare needs.
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
              </div>

              {/* Right Content - Visual Element */}
              <div className="hidden lg:block">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">Your Health Journey</h3>
                      <p className="text-blue-700">Starts with comprehensive care</p>
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