import Image from 'next/image'
import { getActiveLocations } from '@/lib/utils/location-content'
import LocationCard from '@/components/Location/LocationCard'

export const metadata = {
  title: 'Find a Location | Zenith Medical Centre',
  description: 'Find a Zenith Medical Centre location near you. Expert care, patient centered.',
}

export default async function LocationSelectorPage() {
  const locations = await getActiveLocations()

  // If no locations exist, show a message
  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <Image
            src="/images/zenith-medical-logo new 1.png"
            alt="Zenith Medical Centre"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Coming Soon
          </h1>
          <p className="text-lg text-slate-600">
            Our locations are being set up. Please check back soon.
          </p>
        </div>
      </div>
    )
  }

  const featuredLocations = locations.filter(l => l.featured)
  const otherLocations = locations.filter(l => !l.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      {/* Header / Branding */}
      <header className="pt-10 sm:pt-14 pb-6 sm:pb-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <Image
            src="/images/zenith-medical-logo new 1.png"
            alt="Zenith Medical Centre"
            width={72}
            height={72}
            className="mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 text-center">
            Zenith Medical Centre
          </h1>
          <p className="text-blue-600 font-medium text-center">
            Expert Care, Patient Centered
          </p>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 w-full">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 sm:py-12 w-full">
        {/* Title */}
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 text-center">
            Find a Location Near You
          </h2>
          <p className="text-slate-600 max-w-md text-center">
            Select a clinic to view services, meet our team, and book appointments
          </p>
        </div>

        {/* Location Cards */}
        <div className={`grid gap-6 sm:gap-8 ${
          locations.length === 1
            ? 'max-w-md mx-auto'
            : locations.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {featuredLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
          {otherLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>

        {/* Help text */}
        <div className="flex justify-center mt-10">
          <p className="text-sm text-slate-500">
            Need help choosing?{' '}
            <a href="mailto:info@zenithmedical.ca" className="text-blue-600 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-6">
        <div className="max-w-5xl mx-auto px-4 flex justify-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Zenith Medical Centre. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
