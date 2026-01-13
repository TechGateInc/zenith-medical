import { prisma } from '@/lib/prisma'
import type { Location, Service, FAQ, TeamMember, BlogPost, UninsuredService } from '@prisma/client'

// Types for location with relations
export type LocationWithRelations = Location & {
  services?: Service[]
  faqs?: FAQ[]
  teamMembers?: TeamMember[]
  blogPosts?: BlogPost[]
  uninsuredServices?: UninsuredService[]
}

/**
 * Get a location by its URL slug
 */
export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return prisma.location.findUnique({
    where: { slug, isActive: true },
  })
}

/**
 * Get all active locations, ordered by featured first then orderIndex
 */
export async function getActiveLocations(): Promise<Location[]> {
  return prisma.location.findMany({
    where: { isActive: true },
    orderBy: [
      { featured: 'desc' },
      { orderIndex: 'asc' },
      { name: 'asc' },
    ],
  })
}

/**
 * Get all location slugs (for static generation)
 */
export async function getLocationSlugs(): Promise<string[]> {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return locations.map(l => l.slug)
}

/**
 * Get location with full details
 */
export async function getLocationWithDetails(slug: string): Promise<LocationWithRelations | null> {
  return prisma.location.findUnique({
    where: { slug, isActive: true },
    include: {
      services: {
        where: { published: true },
        orderBy: { orderIndex: 'asc' },
      },
      faqs: {
        where: { published: true },
        orderBy: { orderIndex: 'asc' },
      },
      teamMembers: {
        where: { published: true },
        orderBy: { orderIndex: 'asc' },
      },
      uninsuredServices: {
        where: { published: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })
}

// ============================================================================
// SHARED + OVERRIDE Content Fetchers
// ============================================================================
// These fetch global content (locationId = null) and merge with location-specific
// content, with location-specific content taking precedence.

/**
 * Get services for a location using Shared + Override pattern
 * Location-specific services override global ones, plus location-only services are added
 */
export async function getServicesForLocation(locationSlug: string): Promise<Service[]> {
  const location = await getLocationBySlug(locationSlug)

  // Fetch global services (shared across all locations)
  const globalServices = await prisma.service.findMany({
    where: { published: true, locationId: null },
    orderBy: { orderIndex: 'asc' },
  })

  if (!location) {
    return globalServices
  }

  // Fetch location-specific services
  const locationServices = await prisma.service.findMany({
    where: { published: true, locationId: location.id },
    orderBy: { orderIndex: 'asc' },
  })

  // For Shared + Override: location services are additional, not overrides
  // If you need true override (by title match), implement it here
  return [...globalServices, ...locationServices]
}

/**
 * Get FAQs for a location using Shared + Override pattern
 */
export async function getFAQsForLocation(locationSlug: string): Promise<FAQ[]> {
  const location = await getLocationBySlug(locationSlug)

  const globalFAQs = await prisma.fAQ.findMany({
    where: { published: true, locationId: null },
    orderBy: { orderIndex: 'asc' },
  })

  if (!location) {
    return globalFAQs
  }

  const locationFAQs = await prisma.fAQ.findMany({
    where: { published: true, locationId: location.id },
    orderBy: { orderIndex: 'asc' },
  })

  return [...globalFAQs, ...locationFAQs]
}

/**
 * Get team members for a location using Shared + Override pattern
 */
export async function getTeamMembersForLocation(locationSlug: string): Promise<TeamMember[]> {
  const location = await getLocationBySlug(locationSlug)

  const globalTeam = await prisma.teamMember.findMany({
    where: { published: true, locationId: null },
    orderBy: { orderIndex: 'asc' },
  })

  if (!location) {
    return globalTeam
  }

  const locationTeam = await prisma.teamMember.findMany({
    where: { published: true, locationId: location.id },
    orderBy: { orderIndex: 'asc' },
  })

  return [...globalTeam, ...locationTeam]
}

/**
 * Get blog posts for a location (global + location-specific)
 */
export async function getBlogPostsForLocation(
  locationSlug: string,
  limit?: number
): Promise<BlogPost[]> {
  const location = await getLocationBySlug(locationSlug)

  const whereClause = {
    published: true,
    OR: [
      { locationId: null }, // Global posts
      ...(location ? [{ locationId: location.id }] : []),
    ],
  }

  return prisma.blogPost.findMany({
    where: whereClause,
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      author: true,
      category: true,
    },
  })
}

/**
 * Get uninsured services for a location
 */
export async function getUninsuredServicesForLocation(locationSlug: string): Promise<UninsuredService[]> {
  const location = await getLocationBySlug(locationSlug)

  const globalServices = await prisma.uninsuredService.findMany({
    where: { published: true, locationId: null },
    orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
  })

  if (!location) {
    return globalServices
  }

  const locationServices = await prisma.uninsuredService.findMany({
    where: { published: true, locationId: location.id },
    orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
  })

  return [...globalServices, ...locationServices]
}

// ============================================================================
// Admin Fetchers (includes all content regardless of published status)
// ============================================================================

/**
 * Get all locations for admin (including inactive)
 */
export async function getAllLocationsAdmin(): Promise<Location[]> {
  return prisma.location.findMany({
    orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
  })
}

/**
 * Get all services with location info for admin
 */
export async function getAllServicesAdmin(): Promise<(Service & { location: Location | null })[]> {
  return prisma.service.findMany({
    include: { location: true },
    orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
  })
}

/**
 * Get all FAQs with location info for admin
 */
export async function getAllFAQsAdmin(): Promise<(FAQ & { location: Location | null })[]> {
  return prisma.fAQ.findMany({
    include: { location: true },
    orderBy: [{ orderIndex: 'asc' }, { question: 'asc' }],
  })
}

/**
 * Get all team members with location info for admin
 */
export async function getAllTeamMembersAdmin(): Promise<(TeamMember & { location: Location | null })[]> {
  return prisma.teamMember.findMany({
    include: { location: true },
    orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
  })
}
