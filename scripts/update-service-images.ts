import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating service images...')

    const updates = [
        { title: 'Family Medicine', image: '/images/services/family-medicine.png' },
        { title: 'Preventive Care', image: '/images/services/preventive-care.png' },
        { title: 'Diagnostic Service', image: '/images/services/diagnostic-service.png' },
        { title: 'Chronic Disease Management', image: '/images/services/chronic-disease.png' },
        { title: 'Immunization', image: '/images/services/immunization.png' },
    ]

    for (const update of updates) {
        // Find partial match for title to handle potential slight variations
        const service = await prisma.service.findFirst({
            where: {
                title: {
                    contains: update.title,
                    mode: 'insensitive'
                }
            }
        })

        if (service) {
            await prisma.service.update({
                where: { id: service.id },
                data: { imageUrl: update.image }
            })
            console.log(`Updated ${service.title} with image ${update.image}`)
        } else {
            console.warn(`Service not found: ${update.title}`)
        }
    }

    console.log('Service images updated successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
