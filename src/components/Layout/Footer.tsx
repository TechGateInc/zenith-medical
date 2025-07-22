import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ]

  const patientResources = [
    { name: 'Patient Intake', href: '/intake' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Health Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Medical Center Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 mr-4 relative">
                <Image
                  src="/images/zenith-medical-logo new 1.png"
                  alt="Zenith Medical Centre Logo"
                  width={64}
                  height={64}
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
                              Providing compassionate, patient-centered healthcare services with efficient medical expertise. 
              Your health and wellness are our top priority.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-white">Unit 216, 1980 Ogilvie Road</div>
                  <div className="text-gray-300 text-sm">Gloucester, Ottawa, K1J 9L3</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <div className="text-white">249 806 0128</div>
                  <div className="text-gray-300 text-sm">Clinic Line</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8.5a6.5 6.5 0 0113 0V12a6.5 6.5 0 01-13 0V8.5z" />
                </svg>
                <div>
                  <Link href="/contact" className="text-white hover:underline">Contact Us Form</Link>
                  <div className="text-gray-300 text-sm">General Inquiries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Patient Resources</h3>
            <ul className="space-y-2">
              {patientResources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Office Hours */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Office Hours</h4>
              <div>Monday - Saturday: 9:00 AM - 5:00 PM</div>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="text-red-200 font-semibold">Medical Emergency</div>
                <div className="text-red-300 text-sm">For life-threatening emergencies, call 911 immediately</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {currentYear} Zenith Medical Centre. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white text-sm transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 