import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Adding Immunization service...')

    // Check if Immunization already exists
    const existing = await prisma.service.findFirst({
        where: { title: 'Immunization' }
    })

    if (existing) {
        console.log('Immunization service already exists')
        return
    }

    // Get highest orderIndex
    const lastService = await prisma.service.findFirst({
        orderBy: { orderIndex: 'desc' }
    })
    const nextOrder = (lastService?.orderIndex || 0) + 1

    await prisma.service.create({
        data: {
            title: 'Immunization',
            description: 'Comprehensive vaccination services to protect you and your family from preventable diseases.',
            features: [
                'Flu shots and seasonal vaccines',
                'Travel vaccinations',
                'Childhood immunization schedules'
            ],
            icon: '<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
            orderIndex: nextOrder,
            published: true
        }
    })

    console.log('Immunization service added successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
