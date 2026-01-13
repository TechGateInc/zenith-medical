import { redirect } from "next/navigation";
import Layout from "../components/Layout/Layout";
import Link from "next/link";
import {
  generateMetadata as generateSEOMetadata,
  generateHomepageStructuredData,
  PAGE_METADATA,
} from "../lib/utils/seo";
import Image from "next/image";
import {
  getHomepageImageUrl,
  getAppointmentBookingUrl,
  getPatientIntakeUrl,
  getWhyChooseUsImageUrl,
  getAcceptingNewPatients,
} from "../lib/utils/server-settings";
import GoogleMapsClient from "@/components/UI/GoogleMapsClient";
import { prisma } from "@/lib/prisma";
import { getActiveLocations } from "@/lib/utils/location-content";

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string | null;
  imageUrl: string | null;
  orderIndex: number;
  published: boolean;
}

async function getServices(): Promise<Service[]> {
  try {
    const services = await prisma.service.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' }
    });
    return services;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

interface Doctor {
  id: string;
  name: string;
  title: string;
  photoUrl: string | null;
  bio: string | null;
  doctor: {
    bookingUrl: string | null;
    professionalBio: string;
  } | null;
}

async function getDoctors(): Promise<Doctor[]> {
  try {
    const doctors = await prisma.teamMember.findMany({
      where: {
        isDoctor: true,
        published: true
      },
      include: {
        doctor: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });
    return doctors;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return [];
  }
}

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.home,
  canonical: "/",
});

