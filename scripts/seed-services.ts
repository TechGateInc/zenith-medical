import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const services = [
    {
      title: 'Family Medicine',
      description: 'Comprehensive primary healthcare for patients of all ages, from newborns to seniors.',
      features: [
        'Annual physical exams and wellness checks',
        'Acute illness diagnosis and treatment',
        'Chronic disease management',
        'Health screenings and preventive care',
        'Health education and lifestyle counseling',
      ],
      icon: `<svg class=\"h-8 w-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z\" /></svg>`,
      orderIndex: 0,
      published: true,
    },
    {
      title: 'Preventive Care',
      description: 'Proactive healthcare services to prevent illness and maintain optimal health.',
      features: [
        'Regular health screenings and checkups',
        'Cancer screening (mammograms, colonoscopies, Pap tests)',
        'Cardiovascular risk assessment',
        'Diabetes screening and monitoring',
        'Osteoporosis screening',
      ],
      icon: `<svg class=\"h-8 w-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" /></svg>`,
      orderIndex: 1,
      published: true,
    },
    {
      title: 'Chronic Disease Management',
      description: 'Ongoing care and support for patients with chronic health conditions.',
      features: [
        'Diabetes management and monitoring',
        'Hypertension treatment and control',
        'Heart disease management',
        'Arthritis and joint pain treatment',
        'COPD and asthma management',
      ],
      icon: `<svg class=\"h-8 w-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z\" /></svg>`,
      orderIndex: 2,
      published: true,
    },
    {
      title: 'Acute Illness Care',
      description: 'Immediate treatment for sudden illnesses, infections, and urgent health concerns.',
      features: [
        'Sudden illness diagnosis and treatment',
        'Infection management',
        'Urgent health concern care',
        'Symptom relief and management',
        'Follow-up care coordination',
        'Emergency care referrals when needed',
      ],
      icon: `<svg class=\"h-8 w-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z\" /></svg>`,
      orderIndex: 3,
      published: true,
    },
  ]

  for (const [i, service] of services.entries()) {
    const existing = await prisma.service.findFirst({ where: { title: service.title } })
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { ...service, orderIndex: i } })
    } else {
      await prisma.service.create({ data: { ...service, orderIndex: i } })
    }
  }
  console.log('Seeded services!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect()) 