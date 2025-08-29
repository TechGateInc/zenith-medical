import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, generateDoctorStructuredData, PAGE_METADATA } from '../../lib/utils/seo'
import { getAppointmentBookingUrl, getPatientIntakeUrl, getAboutMissionImageUrl } from '../../lib/utils/server-settings'
import { prisma } from '../../lib/prisma'
import Image from 'next/image'
import { TeamMemberCard } from '../../components/Team'

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.about,
  canonical: '/about',
})

// Fetch published team members from database
async function getTeamMembers() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        published: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    })
    
    return teamMembers.map(member => ({
      ...member,
      bio: member.bio || undefined,
      photoUrl: member.photoUrl || undefined,
      email: member.email || undefined,
      phone: member.phone || undefined,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return []
  }
}

export default async function About() {
  // Fetch team members from database
  const teamMembers = await getTeamMembers()
  const appointmentBookingUrl = await getAppointmentBookingUrl()
  const patientIntakeUrl = await getPatientIntakeUrl()
  const aboutMissionImageUrl = await getAboutMissionImageUrl()

  // Generate structured data for team members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doctorStructuredData = teamMembers.map((member: any) => 
    generateDoctorStructuredData({
      name: member.name,
      title: member.title || member.role,
      experience: member.bio || `Experienced healthcare professional`
    })
  )

  return (
    <Layout>
      {/* Structured Data for Team Members */}
      {doctorStructuredData.map((data, index) => (
        <script
          key={`doctor-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ABOUT ZENITH MEDICAL CENTRE
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight max-w-4xl mx-auto">
              Efficient Healthcare Innovation
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Our cutting-edge medical centre combines cutting-edge technology, experienced medical professionals, and patient-centered care to deliver exceptional healthcare to our growing community.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">Efficient</div>
                <div className="text-slate-600 font-medium">Cutting-Edge Facility</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">Advanced</div>
                <div className="text-slate-600 font-medium">Medical Technology</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">Expert</div>
                <div className="text-slate-600 font-medium">Healthcare Professionals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Mission & Vision */}
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
                  At Zenith Medical Centre, our mission is to provide comprehensive, patient-centered healthcare that promotes wellness, 
                  prevents illness, and treats medical conditions with the highest standards of clinical excellence and compassionate care.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We are committed to building lasting relationships with our patients, understanding their unique healthcare needs, 
                  and empowering them to make informed decisions about their health and well-being.
                </p>
              </div>
            </div>
            
            <div className="relative">
              {aboutMissionImageUrl ? (
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={aboutMissionImageUrl}
                    alt="Our Mission and Core Values"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 lg:p-10 rounded-2xl shadow-lg">
                  <h3 className="text-2xl lg:text-3xl font-bold text-green-800 mb-8">Our Core Values</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Compassion</h4>
                        <p className="text-slate-600">Caring for every patient with empathy and respect</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Excellence</h4>
                        <p className="text-slate-600">Maintaining the highest standards of medical care</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Integrity</h4>
                        <p className="text-slate-600">Honest, transparent, and ethical healthcare practices</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Innovation</h4>
                        <p className="text-slate-600">Embracing efficient medical technology and practices</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-emerald-300 rounded-full opacity-40"></div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              OUR APPROACH
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-8 leading-tight">
              Redefining Healthcare Excellence
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl p-8 lg:p-12 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8 text-lg text-slate-600 leading-relaxed">
                <p>
                  At Zenith Medical Centre, we&apos;ve created a healthcare experience that puts innovation and patient care at the forefront. 
                  Our team of experienced medical professionals combines years of clinical expertise with the latest in medical technology 
                  and evidence-based treatment approaches.
                </p>
                <p>
                  Led by Dr. Gabriel Oyelayo and our dedicated medical team, we provide comprehensive healthcare in our purpose-built facility. 
                  Our cutting-edge medical centre features the latest diagnostic equipment, efficient treatment rooms, and comfortable 
                  spaces designed to enhance patient wellness and comfort.
                </p>
                <p>
                  Today, we proudly serve patients across all age groups, from newborns to seniors, providing a full spectrum of family 
                  medicine services with a focus on preventive care, chronic disease management, and personalized treatment plans.
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">Efficient</div>
                  <div className="text-slate-600 font-medium">Healthcare Facility</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">Advanced</div>
                  <div className="text-slate-600 font-medium">Medical Technology</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">Expert</div>
                  <div className="text-slate-600 font-medium">Healthcare Professionals</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Doctors */}
        {teamMembers.filter((m: { isDoctor: boolean }) => m.isDoctor).length > 0 && (
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
                Learn more about our physicians and their areas of expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers
                .filter((member: { isDoctor: boolean }) => member.isDoctor)
                .map((member) => (
                  <Link
                    key={member.id}
                    href={`/doctors/${member.name.toLowerCase().replace(/\s+/g, '-')}`}
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



        {/* Facilities & Technology */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-slate-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              FACILITIES
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Efficient Facilities & Technology
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Cutting-edge equipment and comfortable spaces designed for optimal patient care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-3">On-Site Laboratory</h3>
              <p className="text-slate-600 leading-relaxed">On-site lab facilities for quick diagnostic testing and results.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-3">Digital Records</h3>
              <p className="text-slate-600 leading-relaxed">Secure electronic health records for comprehensive patient care.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="h-10 w-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-3">Comfortable Environment</h3>
              <p className="text-slate-600 leading-relaxed">Welcoming, clean, and comfortable spaces designed for patient wellness.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-50 rounded-xl p-8 mb-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
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
                Join our growing community of patients who trust Zenith Medical Centre for their healthcare needs. 
                Experience personalized care in our efficient, cutting-edge facility.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={appointmentBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Request Appointment
                </a>
                <a
                  href={patientIntakeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Complete Patient Intake
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 