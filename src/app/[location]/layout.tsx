import { notFound } from 'next/navigation'
import { getLocationBySlug, getLocationSlugs } from '@/lib/utils/location-content'
import LocationColorInjector from '@/components/Location/LocationColorInjector'
import Layout from '@/components/Layout/Layout'

interface LocationLayoutProps {
  children: React.ReactNode
  params: Promise<{ location: string }>
}

// Generate static params for all active locations
export async function generateStaticParams() {
  const slugs = await getLocationSlugs()
  return slugs.map((location) => ({ location }))
}

export default async function LocationLayout({
  children,
  params,
}: LocationLayoutProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  // 404 if location doesn't exist or isn't active
  if (!location) {
    notFound()
  }

  return (
    <>
      <LocationColorInjector
        primaryColor={location.primaryColor}
        secondaryColor={location.secondaryColor}
      />
      <div className="location-theme">
        <Layout className="bg-slate-50" location={location}>
          {children}
        </Layout>
      </div>
    </>
  )
}
