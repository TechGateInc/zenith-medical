import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getLocationBySlug,
  getServicesForLocation,
  getUninsuredServicesForLocation,
} from '@/lib/utils/location-content'

interface LocationServicesPageProps {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: LocationServicesPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    return { title: 'Location Not Found' }
  }

  return {
    title: `Medical Services | ${location.name}`,
    description: `Comprehensive healthcare services at ${location.name}. Family medicine, preventive care, chronic disease management, and more.`,
  }
}

export default async function LocationServicesPage({ params }: LocationServicesPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    notFound()
  }

  const [services, uninsuredServices] = await Promise.all([
    getServicesForLocation(locationSlug),
    getUninsuredServicesForLocation(locationSlug),
  ])

  // Group uninsured services by category
  const uninsuredByCategory = uninsuredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, typeof uninsuredServices>)

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
                Our Medical Services
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Comprehensive healthcare services at {location.name}, designed to keep you and your family healthy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Primary Services */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Primary Care
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                Primary Care Services
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Our core medical services provide the foundation for your ongoing health and wellness journey.
              </p>
            </div>

            {services.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                No services available at this time.
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-12">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border-b border-slate-200 pb-12 last:border-0"
                  >
                    <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed text-lg">
                      {service.description}
                    </p>
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 ml-1">
                        {service.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-slate-600"
                          >
                            <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Uninsured Services */}
        {Object.keys(uninsuredByCategory).length > 0 && (
          <section className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
                    Fee Schedule
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                  Patient&apos;s Guide to Uninsured Services
                </h2>
                <div className="max-w-3xl mx-auto text-left">
                  <p className="text-lg text-slate-600 leading-relaxed mb-4">
                    Some services are not covered by OHIP. We use the Ontario Medical Association&apos;s (OMA) suggested fees as a guideline.
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {Object.entries(uninsuredByCategory).map(([category, items]) => (
                  <div
                    key={category}
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="text-xl font-bold text-slate-800">
                        {category}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`px-6 py-4 flex justify-between items-start gap-4 ${
                            item.isInsured ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-sm text-slate-500 mt-1">
                                {item.description}
                              </div>
                            )}
                            {item.isInsured && (
                              <div className="inline-flex items-center mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Insured service
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-blue-600 whitespace-nowrap">
                            {item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-slate-50 rounded-xl p-8 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Healthcare Access
              </span>
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight text-center">
                Ready to Experience Our Care?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed text-center">
                Schedule an appointment today at {location.name}.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {location.bookingUrl && (
                  <a
                    href={location.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                    style={{ backgroundColor: location.primaryColor }}
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Request Appointment
                  </a>
                )}
                <Link
                  href={`/${location.slug}/contact`}
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
