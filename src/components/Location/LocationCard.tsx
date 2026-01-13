import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react'
import type { Location } from '@prisma/client'

interface LocationCardProps {
  location: Location
  featured?: boolean
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/${location.slug}`}
      className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Hero Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {location.heroImageUrl ? (
          <Image
            src={location.heroImageUrl}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${location.primaryColor}20, ${location.secondaryColor}40)`,
            }}
          >
            <MapPin size={64} style={{ color: location.primaryColor }} className="opacity-30" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {location.openingSoon && (
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow">
              Opening Soon
            </span>
          )}
          {location.featured && !location.openingSoon && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow">
              Featured
            </span>
          )}
        </div>

        {/* Color accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: location.primaryColor }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {location.name}
        </h3>

        <div className="space-y-2 text-gray-600 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <div>
              <p>{location.address}</p>
              <p>
                {location.city}, {location.province} {location.postalCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} className="flex-shrink-0 text-gray-400" />
            <span>{location.primaryPhone}</span>
          </div>

          <div className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-2">{location.businessHours}</span>
          </div>
        </div>

        {/* Accepting New Patients indicator */}
        {location.acceptingNewPatients && (
          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Accepting New Patients
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold"
          style={{ color: location.primaryColor }}
        >
          <span>View Location</span>
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  )
}
