'use client';

import Layout from '../../components/Layout/Layout';
import { useCachedPrimaryPhone, useCachedAddressOnly, useCachedAdminEmail } from '@/lib/hooks/useCachedAddress';
import { useAppointmentUrls } from '@/lib/hooks/useSettings';
import GoogleMaps from '@/components/UI/GoogleMaps';
import GoogleMapsLink from '@/components/UI/GoogleMapsLink';
export default function Contact() {
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();
  const { address, loading: addressLoading } = useCachedAddressOnly();
  const { adminEmail, loading: emailLoading } = useCachedAdminEmail();
  const { patientIntakeUrl, appointmentBookingUrl } = useAppointmentUrls();

  const contactInfo = {
    primary: <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
      {phoneLoading ? 'Loading...' : primaryPhone}
    </a>,
    email: <a href={`mailto:${adminEmail}`} className="text-blue-600 hover:underline break-all">
      {emailLoading ? 'Loading...' : adminEmail}
    </a>,
    address: addressLoading ? 'Loading...' : address
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-2">
              Get in touch with our team. We&apos;re here to help with any questions about our services or to schedule your appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Get in Touch</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Phone</h3>
                      <p className="text-sm sm:text-base text-slate-600">{contactInfo.primary}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Email</h3>
                      <p className="text-sm sm:text-base text-slate-600">{contactInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Address</h3>
                      <p className="text-sm sm:text-base text-slate-600 mb-2">{contactInfo.address}</p>
                      {!addressLoading && address && (
                        <GoogleMapsLink
                          address={address}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                        >
                          View on Google Maps
                        </GoogleMapsLink>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Quick Actions</h2>

                <div className="space-y-3 sm:space-y-4">
                  <a
                    href={patientIntakeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg sm:transform sm:hover:-translate-y-0.5 text-sm sm:text-base min-h-[48px]"
                  >
                    <svg className="mr-2 sm:mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Registration Form
                  </a>

                  <a
                    href={appointmentBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 sm:px-6 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg sm:transform sm:hover:-translate-y-0.5 text-sm sm:text-base min-h-[48px]"
                  >
                    <svg className="mr-2 sm:mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Request Appointment
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps and Additional Info */}
            <div className="space-y-6 sm:space-y-8">
              {/* Google Maps */}
              {!addressLoading && address && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Find Us</h2>
                  <div className="h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                    <GoogleMaps address={address} className="w-full h-full" />
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Get in Touch</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0">
                        <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                          Contact Information
                        </h3>
                        <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                          <p>For the fastest response, please contact us directly:</p>
                          <ul className="mt-1 sm:mt-2 space-y-1">
                            <li className="flex flex-wrap"><span className="mr-1">•</span><strong className="mr-1">Phone:</strong> <span className="break-all">{contactInfo.primary}</span></li>
                            <li className="flex flex-wrap"><span className="mr-1">•</span><strong className="mr-1">Email:</strong> <span className="break-all">{contactInfo.email}</span></li>
                            <li><span className="mr-1">•</span><strong>Visit:</strong> Our clinic during business hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <h3 className="text-xs sm:text-sm font-medium text-green-800">
                          Online Services Available
                        </h3>
                        <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-700">
                          <p>You can also use our online services:</p>
                          <ul className="mt-1 sm:mt-2 space-y-1">
                            <li><span className="mr-1">•</span>Complete registration forms online</li>
                            <li><span className="mr-1">•</span>Request appointments through our booking system</li>
                            <li><span className="mr-1">•</span>Access your health information securely</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
