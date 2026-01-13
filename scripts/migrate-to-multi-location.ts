/**
 * Migration Script: Create First Location from SystemSettings
 *
 * This script creates the first location using data from the existing SystemSettings.
 * It also sets the defaultLocationId in SystemSettings.
 *
 * Run with: npx ts-node scripts/migrate-to-multi-location.ts
 * Or with: bun run scripts/migrate-to-multi-location.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting multi-location migration...')

  // Check if locations already exist
  const existingLocations = await prisma.location.count()
  if (existingLocations > 0) {
    console.log(`Found ${existingLocations} existing location(s). Skipping migration.`)
    return
  }

  // Get current system settings
  const settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    console.error('No SystemSettings found. Please create settings first.')
    process.exit(1)
  }

  console.log('Found SystemSettings:')
  console.log(`  Address: ${settings.address}`)
  console.log(`  Phone: ${settings.primaryPhone}`)
  console.log(`  Email: ${settings.adminEmail}`)

  // Parse address to extract city, province, postal code
  // Expected format: "Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3"
  const addressParts = settings.address.split(',').map(s => s.trim())

  // Extract postal code (last part)
  const postalCode = addressParts[addressParts.length - 1] || 'K1J 9L3'

  // Extract city (second to last is usually city)
  const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : 'Ottawa'

  // Street address is everything before city
  const streetAddress = addressParts.slice(0, -2).join(', ') || settings.address.split(',').slice(0, 2).join(',').trim()

  // Create slug from city name
  const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  console.log('\nCreating first location:')
  console.log(`  Name: Zenith Medical Centre - ${city}`)
  console.log(`  Slug: ${slug}`)
  console.log(`  Street: ${streetAddress}`)
  console.log(`  City: ${city}`)
  console.log(`  Postal Code: ${postalCode}`)

  // Create the first location
  const location = await prisma.location.create({
    data: {
      name: `Zenith Medical Centre - ${city}`,
      slug: slug,
      address: streetAddress,
      city: city,
      province: 'Ontario',
      postalCode: postalCode,
      primaryPhone: settings.primaryPhone,
      emergencyPhone: settings.emergencyPhone,
      faxNumber: settings.faxNumber,
      email: settings.adminEmail,
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      heroImageUrl: settings.homepageImageUrl,
      bookingUrl: settings.appointmentBookingUrl,
      patientIntakeUrl: settings.patientIntakeUrl,
      businessHours: settings.businessHours,
      timezone: settings.timezone,
      isActive: true,
      openingSoon: false,
      featured: true,
      acceptingNewPatients: settings.acceptingNewPatients,
      announcementEnabled: settings.announcementEnabled,
      announcementTitle: settings.announcementTitle,
      announcementMessage: settings.announcementMessage,
      announcementType: settings.announcementType,
      orderIndex: 0,
    },
  })

  console.log(`\nCreated location with ID: ${location.id}`)

  // Update SystemSettings with the default location ID
  await prisma.systemSettings.update({
    where: { id: settings.id },
    data: { defaultLocationId: location.id },
  })

  console.log(`Updated SystemSettings with defaultLocationId: ${location.id}`)

  // Summary
  console.log('\n✅ Migration completed successfully!')
  console.log(`\nYou can now access the location at: /${location.slug}`)
  console.log('\nExisting content (services, team, FAQs, blog posts) remain global (locationId = null).')
  console.log('You can assign them to specific locations through the admin panel.')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
