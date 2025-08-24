import Layout from '../../../components/Layout/Layout'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { generateDoctorStructuredData } from '../../../lib/utils/seo'
import { prisma } from '../../../lib/prisma'

// Note: In Next.js 15, params is a Promise in server components

// Generate metadata for the doctor page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doctorName = slug.replace(/-/g, ' ')
  
  const doctor = await prisma.teamMember.findFirst({
    where: {
      isDoctor: true,
      published: true,
      name: {
        contains: doctorName,
        mode: 'insensitive'
      }
    },
    include: {
      doctor: true
    }
  })

  if (!doctor) {
    return {
      title: 'Doctor Not Found',
      description: 'The requested doctor profile could not be found.'
    }
  }

  return {
    title: `${doctor.name} - ${doctor.title} | Zenith Medical Centre`,
    description: doctor.doctor?.professionalBio || doctor.bio || `Meet ${doctor.name}, ${doctor.title} at Zenith Medical Centre.`,
    openGraph: {
      title: `${doctor.name} - ${doctor.title}`,
      description: doctor.doctor?.professionalBio || doctor.bio || `Meet ${doctor.name}, ${doctor.title} at Zenith Medical Centre.`,
      images: doctor.photoUrl ? [doctor.photoUrl] : [],
    }
  }
}

// Fetch doctor data
async function getDoctor(slug: string) {
  const doctorName = slug.replace(/-/g, ' ')
  
  try {
    const doctor = await prisma.teamMember.findFirst({
      where: {
        isDoctor: true,
        published: true,
        name: {
          contains: doctorName,
          mode: 'insensitive'
        }
      },
      include: {
        doctor: true
      }
    })

    if (!doctor) {
      return null
    }

    return {
      ...doctor,
      bio: doctor.bio || undefined,
      photoUrl: doctor.photoUrl || undefined,
      email: doctor.email || undefined,
      phone: doctor.phone || undefined,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
      doctor: doctor.doctor ? {
        ...doctor.doctor,
        createdAt: doctor.doctor.createdAt.toISOString(),
        updatedAt: doctor.doctor.updatedAt.toISOString()
      } : null
    }
  } catch (error) {
    console.error('Failed to fetch doctor:', error)
    return null
  }
}

export default async function DoctorProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doctor = await getDoctor(slug)

  if (!doctor) {
    notFound()
  }

  // Generate structured data for the doctor
  const doctorStructuredData = generateDoctorStructuredData({
    name: doctor.name,
    title: doctor.title,
    specialties: doctor.specialties || [],
    experience: doctor.doctor?.professionalBio || doctor.bio || `Experienced healthcare professional`
  })

  return (
    <Layout>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorStructuredData) }}
      />
      
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Doctor Image */}
            <div className="relative">
              {doctor.photoUrl ? (
                <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-96 lg:h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                MEET OUR DOCTOR
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                {doctor.name}
              </h1>
              
              <p className="text-2xl lg:text-3xl text-blue-600 font-semibold mb-6">
                {doctor.title}
              </p>

              {doctor.credentials && (
                <p className="text-lg text-slate-600 mb-4">{doctor.credentials}</p>
              )}

              {doctor.experience && (
                <p className="text-lg text-slate-600 mb-6">{doctor.experience}</p>
              )}

              {/* Specialties */}
              {doctor.specialties && doctor.specialties.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((specialty, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Request Appointment
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  View All Doctors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Biography */}
      {doctor.doctor?.professionalBio && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Professional Biography
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <div className="prose prose-lg max-w-none text-slate-700">
              <p className="text-lg leading-relaxed">
                {doctor.doctor.professionalBio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Education & Training */}
      {(doctor.doctor?.medicalSchool || doctor.doctor?.residency) && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Education & Training
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {doctor.doctor.medicalSchool && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Medical School</h3>
                  <p className="text-slate-600">{doctor.doctor.medicalSchool}</p>
                  {doctor.doctor.graduationYear && (
                    <p className="text-sm text-slate-500 mt-2">Graduated {doctor.doctor.graduationYear}</p>
                  )}
                </div>
              )}
              
              {doctor.doctor?.residency && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Residency</h3>
                  <p className="text-slate-600">{doctor.doctor?.residency}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Certifications & Memberships */}
      {(doctor.doctor && ((doctor.doctor.boardCertifications && doctor.doctor.boardCertifications.length > 0) || (doctor.doctor.memberships && doctor.doctor.memberships.length > 0))) && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Certifications & Memberships
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {doctor.doctor?.boardCertifications && doctor.doctor.boardCertifications.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Board Certifications</h3>
                  <div className="space-y-2">
                    {doctor.doctor.boardCertifications.map((cert, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {doctor.doctor?.memberships && doctor.doctor.memberships.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Professional Memberships</h3>
                  <div className="space-y-2">
                    {doctor.doctor.memberships.map((membership, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-slate-700">{membership}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
            Ready to Schedule with Dr. {doctor.name.split(' ').pop()}?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Book an appointment and experience exceptional care from our experienced healthcare professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Request Appointment
            </Link>
            <Link
              href="/doctors"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View All Doctors
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
