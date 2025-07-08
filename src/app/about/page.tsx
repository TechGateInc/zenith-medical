import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, generateDoctorStructuredData, PAGE_METADATA } from '../../lib/utils/seo'
import { prisma } from '../../lib/prisma'
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

  // Fallback hardcoded team members in case database is empty or fails
  const fallbackTeamMembers = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Chief Medical Officer & Family Physician",
      credentials: "MD, CCFP",
      experience: "15+ years",
      specialties: ["Family Medicine", "Preventive Care", "Women's Health"],
      bio: "Board-certified family physician dedicated to comprehensive patient care with expertise in preventive medicine and chronic disease management.",
      image: "/team/dr-mitchell.jpg" // Placeholder for actual image
    },
    {
      name: "Dr. Michael Chen",
      role: "Family Physician",
      credentials: "MD, CCFP",
      experience: "12+ years",
      specialties: ["Family Medicine", "Chronic Care", "Geriatrics"],
      bio: "Experienced family doctor with special interest in chronic disease management and geriatric medicine, committed to patient-centered care.",
      image: "/team/dr-chen.jpg" // Placeholder for actual image
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Family Physician",
      credentials: "MD, CCFP",
      experience: "8+ years",
      specialties: ["Family Medicine", "Pediatrics", "Mental Health"],
      bio: "Compassionate physician specializing in family medicine with additional training in pediatric care and mental health support.",
      image: "/team/dr-rodriguez.jpg" // Placeholder for actual image
    },
    {
      name: "Jennifer Thompson",
      role: "Nurse Practitioner",
      credentials: "NP, RN, BScN",
      experience: "10+ years",
      specialties: ["Primary Care", "Health Promotion", "Patient Education"],
      bio: "Experienced nurse practitioner focused on primary care, health promotion, and patient education with a holistic approach to wellness.",
      image: "/team/np-thompson.jpg" // Placeholder for actual image
    }
  ]

  // Use database team members if available, otherwise fallback to hardcoded data
  const displayTeamMembers = teamMembers.length > 0 ? teamMembers : fallbackTeamMembers

  // Generate structured data for team members
  const doctorStructuredData = displayTeamMembers.map((member: any) => 
    generateDoctorStructuredData({
      name: member.name,
      title: member.title || member.role,
      specialties: member.specialties || [],
      experience: member.bio || `Experienced healthcare professional`
    })
  )

  return (
    <Layout>
      {/* Structured Data for Team Members */}
      {doctorStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Zenith Medical Centre</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Providing exceptional healthcare services to our community with compassion, expertise, and modern medical care.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                At Zenith Medical Centre, our mission is to provide comprehensive, patient-centered healthcare that promotes wellness, 
                prevents illness, and treats medical conditions with the highest standards of clinical excellence and compassionate care.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                We are committed to building lasting relationships with our patients, understanding their unique healthcare needs, 
                and empowering them to make informed decisions about their health and well-being.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-blue-800 mb-4">Our Values</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Compassion:</strong> Caring for every patient with empathy and respect</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Excellence:</strong> Maintaining the highest standards of medical care</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Integrity:</strong> Honest, transparent, and ethical healthcare practices</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Innovation:</strong> Embracing modern medical technology and practices</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Founded in 2010, Zenith Medical Centre began with a simple vision: to create a healthcare practice that truly puts patients first. 
              Dr. Sarah Mitchell established the clinic with the goal of providing comprehensive family medicine in a warm, welcoming environment 
              where patients feel heard, respected, and cared for.
            </p>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Over the years, we&apos;ve grown from a single-physician practice to a comprehensive medical team, but our core values remain unchanged. 
              We continue to prioritize building meaningful relationships with our patients, staying current with medical advances, 
              and maintaining the personalized care that sets us apart.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Today, Zenith Medical Centre serves thousands of patients across all age groups, from newborns to seniors, 
              providing a full spectrum of family medicine services in our modern, state-of-the-art facility.
            </p>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Meet Our Medical Team</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our experienced healthcare professionals are dedicated to providing exceptional care for you and your family.
            </p>
          </div>

          {teamMembers.length > 0 ? (
            // Display database team members using TeamMemberCard component
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  variant="default"
                  showEmail={false}
                  showPhone={false}
                  showSpecialties={true}
                  showBio={true}
                />
              ))}
            </div>
          ) : (
            // Fallback to original hardcoded display
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fallbackTeamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Placeholder for team member photo */}
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
                      <p className="text-blue-600 font-semibold">{member.role}</p>
                      <p className="text-slate-500">{member.credentials}</p>
                      <p className="text-slate-500 text-sm">{member.experience} experience</p>
                    </div>

                    <p className="text-slate-600 mb-4 leading-relaxed">{member.bio}</p>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-slate-800 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Facilities & Technology */}
        <section className="bg-slate-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Our Facilities & Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Modern Laboratory</h3>
              <p className="text-slate-600">On-site lab facilities for quick diagnostic testing and results.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Digital Records</h3>
              <p className="text-slate-600">Secure electronic health records for comprehensive patient care.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Comfortable Environment</h3>
              <p className="text-slate-600">Welcoming, clean, and comfortable spaces designed for patient wellness.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Patient Family?</h2>
          <p className="text-xl mb-6 opacity-90">
            Experience the difference of personalized, comprehensive healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Schedule Your First Appointment
            </Link>
            <Link
              href="/intake"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Complete Patient Intake
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
} 