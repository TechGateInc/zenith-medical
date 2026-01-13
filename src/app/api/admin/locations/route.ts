import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all locations
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            services: true,
            teamMembers: true,
            faqs: true,
            blogPosts: true,
            uninsuredServices: true,
          },
        },
      },
    })
    return NextResponse.json({ success: true, locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// CREATE a new location
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const {
      name,
      slug,
      address,
      city,
      province,
      postalCode,
      primaryPhone,
      emergencyPhone,
      faxNumber,
      email,
      primaryColor,
      secondaryColor,
      heroImageUrl,
      bookingUrl,
      patientIntakeUrl,
      businessHours,
      timezone,
      isActive,
      openingSoon,
      featured,
      acceptingNewPatients,
      announcementEnabled,
      announcementTitle,
      announcementMessage,
      announcementType,
      orderIndex,
    } = data

    // Check for duplicate slug
    const existing = await prisma.location.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A location with this slug already exists' },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: {
        name,
        slug,
        address,
        city,
        province: province || 'Ontario',
        postalCode,
        primaryPhone,
        emergencyPhone,
        faxNumber,
        email,
        primaryColor: primaryColor || '#2563eb',
        secondaryColor: secondaryColor || '#1e40af',
        heroImageUrl,
        bookingUrl,
        patientIntakeUrl,
        businessHours,
        timezone: timezone || 'America/Toronto',
        isActive: isActive ?? true,
        openingSoon: openingSoon ?? false,
        featured: featured ?? false,
        acceptingNewPatients: acceptingNewPatients ?? true,
        announcementEnabled: announcementEnabled ?? false,
        announcementTitle,
        announcementMessage,
        announcementType: announcementType || 'info',
        orderIndex: orderIndex ?? 0,
      },
    })

    return NextResponse.json({ success: true, location })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

// UPDATE a location
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, ...update } = data

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing location id' },
        { status: 400 }
      )
    }

    // If slug is being updated, check for duplicates
    if (update.slug) {
      const existing = await prisma.location.findFirst({
        where: { slug: update.slug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A location with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const location = await prisma.location.update({
      where: { id },
      data: update,
    })

    return NextResponse.json({ success: true, location })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE a location
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing location id' },
        { status: 400 }
      )
    }

    // Check for associated content
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
            teamMembers: true,
            faqs: true,
            blogPosts: true,
            uninsuredServices: true,
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      )
    }

    const totalContent =
      location._count.services +
      location._count.teamMembers +
      location._count.faqs +
      location._count.blogPosts +
      location._count.uninsuredServices

    if (totalContent > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete location with associated content. Please reassign or delete ${totalContent} item(s) first.`,
        },
        { status: 400 }
      )
    }

    await prisma.location.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
