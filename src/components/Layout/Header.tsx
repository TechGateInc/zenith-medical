'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAppointmentUrls } from '@/lib/hooks/useSettings'
import type { Location } from '@prisma/client'

interface HeaderProps {
  location?: Location
}

interface LocationOption {
  id: string
  name: string
  slug: string
}

export default function Header({ location }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const [allLocations, setAllLocations] = useState<LocationOption[]>([])
  const pathname = usePathname()
  const { appointmentBookingUrl: globalBookingUrl, patientIntakeUrl: globalIntakeUrl } = useAppointmentUrls()
  const locationDropdownRef = useRef<HTMLDivElement>(null)

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

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationMenuOpen(false)
      }
    }
    if (isLocationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLocationMenuOpen])

  // Use location-specific URLs if available, otherwise fall back to global
  const appointmentBookingUrl = location?.bookingUrl || globalBookingUrl
  const patientIntakeUrl = location?.patientIntakeUrl || globalIntakeUrl

  // Build navigation with location prefix if in location context
  const locationPrefix = location ? `/${location.slug}` : ''
  const homeHref = location ? `/${location.slug}` : '/'

  const navigation = useMemo(() => [
    { name: 'Home', href: homeHref },
    { name: 'Services', href: `${locationPrefix}/services` },
    { name: 'Blog', href: `${locationPrefix}/blog` },
    { name: 'About', href: `${locationPrefix}/about` },
    { name: 'FAQs', href: `${locationPrefix}/faq` },
    { name: 'Contact', href: `${locationPrefix}/contact` },
  ], [locationPrefix, homeHref])

  const isActive = (href: string) => pathname === href

  // Get short location name (e.g., "Gloucester Center" from "Zenith Medical Centre - Gloucester Center")
  const shortLocationName = location?.name.replace('Zenith Medical Centre - ', '') || ''

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={homeHref} className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 relative mr-2 sm:mr-3 flex-shrink-0">
                <Image
                  src="/images/zenith-medical-logo single new.png"
                  alt="Zenith Medical Centre Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden xs:flex flex-col justify-center">
                <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 leading-tight">Zenith Medical Centre</span>
                <span className="text-xs sm:text-sm text-slate-600 leading-tight hidden sm:block">Expert Care, Patient Centered</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1 xl:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {/* Location Switcher - Desktop */}
            {location && allLocations.length > 1 && (
              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                  title={`Current: ${shortLocationName}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {isLocationMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Switch Location
                    </div>
                    {allLocations.map((loc) => (
                      <Link
                        key={loc.id}
                        href={`/${loc.slug}`}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          loc.slug === location.slug
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsLocationMenuOpen(false)}
                      >
                        {loc.name.replace('Zenith Medical Centre - ', '')}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <a
              href={patientIntakeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors whitespace-nowrap"
            >
              Registration Form
            </a>
            <a
              href={appointmentBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            >
              Request Appointment
            </a>
          </div>

          {/* Mobile/Tablet menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-50 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-label="Toggle main menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 max-h-[calc(100vh-56px)] overflow-y-auto">
            {/* Navigation grid for tablets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:hidden">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors text-center ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {/* List view for smaller mobile */}
            <div className="hidden sm:block">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {/* Location Switcher - Mobile */}
            {location && allLocations.length > 1 && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Switch Location
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allLocations.map((loc) => (
                    <Link
                      key={loc.id}
                      href={`/${loc.slug}`}
                      className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
                        loc.slug === location.slug
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {loc.name.replace('Zenith Medical Centre - ', '')}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              <a
                href={patientIntakeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 rounded-lg text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-center sm:text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Registration Form
              </a>
              <a
                href={appointmentBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 hover:text-white transition-colors text-center min-h-[48px] flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Request Appointment
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 