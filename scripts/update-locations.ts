import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating locations...')

  // Update existing location name and slug
  const updated = await prisma.location.updateMany({
    where: { slug: 'ottawa' },
    data: {
      name: 'Zenith Medical Centre - Gloucester Center',
      slug: 'gloucester'
    }
  })
  console.log('Renamed: ottawa -> gloucester (updated:', updated.count, 'records)')

  // Check if Vanier already exists
  const existingVanier = await prisma.location.findUnique({
    where: { slug: 'vanier' }
  })

  if (existingVanier) {
    console.log('Vanier location already exists, skipping creation')
  } else {
    // Create new Vanier location
    const vanier = await prisma.location.create({
      data: {
        name: 'Zenith Medical Centre - Vanier',
        slug: 'vanier',
        address: 'Adjacent to Farm boy, 585 Montréal Rd Unit 7',
        city: 'Ottawa',
        province: 'Ontario',
        postalCode: 'K1K 4K4',
        primaryPhone: '613-000-0000', // Placeholder
        email: 'vanier@zenithmedical.ca',
        primaryColor: '#10b981', // Green theme for Vanier
        secondaryColor: '#059669',
        businessHours: 'Mon-Fri 9AM-6PM',
        timezone: 'America/Toronto',
        isActive: true,
        openingSoon: true,
        featured: true,
        acceptingNewPatients: true,
        orderIndex: 1,
      }
    })
    console.log('Created: vanier -', vanier.name)
  }

  // List all locations
  const locations = await prisma.location.findMany({
    orderBy: { orderIndex: 'asc' }
  })
  console.log('\nAll Locations:')
  for (const loc of locations) {
    console.log(`  /${loc.slug} - ${loc.name}`)
    console.log(`    Address: ${loc.address}, ${loc.city}, ${loc.postalCode}`)
    console.log(`    Opening Soon: ${loc.openingSoon}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
