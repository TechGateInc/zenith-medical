import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationSlug = searchParams.get('location')

    let faqs

    if (locationSlug) {
      // Get location-specific FAQs (shared + override pattern)
      const location = await prisma.location.findUnique({
        where: { slug: locationSlug, isActive: true },
      })

      if (location) {
        faqs = await prisma.fAQ.findMany({
          where: {
            published: true,
            OR: [
              { locationId: null }, // Global FAQs
              { locationId: location.id }, // Location-specific FAQs
            ],
          },
          orderBy: { orderIndex: 'asc' },
        })
      } else {
        // Location not found, return global FAQs only
        faqs = await prisma.fAQ.findMany({
          where: {
            published: true,
            locationId: null,
          },
          orderBy: { orderIndex: 'asc' },
        })
      }
    } else {
      // No location specified, return global FAQs only
      faqs = await prisma.fAQ.findMany({
        where: {
          published: true,
          locationId: null,
        },
        orderBy: { orderIndex: 'asc' },
      })
    }

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}
