/**
 * Database Seeding Script for Zenith Medical Centre
 * 
 * This script populates the database with initial data extracted from the existing codebase:
 * - Admin user for system access
 * - Team members from About page
 * - Blog posts from blog pages
 * - FAQ items from FAQ page
 * 
 * Usage: node scripts/seed-database.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Admin user data
const adminUser = {
  email: 'admin@zenithmedical.ca',
  password: 'Admin123!', // Change this in production!
  name: 'System Administrator',
  role: 'SUPER_ADMIN'
};

// Team members data (extracted from About page)
const teamMembers = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Chief Medical Officer & Family Physician",
    bio: "Board-certified family physician dedicated to comprehensive patient care with expertise in preventive medicine and chronic disease management.",
    email: "s.mitchell@zenithmedical.ca",
    phone: "(555) 123-4567",
    specialties: ["Family Medicine", "Preventive Care", "Women's Health"],
    orderIndex: 1,
    published: true
  },
  {
    name: "Dr. Michael Chen",
    title: "Family Physician",
    bio: "Experienced family doctor with special interest in chronic disease management and geriatric medicine, committed to patient-centered care.",
    email: "m.chen@zenithmedical.ca",
    phone: "(555) 123-4568",
    specialties: ["Family Medicine", "Chronic Care", "Geriatrics"],
    orderIndex: 2,
    published: true
  },
  {
    name: "Dr. Emily Rodriguez",
    title: "Family Physician",
    bio: "Compassionate physician specializing in family medicine with additional training in pediatric care and mental health support.",
    email: "e.rodriguez@zenithmedical.ca",
    phone: "(555) 123-4569",
    specialties: ["Family Medicine", "Pediatrics", "Mental Health"],
    orderIndex: 3,
    published: true
  },
  {
    name: "Jennifer Thompson",
    title: "Nurse Practitioner",
    bio: "Experienced nurse practitioner focused on primary care, health promotion, and patient education with a holistic approach to wellness.",
    email: "j.thompson@zenithmedical.ca",
    phone: "(555) 123-4570",
    specialties: ["Primary Care", "Health Promotion", "Patient Education"],
    orderIndex: 4,
    published: true
  }
];

// Blog posts data (extracted from blog pages)
const blogPosts = [
  {
    title: 'Understanding Annual Physical Exams: What to Expect',
    slug: 'understanding-annual-physical-exams',
    content: `# Understanding Annual Physical Exams: What to Expect

Annual physical exams are one of the most important investments you can make in your health. These comprehensive check-ups allow your healthcare provider to detect potential health issues early, update your medical history, and provide personalized health recommendations.

## What Happens During a Physical Exam?

### Medical History Review
Your doctor will review your current medications, discuss any new symptoms or health concerns, and update your family medical history. Be prepared to discuss:
- Changes in your health since your last visit
- New medications or supplements
- Family history updates
- Lifestyle changes (diet, exercise, stress levels)

### Vital Signs Assessment
Standard measurements include:
- **Blood pressure**: Checks for hypertension
- **Heart rate**: Assesses cardiovascular health
- **Temperature**: Screens for infections
- **Weight and BMI**: Monitors weight changes
- **Height**: Tracks growth (especially important for children)

### Physical Examination
Your doctor will perform a head-to-toe examination, checking:
- Eyes, ears, nose, and throat
- Heart and lung function
- Abdominal examination
- Skin inspection
- Lymph nodes
- Reflexes and basic neurological function

## The Importance of Preventive Care

Regular physical exams can help:
- **Detect diseases early**: Many conditions are more treatable when caught early
- **Update preventive care**: Ensure you're current on vaccinations and screenings
- **Monitor chronic conditions**: Track diabetes, hypertension, and other ongoing health issues
- **Build patient-doctor relationships**: Develop trust and open communication with your healthcare provider

---

*This article is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for personalized medical guidance.*`,
    excerpt: 'Annual physical exams are a cornerstone of preventive healthcare. Learn what tests and screenings are typically included and how to prepare for your visit.',
    featured: true,
    published: true,
    publishedAt: new Date('2024-01-15'),
    metaTitle: 'Annual Physical Exams: Complete Guide | Zenith Medical Centre',
    metaDescription: 'Learn what to expect during your annual physical exam, including tests, screenings, and how to prepare. Expert guidance from Zenith Medical Centre.'
  },
  {
    title: 'Managing Chronic Conditions: A Comprehensive Guide',
    slug: 'managing-chronic-conditions-effectively',
    content: `# Managing Chronic Conditions: A Comprehensive Guide

Living with a chronic condition can feel overwhelming, but with the right approach, you can maintain a high quality of life while effectively managing your health. This comprehensive guide provides practical strategies for managing common chronic conditions.

## Understanding Chronic Conditions

Chronic conditions are long-term health issues that typically:
- Last more than three months
- Cannot be cured but can be managed
- May worsen over time without proper care
- Require ongoing medical attention

Common chronic conditions include diabetes, hypertension, heart disease, arthritis, COPD, and chronic kidney disease.

## The Foundation of Chronic Care Management

### 1. Build a Strong Healthcare Team
- **Primary care physician**: Your main coordinator of care
- **Specialists**: Experts in your specific condition
- **Pharmacist**: Medication management support
- **Nutritionist**: Dietary guidance
- **Mental health counselor**: Emotional support

### 2. Develop a Comprehensive Care Plan
Work with your healthcare team to create a plan that includes:
- Treatment goals and target numbers (blood pressure, blood sugar, etc.)
- Medication schedules and instructions
- Lifestyle modifications
- Emergency action plans
- Regular monitoring schedules

## Long-Term Success Strategies

### Set Realistic Goals
- Break large goals into smaller, achievable steps
- Celebrate small victories
- Adjust goals as needed
- Focus on progress, not perfection

### Stay Informed
- Learn about your condition from reliable sources
- Ask questions during medical appointments
- Stay updated on new treatments
- Understand your test results and what they mean

---

*This article provides general information and should not replace individualized medical advice. Always consult with your healthcare providers for guidance specific to your condition and circumstances.*`,
    excerpt: 'Living with chronic conditions like diabetes, hypertension, or heart disease requires ongoing care and lifestyle management. Our guide provides practical tips for better health outcomes.',
    featured: true,
    published: true,
    publishedAt: new Date('2024-01-12'),
    metaTitle: 'Managing Chronic Conditions: Expert Medical Guide | Zenith Medical Centre',
    metaDescription: 'Comprehensive guide to managing chronic conditions like diabetes and hypertension. Expert tips for better health outcomes from our medical team.'
  },
  {
    title: 'Mental Health Awareness: Breaking the Stigma',
    slug: 'mental-health-awareness-breaking-stigma',
    content: `# Mental Health Awareness: Breaking the Stigma

Mental health affects every aspect of our lives—how we think, feel, and act. It influences how we handle stress, relate to others, and make decisions. Despite its importance, mental health is often misunderstood and stigmatized. It's time to change that conversation.

## Understanding Mental Health

Mental health exists on a continuum. Just as we have good and bad physical health days, our mental health fluctuates. Mental health conditions are real medical conditions that affect thoughts, feelings, and behaviors.

### Common Mental Health Conditions

**Depression**
- Persistent sadness or loss of interest
- Changes in appetite or sleep patterns
- Fatigue and difficulty concentrating
- Feelings of worthlessness or guilt

**Anxiety Disorders**
- Excessive worry or fear
- Panic attacks
- Avoidance of certain situations
- Physical symptoms like rapid heartbeat

## Breaking Down the Stigma

### Common Myths vs. Facts

**Myth**: Mental health problems are a sign of weakness.
**Fact**: Mental health conditions are medical conditions, often with biological causes.

**Myth**: People with mental health conditions are violent or dangerous.
**Fact**: People with mental health conditions are more likely to be victims of violence than perpetrators.

## Conclusion

Mental health is health. Period. By breaking down stigma, increasing awareness, and improving access to care, we can create a world where everyone feels comfortable seeking help for mental health concerns.

Remember: seeking help for mental health is a sign of strength, not weakness. If you're struggling, you're not alone, and help is available.

### Crisis Resources
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

---

*If you or someone you know is in crisis, please seek immediate help. This article is for educational purposes and should not replace professional mental health treatment.*`,
    excerpt: 'Mental health is just as important as physical health. Learn about common mental health conditions, available treatments, and how to seek help without stigma.',
    featured: false,
    published: true,
    publishedAt: new Date('2024-01-10'),
    metaTitle: 'Mental Health Awareness: Breaking Stigma | Zenith Medical Centre',
    metaDescription: 'Learn about mental health conditions, treatment options, and how to seek help without stigma. Professional guidance from Zenith Medical Centre.'
  },
  {
    title: 'Flu Season Preparation: Vaccination and Prevention Tips',
    slug: 'flu-season-preparation-vaccination-tips',
    content: `# Flu Season Preparation: Vaccination and Prevention Tips

Protect yourself and your family this flu season with proper preparation, vaccination, and prevention strategies.

## Understanding Influenza

Influenza, commonly called the flu, is a contagious respiratory illness caused by influenza viruses. It can cause mild to severe illness and can lead to hospitalization and even death.

## The Importance of Flu Vaccination

Annual flu vaccination is the most effective way to prevent influenza. The vaccine:
- Reduces your risk of getting the flu by 40-60% when the vaccine is well-matched to circulating viruses
- Can reduce the severity and duration of illness if you do get sick
- Helps protect others in your community, especially those who cannot be vaccinated

## Prevention Strategies

### Basic Hygiene
- Wash hands frequently with soap and water for at least 20 seconds
- Use alcohol-based hand sanitizer when soap is not available
- Avoid touching your face, especially eyes, nose, and mouth
- Cover coughs and sneezes with your elbow or tissue

### Lifestyle Factors
- Get adequate sleep (7-9 hours for adults)
- Eat a balanced diet rich in fruits and vegetables
- Exercise regularly to boost immune function
- Manage stress levels
- Stay hydrated

## When to Seek Medical Care

Contact your healthcare provider if you experience:
- High fever (above 101°F/38.3°C)
- Difficulty breathing or shortness of breath
- Persistent chest pain or pressure
- Severe or persistent vomiting
- Signs of dehydration
- Symptoms that improve but then return with fever and worse cough

---

*This article is for informational purposes only. Consult your healthcare provider for personalized medical advice.*`,
    excerpt: 'Protect yourself and your family this flu season. Learn about flu vaccines, prevention strategies, and when to seek medical care for flu symptoms.',
    featured: false,
    published: true,
    publishedAt: new Date('2024-01-08'),
    metaTitle: 'Flu Season Prevention & Vaccination Guide | Zenith Medical Centre',
    metaDescription: 'Complete guide to flu season preparation including vaccination, prevention tips, and when to seek medical care from our medical experts.'
  },
  {
    title: "Women's Health: Essential Screenings by Age",
    slug: 'womens-health-essential-screenings',
    content: `# Women's Health: Essential Screenings by Age

Stay on top of your health with age-appropriate screenings and preventive care designed specifically for women's health needs.

## Screening Guidelines by Age Group

### Ages 20-30
- Annual pelvic exams and Pap tests
- Breast self-exams and clinical breast exams
- Blood pressure screening
- Cholesterol screening
- STI screening as appropriate
- Mental health screening

### Ages 30-40
- Continue previous screenings
- HPV testing with Pap tests (every 3-5 years if normal)
- Skin cancer screening
- Thyroid function testing
- Bone density discussion with healthcare provider

### Ages 40-50
- Annual mammograms
- Continue pelvic exams and Pap tests
- Blood pressure and cholesterol monitoring
- Diabetes screening
- Colon cancer screening discussion

### Ages 50+
- Continue mammograms
- Colonoscopy screening
- Bone density testing
- Heart disease risk assessment
- Regular eye exams

## Taking Charge of Your Health

### Prepare for Appointments
- Keep a health journal
- Track menstrual cycles
- Note family history changes
- Prepare questions for your healthcare provider

### Know Your Risk Factors
- Family history of cancer or heart disease
- Personal history of reproductive health issues
- Lifestyle factors (smoking, alcohol use)
- Environmental exposures

---

*Screening recommendations may vary based on individual risk factors. Consult with your healthcare provider for personalized recommendations.*`,
    excerpt: 'Stay on top of your health with age-appropriate screenings. From mammograms to pap smears, learn what tests women need at different life stages.',
    featured: false,
    published: true,
    publishedAt: new Date('2024-01-05'),
    metaTitle: "Women's Health Screenings by Age | Zenith Medical Centre",
    metaDescription: "Essential women's health screenings by age group. Learn about mammograms, Pap tests, and other important preventive care for women."
  }
];

// FAQ items data (extracted from FAQ page)
const faqItems = [
  // Appointments & Scheduling
  {
    question: 'How do I schedule an appointment?',
    answer: 'You can schedule an appointment by calling our office at (555) 123-CARE, using our online contact form, or completing the patient intake form. We offer both routine appointments and same-day appointments for urgent care needs.',
    category: 'Appointments & Scheduling',
    orderIndex: 1,
    published: true
  },
  {
    question: 'What should I bring to my first appointment?',
    answer: 'Please bring a valid photo ID, your health insurance card, a list of current medications, any relevant medical records or test results, and completed patient intake forms. If you have specific health concerns, prepare a list of symptoms and questions.',
    category: 'Appointments & Scheduling',
    orderIndex: 2,
    published: true
  },
  {
    question: 'How far in advance should I book an appointment?',
    answer: 'For routine check-ups, we recommend booking 2-4 weeks in advance. For urgent care needs, we reserve same-day appointments. Annual physicals and specialized consultations may require longer lead times during busy periods.',
    category: 'Appointments & Scheduling',
    orderIndex: 3,
    published: true
  },
  {
    question: 'Do you offer same-day appointments?',
    answer: 'Yes, we reserve time slots daily for urgent medical needs that cannot wait for a regular appointment. Call us early in the day for the best availability. Same-day appointments are available for acute illnesses, minor injuries, and urgent health concerns.',
    category: 'Appointments & Scheduling',
    orderIndex: 4,
    published: true
  },

  // Insurance & Billing
  {
    question: 'What insurance plans do you accept?',
    answer: 'We accept most major insurance plans including provincial health insurance (OHIP, MSP, etc.), extended health insurance plans, workers\' compensation claims, and third-party insurance. Please call to verify your specific plan coverage.',
    category: 'Insurance & Billing',
    orderIndex: 5,
    published: true
  },
  {
    question: 'What if I don\'t have insurance?',
    answer: 'We offer flexible payment options for uninsured patients, including payment plans and competitive self-pay rates. Please speak with our billing department to discuss your options and find a solution that works for your budget.',
    category: 'Insurance & Billing',
    orderIndex: 6,
    published: true
  },
  {
    question: 'Do you offer direct billing?',
    answer: 'Yes, we offer direct billing for most extended health insurance plans. This means you may only need to pay your co-payment or deductible at the time of service. We handle the insurance claim process for you.',
    category: 'Insurance & Billing',
    orderIndex: 7,
    published: true
  },

  // Services & Treatments
  {
    question: 'What services do you provide?',
    answer: 'We offer comprehensive family medicine including routine check-ups, preventive care, chronic disease management, women\'s health, pediatric care, geriatric care, mental health support, minor procedures, laboratory testing, and more. Visit our Services page for a complete list.',
    category: 'Services & Treatments',
    orderIndex: 8,
    published: true
  },
  {
    question: 'Do you provide emergency care?',
    answer: 'While we are not an emergency room, we offer same-day appointments for urgent care needs. For life-threatening emergencies, please call 911 or go to your nearest emergency room immediately. We can provide follow-up care after emergency treatment.',
    category: 'Services & Treatments',
    orderIndex: 9,
    published: true
  },
  {
    question: 'Do you see patients of all ages?',
    answer: 'Yes, we provide comprehensive family medicine for patients of all ages, from newborns to seniors. Our physicians are trained in pediatric care, adult medicine, and geriatric care to serve your entire family\'s healthcare needs.',
    category: 'Services & Treatments',
    orderIndex: 10,
    published: true
  },
  {
    question: 'Can you provide referrals to specialists?',
    answer: 'Absolutely. When specialized care is needed, we provide referrals to trusted specialists in our network. We coordinate your care and ensure that specialist recommendations are integrated into your overall treatment plan.',
    category: 'Services & Treatments',
    orderIndex: 11,
    published: true
  },

  // Patient Information
  {
    question: 'How do I access my medical records?',
    answer: 'You can request copies of your medical records by contacting our office. We maintain secure electronic health records and can provide records in digital or paper format. Some records may be available through our patient portal system.',
    category: 'Patient Information',
    orderIndex: 12,
    published: true
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We request at least 24 hours notice for appointment cancellations to allow other patients to schedule. Late cancellations or no-shows may result in a cancellation fee. We understand emergencies happen and handle each situation individually.',
    category: 'Patient Information',
    orderIndex: 13,
    published: true
  },
  {
    question: 'Are my medical records kept confidential?',
    answer: 'Yes, we maintain strict confidentiality and comply with all HIPAA and PIPEDA privacy regulations. Your medical information is secured with encryption and access is limited to authorized healthcare professionals involved in your care.',
    category: 'Patient Information',
    orderIndex: 14,
    published: true
  },
  {
    question: 'Can family members access my information?',
    answer: 'Medical information can only be shared with family members if you provide written consent or in specific emergency situations. We take patient privacy seriously and follow all applicable privacy laws and regulations.',
    category: 'Patient Information',
    orderIndex: 15,
    published: true
  },

  // COVID & Safety
  {
    question: 'What COVID-19 safety measures do you have in place?',
    answer: 'We follow all current health guidelines including enhanced cleaning protocols, proper ventilation, staff vaccination requirements, and symptom screening. Masks may be required during certain periods. Please check our current policies when scheduling.',
    category: 'COVID & Safety',
    orderIndex: 16,
    published: true
  },
  {
    question: 'Do you offer telehealth appointments?',
    answer: 'Yes, we offer telehealth consultations for appropriate medical concerns including follow-up visits, medication reviews, and non-emergency consultations. Please ask when scheduling if your appointment can be conducted virtually.',
    category: 'COVID & Safety',
    orderIndex: 17,
    published: true
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { email: adminUser.email },
      update: {},
      create: {
        email: adminUser.email,
        passwordHash: hashedPassword,
        name: adminUser.name,
        role: adminUser.role
      }
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create team members
    console.log('👥 Creating team members...');
    for (const member of teamMembers) {
      const existingMember = await prisma.teamMember.findFirst({
        where: { name: member.name }
      });
      
      let teamMember;
      if (existingMember) {
        teamMember = await prisma.teamMember.update({
          where: { id: existingMember.id },
          data: member
        });
        console.log(`✅ Team member updated: ${teamMember.name}`);
      } else {
        teamMember = await prisma.teamMember.create({
          data: member
        });
        console.log(`✅ Team member created: ${teamMember.name}`);
      }
    }

    // Create blog posts
    console.log('📝 Creating blog posts...');
    for (const post of blogPosts) {
      const blogPost = await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          ...post,
          createdBy: admin.id
        },
        create: {
          ...post,
          createdBy: admin.id
        }
      });
      console.log(`✅ Blog post created: ${blogPost.title}`);
    }

    // Create FAQ items
    console.log('❓ Creating FAQ items...');
    for (const faq of faqItems) {
      const existingFAQ = await prisma.fAQ.findFirst({
        where: { question: faq.question }
      });
      
      let faqItem;
      if (existingFAQ) {
        faqItem = await prisma.fAQ.update({
          where: { id: existingFAQ.id },
          data: faq
        });
        console.log(`✅ FAQ updated: ${faqItem.question.substring(0, 50)}...`);
      } else {
        faqItem = await prisma.fAQ.create({
          data: faq
        });
        console.log(`✅ FAQ created: ${faqItem.question.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Admin users: 1`);
    console.log(`👥 Team members: ${teamMembers.length}`);
    console.log(`📝 Blog posts: ${blogPosts.length}`);
    console.log(`❓ FAQ items: ${faqItems.length}`);
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 