export default async function Home() {
  // Check if we have locations set up
  const locations = await getActiveLocations();

  // If locations exist, always redirect to location selector
  if (locations.length > 0) {
    redirect('/location-selector');
  }

  // If no locations, show the original homepage (backwards compatibility)
  const structuredData = generateHomepageStructuredData();
  const homepageImageUrl = await getHomepageImageUrl();
  const appointmentBookingUrl = await getAppointmentBookingUrl();
  const patientIntakeUrl = await getPatientIntakeUrl();
  const whyChooseUsImageUrl = await getWhyChooseUsImageUrl();
  const acceptingNewPatients = await getAcceptingNewPatients();
  const services = await getServices();
  const doctors = await getDoctors();

  return (
    <Layout className="bg-slate-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section with Prominent CTAs */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Efficient Medical Centre
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
                  Experience healthcare reimagined at our cutting-edge medical
                  centre. We combine efficient medical technology with
                  compassionate patient care to deliver exceptional healthcare
                  for you and your family.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                  <a
                    href={appointmentBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold rounded-lg transition-colors shadow-lg text-base sm:text-lg whitespace-nowrap min-h-[48px]"
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
                  <a
                    href={patientIntakeUrl}
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
                </div>

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
                    {acceptingNewPatients ? (
                      <>
                        <span className="text-xs sm:text-sm">Now Open:</span>
                        <span className="font-semibold ml-1">
                          Accepting New Patients
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">Join the waitlist</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative order-1 lg:order-2">
                <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                  <Image
                    src={homepageImageUrl}
                    alt="Zenith Medical Centre - Cutting-edge medical facility"
                    width={800}
                    height={384}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  {/* Optional overlay for better text contrast if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
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
              {/* Section Badge */}
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 border border-green-200 rounded-full mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wider">
                    Our Services
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                  Our Medical Services
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                  Comprehensive healthcare services for you and your family with
                  efficient medical expertise and compassionate care
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 flex flex-col h-full group"
                  >
                    {/* Service Image */}
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
                      <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 shadow-sm z-10">
                          {service.icon ? (
                            <span
                              dangerouslySetInnerHTML={{ __html: service.icon }}
                            />
                          ) : (
                            <svg
                              className="h-8 w-8 sm:h-10 sm:w-10"
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
                          )}
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-blue-200/50 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 sm:w-40 h-32 sm:h-40 bg-blue-200/50 rounded-full blur-2xl"></div>

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
                            {service.features
                              .slice(0, 3)
                              .map((feature, index) => (
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
                          href="/services"
                          className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-1 duration-300 text-sm sm:text-base"
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

              {/* View All Services Link */}
              <div className="text-center mt-8 sm:mt-10 md:mt-12">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-sm sm:text-base min-h-[44px]"
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
        {doctors.length > 0 && (
          <section className="mb-12 sm:mb-14 md:mb-16">
            <div className="max-w-6xl mx-auto">
              {/* Section Badge */}
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
                  Our experienced physicians are dedicated to providing
                  exceptional care for you and your family
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {doctors.slice(0, 6).map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1"
                    >
                      {/* Doctor Photo */}
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
                        <div className="mb-3 sm:mb-4">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                            {doctor.name}
                          </h3>
                          <p className="text-blue-600 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                            {doctor.title}
                          </p>
                          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                            {doctor.bio ||
                              doctor.doctor?.professionalBio ||
                              "Dedicated healthcare professional committed to your well-being."}
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                          <a
                            href={
                              doctor.doctor?.bookingUrl || appointmentBookingUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm sm:text-base min-h-[44px]"
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
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="mb-12 sm:mb-14 md:mb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 border border-purple-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                Why Choose Zenith Medical Centre?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                Experience the difference that our efficient medical facility,
                advanced technology, and patient-focused care make in your
                healthcare journey
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
              {/* Left Content - Features Grid */}
              <div className="space-y-5 sm:space-y-6 order-2 lg:order-1">
                <div className="flex items-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 sm:mr-5 md:mr-6 flex-shrink-0">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
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
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">
                      Experienced Medical Team
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Board-certified physicians with decades of combined
                      experience in family medicine and specialized care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 sm:mr-5 md:mr-6 flex-shrink-0">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">
                      Efficient Facilities
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Cutting-edge medical equipment and comfortable, clean
                      facilities designed for optimal patient care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 sm:mr-5 md:mr-6 flex-shrink-0">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">
                      Patient-Centered Care
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Personalized treatment plans focused on your individual
                      health goals, needs, and comprehensive wellness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Visual Element */}
              <div className="relative order-1 lg:order-2">
                {whyChooseUsImageUrl ? (
                  <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={whyChooseUsImageUrl}
                      alt="Why Choose Zenith Medical Centre"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-6 left-6 w-10 sm:w-12 h-10 sm:h-12 bg-purple-600 rounded-full"></div>
                      <div className="absolute top-16 right-12 w-6 sm:w-8 h-6 sm:h-8 bg-purple-500 rounded-full"></div>
                      <div className="absolute bottom-12 left-12 w-5 sm:w-6 h-5 sm:h-6 bg-purple-700 rounded-full"></div>
                      <div className="absolute bottom-6 right-6 w-12 sm:w-16 h-12 sm:h-16 bg-purple-400 rounded-full"></div>
                    </div>

                    <div className="text-center relative z-10 px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                        <svg
                          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-1 sm:mb-2">
                        Excellence in Care
                      </h3>
                      <p className="text-sm sm:text-base text-purple-700">
                        Trusted by thousands of families
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section with Google Maps */}
        <section className="bg-slate-50 rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Healthcare Access
                </span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight text-center">
                Ready to Start Your Healthcare Journey?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed text-center px-2">
                Experience comprehensive healthcare with efficient medical
                expertise and compassionate patient care. Join thousands of
                patients who trust Zenith Medical Centre for their healthcare
                needs.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                    Secure Health Records
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Secure digital records with patient portal access.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM9 3v12m0 0l3-3m-3 3l-3-3m12-9a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                    Instant Updates
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Get real-time notifications about appointments and health
                    updates.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
                <a
                  href={appointmentBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold rounded-lg transition-colors shadow-lg text-base sm:text-lg whitespace-nowrap min-h-[48px]"
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
                  Schedule Appointment
                </a>
                <a
                  href={patientIntakeUrl}
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
              </div>

              {/* Google Maps Section */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 text-center">
                  Find Our Location
                </h3>
                <div className="max-w-2xl mx-auto">
                  <GoogleMapsClient
                    address="Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3"
                    className="w-full h-48 sm:h-56 md:h-64 rounded-lg"
                    height="250px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="mb-12 sm:mb-14 md:mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Quick Access
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 sm:mb-4 leading-tight">
                Get Started Today
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
                Choose your next step towards better health and wellness
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <a
                href={appointmentBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md sm:shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600"
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
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                    Schedule Appointment
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Book your next visit with our medical team
                  </p>
                </div>
              </a>

              <a
                href={patientIntakeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md sm:shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600"
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
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                    Registration Form
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Complete your intake form before your visit
                  </p>
                </div>
              </a>

              <Link href="/faq" className="block sm:col-span-2 md:col-span-1">
                <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md sm:shadow-lg border border-slate-200 hover:shadow-xl transition-shadow text-center h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                    Questions?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Find answers to common patient questions
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
