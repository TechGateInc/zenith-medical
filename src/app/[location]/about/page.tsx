import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  getLocationBySlug,
  getTeamMembersForLocation,
} from '@/lib/utils/location-content'
import { TeamMemberCard } from '@/components/Team'

interface LocationAboutPageProps {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: LocationAboutPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    return { title: 'Location Not Found' }
  }

  return {
    title: `About Us | ${location.name}`,
    description: `Learn about ${location.name}. Meet our experienced medical team and discover our commitment to patient-centered healthcare.`,
  }
}

export default async function LocationAboutPage({ params }: LocationAboutPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    notFound()
  }

  const teamMembers = await getTeamMembersForLocation(locationSlug)
  const doctors = teamMembers.filter((m) => m.isDoctor)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ABOUT {location.name.toUpperCase()}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight max-w-4xl mx-auto">
              Efficient Healthcare Innovation
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Our cutting-edge medical centre combines advanced technology, experienced medical professionals, and patient-centered care.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: location.primaryColor }}>Efficient</div>
                <div className="text-slate-600 font-medium">Healthcare Facility</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: location.primaryColor }}>Advanced</div>
                <div className="text-slate-600 font-medium">Medical Technology</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: location.primaryColor }}>Expert</div>
                <div className="text-slate-600 font-medium">Healthcare Professionals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Mission */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              OUR MISSION
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-8 leading-tight">
                Patient-Centered Healthcare Excellence
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed">
                  At {location.name}, our mission is to provide comprehensive, patient-centered healthcare that promotes wellness,
                  prevents illness, and treats medical conditions with the highest standards of clinical excellence and compassionate care.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We are committed to building lasting relationships with our patients, understanding their unique healthcare needs,
                  and empowering them to make informed decisions about their health and well-being.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 lg:p-10 rounded-2xl shadow-lg">
              <h3 className="text-2xl lg:text-3xl font-bold text-green-800 mb-8">Our Core Values</h3>
              <div className="space-y-6">
                {['Compassion', 'Excellence', 'Integrity', 'Innovation'].map((value) => (
                  <div key={value} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">{value}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Doctors */}
        {doctors.length > 0 && (
          <section className="mb-20 lg:mb-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                OUR DOCTORS
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                Meet Our Doctors
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Learn more about our physicians at {location.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((member) => (
                <Link
                  key={member.id}
                  href={`/${location.slug}/doctors/${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block"
                >
                  <TeamMemberCard
                    member={member}
                    variant="default"
                    showEmail={false}
                    showPhone={false}
                    showBio={true}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-slate-50 rounded-xl p-8 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Join Our Patients
              </span>
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight text-center">
                Ready to Experience Exceptional Care?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed text-center">
                Join our growing community of patients who trust {location.name} for their healthcare needs.
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
                {location.patientIntakeUrl && (
                  <a
                    href={location.patientIntakeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Registration Form
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
