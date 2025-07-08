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
    }
  ]

  const specialtyServices = [
    {
      title: "Women's Health",
      description: "Comprehensive healthcare services specifically designed for women's health needs.",
      services: [
        "Annual gynecological exams",
        "Pap smears and cervical cancer screening",
        "Breast health and mammogram referrals",
        "Contraceptive counseling",
        "Menopause management",
        "Pregnancy care coordination"
      ]
    },
    {
      title: "Pediatric Care",
      description: "Specialized healthcare services for infants, children, and adolescents.",
      services: [
        "Well-child visits and developmental assessments",
        "Childhood immunizations",
        "Growth and development monitoring",
        "School and sports physicals",
        "Acute illness treatment",
        "Behavioral and learning assessments"
      ]
    },
    {
      title: "Geriatric Care",
      description: "Specialized healthcare focused on the unique needs of older adults.",
      services: [
        "Comprehensive geriatric assessments",
        "Medication management and review",
        "Fall prevention and mobility assessment",
        "Cognitive health screening",
        "End-of-life care planning",
        "Coordination with specialists"
      ]
    },
    {
      title: "Mental Health Support",
      description: "Integrated mental health services as part of comprehensive primary care.",
      services: [
        "Depression and anxiety screening",
        "Stress management counseling",
        "Substance abuse screening",
        "Mental health referrals",
        "Crisis intervention support",
        "Medication management for mental health"
      ]
    }
  ]

  const additionalServices = [
    "Minor procedures and wound care",
    "Laboratory testing and diagnostics",
    "ECG and cardiac monitoring",
    "Travel medicine and vaccinations",
    "Occupational health services",
    "Immigration medical exams",
    "DOT physical examinations",
    "Allergy testing and treatment"
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Medical Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Comprehensive healthcare services designed to keep you and your family healthy throughout every stage of life.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Primary Services */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Primary Care Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our core medical services provide the foundation for your ongoing health and wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {primaryServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{service.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-600">
                      <svg className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Specialty Services */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Specialty Care Areas</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Specialized healthcare services tailored to specific patient populations and health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialtyServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.services.map((item, idx) => (
                    <li key={idx} className="flex items-center text-slate-600">
                      <svg className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Services */}
        <section className="bg-slate-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow border border-slate-200">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">{service}</span>
                </div>
              </div>
            ))}
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
                  <h4 className="font-semibold text-red-700 mb-2">Same-Day Appointments</h4>
                  <p className="text-red-700 mb-4">
                    We reserve time slots daily for urgent medical needs that can&apos;t wait for a regular appointment.
                  </p>
                  <ul className="space-y-1 text-red-700">
                    <li>• Acute illness and infections</li>
                    <li>• Minor injuries and cuts</li>
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
                  Book Same-Day Appointment
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Insurance & Payment */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Insurance & Payment Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Accepted Insurance Plans</h3>
              <p className="text-slate-600 mb-4">
                We accept most major insurance plans and work with you to maximize your benefits:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Provincial health insurance (OHIP, MSP, etc.)
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Extended health insurance plans
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Workers&apos; compensation claims
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Third-party insurance claims
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Payment Options</h3>
              <p className="text-slate-600 mb-4">
                For services not covered by insurance, we offer flexible payment options:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cash and debit payments
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Major credit cards accepted
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payment plans available
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Direct billing when possible
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Our Comprehensive Care?</h2>
          <p className="text-xl mb-6 opacity-90">
            Schedule an appointment today and discover the difference personalized healthcare makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg"
            >
              Schedule Appointment
            </Link>
            <Link
              href="/intake"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              Complete Intake Form
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
} 