import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  getLocationBySlug,
  getServicesForLocation,
  getTeamMembersForLocation,
} from '@/lib/utils/location-content'
import GoogleMapsClient from '@/components/UI/GoogleMapsClient'

interface LocationPageProps {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: LocationPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    return { title: 'Location Not Found' }
  }

  return {
    title: `${location.name} | Zenith Medical Centre`,
    description: `Visit ${location.name} at ${location.address}, ${location.city}. ${location.acceptingNewPatients ? 'Now accepting new patients.' : ''}`,
  }
}

export default async function LocationHomePage({ params }: LocationPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    notFound()
  }

  const [services, doctors] = await Promise.all([
    getServicesForLocation(locationSlug),
    getTeamMembersForLocation(locationSlug),
  ])

  const doctorsList = doctors.filter((d) => d.isDoctor)
  const fullAddress = `${location.address}, ${location.city}, ${location.province} ${location.postalCode}`

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  {location.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-slate-800 leading-tight">
                  Expert Care, Patient Centered
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                  Experience healthcare reimagined at {location.name}. We combine
                  efficient medical technology with compassionate patient care to
                  deliver exceptional healthcare for you and your family.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                  {location.bookingUrl && (
                    <a
                      href={location.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 text-white font-semibold rounded-lg transition-colors shadow-lg text-base sm:text-lg whitespace-nowrap min-h-[48px]"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Request Appointment
                    </a>
                  )}
                  {location.patientIntakeUrl && (
                    <a
                      href={location.patientIntakeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-base sm:text-lg whitespace-nowrap min-h-[48px]"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Registration Form
                    </a>
                  )}
                </div>

                {location.acceptingNewPatients && (
                  <div className="inline-flex items-center justify-center lg:justify-start px-3 sm:px-4 py-2.5 sm:py-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-slate-700 text-sm sm:text-base">
                      <span className="text-xs sm:text-sm">Now Open:</span>
                      <span className="font-semibold ml-1">Accepting New Patients</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative order-1 lg:order-2">
                <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                  {location.heroImageUrl ? (
                    <Image
                      src={location.heroImageUrl}
                      alt={`${location.name} - Medical facility`}
                      width={800}
                      height={384}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${location.primaryColor}30, ${location.secondaryColor}50)`,
                      }}
                    >
                      <div className="text-center">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: location.primaryColor }}
                        >
                          <svg
                            className="h-12 w-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{location.name}</h2>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Zenith Medical Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 border border-purple-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                Why Choose Zenith Medical
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Experience healthcare that puts you first, with modern facilities and compassionate care
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Comprehensive Care */}
              <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-slate-100">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${location.primaryColor}15` }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: location.primaryColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Comprehensive Care</h3>
                <p className="text-sm text-slate-600">
                  Full-service primary care under one roof. No need to travel between clinics.
                </p>
              </div>

              {/* Experienced Team */}
              <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-slate-100">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${location.primaryColor}15` }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: location.primaryColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Experienced Team</h3>
                <p className="text-sm text-slate-600">
                  Skilled physicians focused on safety, outcomes, and clear communication.
                </p>
              </div>

              {/* Patient-Centered */}
              <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-slate-100">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${location.primaryColor}15` }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: location.primaryColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Patient-Centered</h3>
                <p className="text-sm text-slate-600">
                  We listen to your needs and create personalized care plans for your lifestyle.
                </p>
              </div>

              {/* Modern Facilities */}
              <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-slate-100">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${location.primaryColor}15` }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: location.primaryColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Modern Facilities</h3>
                <p className="text-sm text-slate-600">
                  State-of-the-art equipment and efficient technology for accurate diagnostics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Medical Services Section */}
        {services.length > 0 && (
          <section className="mb-12 sm:mb-14 md:mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 border border-green-200 rounded-full mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wider">
                    Our Services
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                  Medical Services at {location.name}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                  Comprehensive healthcare services for you and your family
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                {services.slice(0, 6).map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 flex flex-col h-full group"
                  >
                    {service.imageUrl ? (
                      <div className="relative h-48 sm:h-56 md:h-64 bg-slate-100 overflow-hidden">
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-white shadow-sm">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-48 sm:h-56 md:h-64 flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${location.primaryColor}10, ${location.primaryColor}30)`,
                        }}
                      >
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-sm z-10"
                          style={{ backgroundColor: `${location.primaryColor}20` }}
                        >
                          <svg
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            style={{ color: location.primaryColor }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 z-10">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col">
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6 flex-1">
                        {service.description}
                      </p>

                      {service.features && service.features.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 sm:mb-3">
                            Key Features
                          </h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start text-xs sm:text-sm text-slate-600"
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                        <Link
                          href={`/${location.slug}/services`}
                          className="inline-flex items-center font-semibold transition-colors group-hover:translate-x-1 duration-300 text-sm sm:text-base"
                          style={{ color: location.primaryColor }}
                        >
                          Learn More
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 sm:mt-10 md:mt-12">
                <Link
                  href={`/${location.slug}/services`}
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 text-white font-semibold rounded-lg transition-colors shadow-lg text-sm sm:text-base min-h-[44px]"
                  style={{ backgroundColor: location.primaryColor }}
                >
                  View All Services
                  <svg
                    className="ml-2 h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Meet Our Doctors */}
        {doctorsList.length > 0 && (
          <section className="mb-12 sm:mb-14 md:mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-50 border border-teal-200 rounded-full mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm font-semibold text-teal-700 uppercase tracking-wider">
                    Our Medical Team
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                  Meet Our Doctors
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                  Our experienced physicians at {location.name} are dedicated to providing
                  exceptional care
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {doctorsList.slice(0, 6).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1"
                  >
                    <div className="relative h-48 sm:h-56 md:h-64 bg-slate-100">
                      {doctor.photoUrl ? (
                        <Image
                          src={doctor.photoUrl}
                          alt={doctor.name}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-slate-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                        {doctor.name}
                      </h3>
                      <p
                        className="font-medium mb-2 sm:mb-3 text-sm sm:text-base"
                        style={{ color: location.primaryColor }}
                      >
                        {doctor.title}
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {doctor.bio || 'Dedicated healthcare professional committed to your well-being.'}
                      </p>

                      {location.bookingUrl && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                          <a
                            href={location.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 sm:py-3 text-white font-semibold rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm sm:text-base min-h-[44px]"
                            style={{ backgroundColor: location.primaryColor }}
                          >
                            <svg
                              className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            Book Appointment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Location & Contact Section */}
        <section className="bg-slate-50 rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Visit Us
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Find {location.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-1 flex-shrink-0"
                      style={{ color: location.primaryColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">{location.address}</p>
                      <p className="text-slate-600">
                        {location.city}, {location.province} {location.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: location.primaryColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${location.primaryPhone.replace(/\s/g, '')}`}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {location.primaryPhone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: location.primaryColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${location.email}`}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {location.email}
                    </a>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-1 flex-shrink-0"
                      style={{ color: location.primaryColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">Business Hours</p>
                      <p className="text-slate-600 whitespace-pre-line">{location.businessHours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <GoogleMapsClient
                  address={fullAddress}
                  className="w-full h-64 sm:h-72 md:h-80"
                  height="320px"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
