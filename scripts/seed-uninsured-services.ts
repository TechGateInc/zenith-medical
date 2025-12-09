import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Client-provided uninsured services list (without Botox)
const UNINSURED_SERVICES = [
    // Clinical Services
    { category: 'clinical', title: 'Medical consultation for non OHIP', price: '$100', orderIndex: 0 },
    { category: 'clinical', title: 'Complete exam for non OHIP', price: '$180', orderIndex: 1 },
    { category: 'clinical', title: 'Drivers medical examination', price: '$180', orderIndex: 2 },
    { category: 'clinical', title: 'Insurance requested medical examination', price: '$180', orderIndex: 3 },
    { category: 'clinical', title: 'Pap test for non OHIP', price: '$125', orderIndex: 4 },
    { category: 'clinical', title: 'Missed appointment without 24h notice', price: '$50/15 min slot', description: 'Missed complete exam: $180', orderIndex: 5 },
    { category: 'clinical', title: 'Fax prescription refill without a visit', price: '$20/medication', orderIndex: 6 },
    { category: 'clinical', title: 'Extra wound dressing supplies', description: 'If not part of a procedure', price: '$10', orderIndex: 7 },
    { category: 'clinical', title: 'Liquid nitrogen therapy for benign lesions', price: '$40 (1-4 lesions)', description: 'Additional lesions: $5 each', orderIndex: 8 },
    { category: 'clinical', title: 'Genital or plantar wart therapy', price: 'Insured', isInsured: true, orderIndex: 9 },
    { category: 'clinical', title: 'Travel advice to outside Canada', price: '$110/15 min', orderIndex: 10 },
    { category: 'clinical', title: 'T.B testing and form completion for work', price: '$50 (1 step) / $75 (2 steps)', orderIndex: 11 },
    { category: 'clinical', title: 'T.B testing for educational program enrollment', price: 'Insured', isInsured: true, orderIndex: 12 },
    { category: 'clinical', title: 'Travel vaccine administration', price: '$20', orderIndex: 13 },
    { category: 'clinical', title: 'Immunization for communicable diseases endemic to Canada', price: 'Insured', isInsured: true, orderIndex: 14 },
    { category: 'clinical', title: 'Excision removal of benign lesions without sutures', price: '$40', orderIndex: 15 },
    { category: 'clinical', title: 'Excision removal of benign lesions with sutures', price: '$110', orderIndex: 16 },

    // Work, Educational and Government Administrative Services
    { category: 'work_educational_government', title: 'Sick note from work or school or back to work note', price: '$25', orderIndex: 0 },
    { category: 'work_educational_government', title: 'Retirement home entrance form', price: '$45', orderIndex: 1 },
    { category: 'work_educational_government', title: 'CRA disability tax credit certificate', price: '$150', orderIndex: 2 },
    { category: 'work_educational_government', title: 'Children\'s Aid Society (CAS) application for prospective foster parent', price: '$70', description: 'Application on behalf of a child is considered an insured service', orderIndex: 3 },
    { category: 'work_educational_government', title: 'Medical report for Canada pension plan disability benefit', price: '$150', orderIndex: 4 },
    { category: 'work_educational_government', title: 'Copy/Transmission of Medical Records', price: 'Physician review $40, copy of first 20 pages: $35', description: '$0.25 per page thereafter', orderIndex: 5 },
    { category: 'work_educational_government', title: 'Admission to day-care, preschool, or university form', price: '$35', orderIndex: 6 },
    { category: 'work_educational_government', title: 'Jury duty letter of exemption', price: '$50', orderIndex: 7 },
    { category: 'work_educational_government', title: 'Immunization status form', price: '$75', description: 'Providing proof of an immunization is considered an insured service', orderIndex: 8 },
    { category: 'work_educational_government', title: 'Pre-employment certification of fitness/fitness clubs or hospital/nursing home employee', price: '$40', orderIndex: 9 },
    { category: 'work_educational_government', title: 'FAF or other forms required by employer', description: 'Not requested by WSIB', price: '$110/15 min', orderIndex: 10 },

    // Insurance Administrative Services
    { category: 'insurance_admin', title: 'Insurance requested attending physician\'s statement', price: '$160', orderIndex: 0 },
    { category: 'insurance_admin', title: 'Insurance requested travel cancellation insurance form', price: '$45', orderIndex: 1 },
    { category: 'insurance_admin', title: 'Medical certificate employment insurance sickness benefits', price: '$50', orderIndex: 2 },
    { category: 'insurance_admin', title: 'Insurance requested note for massage therapy, psychotherapy, physiotherapy, or orthotics', price: '$30 each', orderIndex: 3 },
    { category: 'insurance_admin', title: 'Insurance disability certificate OCF-3, 18 or 23', price: '$160', orderIndex: 4 },
    { category: 'insurance_admin', title: 'Full narrative report or any other letter/form', price: '$110/15 min', orderIndex: 5 },
    { category: 'insurance_admin', title: 'Insurance drug authorization form', price: '$40', orderIndex: 6 },
]

async function main() {
    console.log('Seeding uninsured services...')

    // Clear existing data
    await prisma.uninsuredService.deleteMany()

    // Insert all services
    for (const service of UNINSURED_SERVICES) {
        await prisma.uninsuredService.create({
            data: {
                category: service.category,
                title: service.title,
                description: service.description || null,
                price: service.price,
                isInsured: service.isInsured || false,
                orderIndex: service.orderIndex,
                published: true,
            },
        })
    }

    console.log(`Seeded ${UNINSURED_SERVICES.length} uninsured services`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
