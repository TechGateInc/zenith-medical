'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import { useCachedPrimaryPhone, useCachedAddressOnly, useCachedBusinessHours } from '@/lib/hooks/useCachedAddress';
import { useAppointmentUrls } from '@/lib/hooks/useSettings';
import GoogleMapsLink from '@/components/UI/GoogleMapsLink';
import GoogleMaps from '@/components/UI/GoogleMaps';
import type { Location } from '@prisma/client';

interface FooterProps {
  location?: Location
}

interface LocationOption {
  id: string
  name: string
  slug: string
}

export default function Footer({ location }: FooterProps) {
  const [allLocations, setAllLocations] = useState<LocationOption[]>([])

  // Fetch all locations for the switcher
  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (data.locations) {
          setAllLocations(data.locations.map((l: Location) => ({
            id: l.id,
            name: l.name,
            slug: l.slug
          })))
        }
      })
      .catch(() => {})
  }, [])
  const currentYear = new Date().getFullYear()
  const { primaryPhone: globalPhone, loading: phoneLoading } = useCachedPrimaryPhone();
  const { address: globalAddress, loading: addressLoading } = useCachedAddressOnly();
  const { businessHours: globalHours, loading: hoursLoading } = useCachedBusinessHours();
  const { patientIntakeUrl: globalIntakeUrl } = useAppointmentUrls();

  // Use location-specific data if available
  const primaryPhone = location?.primaryPhone || globalPhone;
  const address = location ? `${location.address}, ${location.city}, ${location.province} ${location.postalCode}` : globalAddress;
  const businessHours = location?.businessHours || globalHours;
  const patientIntakeUrl = location?.patientIntakeUrl || globalIntakeUrl;

  // Build navigation with location prefix if in location context
  const locationPrefix = location ? `/${location.slug}` : '';

  const quickLinks = useMemo(() => [
    { name: 'Home', href: locationPrefix || '/' },
    { name: 'About Us', href: `${locationPrefix}/about` },
    { name: 'Services', href: `${locationPrefix}/services` },
    { name: 'Contact', href: `${locationPrefix}/contact` },
  ], [locationPrefix]);

  const patientResources = useMemo(() => [
    { name: 'Registration Form', href: patientIntakeUrl },
    { name: 'FAQs', href: `${locationPrefix}/faq` },
  ], [patientIntakeUrl, locationPrefix]);

  const services = useMemo(() => [
    { name: 'Family Medicine', href: `${locationPrefix}/services` },
    { name: 'Preventive Care', href: `${locationPrefix}/services` },
    { name: 'Chronic Disease Management', href: `${locationPrefix}/services` },
    { name: 'Mental Health Care', href: `${locationPrefix}/services` }
  ], [locationPrefix]);

  const company = useMemo(() => [
    { name: 'About Us', href: `${locationPrefix}/about` },
    { name: 'Our Team', href: `${locationPrefix}/about` },
  ], [locationPrefix]);

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Medical Center Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mr-3 sm:mr-4 relative">
                <Image
                  src="/images/zenith-medical-logo new 1.png"
                  alt="Zenith Medical Centre Logo"
                  width={64}
                  height={64}
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>

            <p className="text-gray-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Providing compassionate, patient-centered healthcare services with efficient medical expertise.
              Your health and wellness are our top priority.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-white text-sm sm:text-base">{addressLoading ? 'Loading...' : address}</div>
                  {!addressLoading && address && (
                    <GoogleMapsLink
                      address={address}
                      className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm mt-1 inline-block"
                    >
                      View on Google Maps
                    </GoogleMapsLink>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <div className="text-white text-sm sm:text-base"><a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="hover:underline">
                    {phoneLoading ? 'Loading...' : primaryPhone}
                  </a></div>
                  <div className="text-gray-300 text-xs sm:text-sm">Clinic Line</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8.5a6.5 6.5 0 0113 0V12a6.5 6.5 0 01-13 0V8.5z" />
                </svg>
                <div>
                  <Link href="/contact#contact-form" className="text-white hover:underline text-sm sm:text-base">Contact Us Form</Link>
                  <div className="text-gray-300 text-xs sm:text-sm">General Inquiries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Find Us</h3>
            {!addressLoading && address && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <GoogleMaps
                  address={address}
                  className="w-full h-40 sm:h-44 md:h-48"
                  height="200px"
                />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Patient Resources</h3>
            <ul className="space-y-2">
              {patientResources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Office Hours */}
            <div className="mt-4 sm:mt-6">
              <h4 className="text-base sm:text-lg font-semibold mb-2">Office Hours</h4>
              <div className="text-sm sm:text-base text-gray-300">{hoursLoading ? 'Loading...' : businessHours}</div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Location Switcher */}
            {allLocations.length > 1 && (
              <div className="mt-6">
                <h4 className="text-base sm:text-lg font-semibold mb-2">Our Locations</h4>
                <ul className="space-y-2">
                  {allLocations.map((loc) => (
                    <li key={loc.id}>
                      <Link
                        href={`/${loc.slug}`}
                        className={`text-sm sm:text-base transition-colors duration-200 flex items-center gap-2 ${
                          location?.slug === loc.slug
                            ? 'text-blue-400'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {loc.name.replace('Zenith Medical Centre - ', '')}
                        {location?.slug === loc.slug && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Current</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="text-red-200 font-semibold text-sm sm:text-base">Medical Emergency</div>
                <div className="text-red-300 text-xs sm:text-sm">For life-threatening emergencies, call 911 immediately</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} Zenith Medical Centre. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
} 