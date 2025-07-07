import { use } from 'react'
import { notFound } from 'next/navigation'
import Layout from '../../../components/Layout/Layout'
import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, generateBlogStructuredData, KEYWORDS } from '../../../lib/utils/seo'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorTitle: string
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  image: string
}

// Sample blog posts data - in a real app, this would come from a CMS or database
const blogPosts: BlogPost[] = [
  {
    slug: 'understanding-annual-physical-exams',
    title: 'Understanding Annual Physical Exams: What to Expect',
    excerpt: 'Annual physical exams are a cornerstone of preventive healthcare. Learn what tests and screenings are typically included and how to prepare for your visit.',
    content: `
# Understanding Annual Physical Exams: What to Expect

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

## Age-Specific Screenings

### Adults 18-39
- Blood pressure check
- Cholesterol screening (every 5 years)
- Diabetes screening (every 3 years if risk factors present)
- Depression screening
- Immunization updates

### Adults 40-64
- All above screenings, plus:
- Mammogram (women, starting at 40-50 depending on risk)
- Colonoscopy (starting at 45-50)
- Prostate screening discussion (men, starting at 50)
- Bone density screening (women, starting at 65 or earlier if risk factors)

### Adults 65+
- All above screenings, plus:
- Annual influenza vaccination
- Pneumonia vaccination
- Fall risk assessment
- Cognitive screening
- Vision and hearing tests

## Laboratory Tests

Common blood tests may include:
- **Complete Blood Count (CBC)**: Checks for anemia, infections, and blood disorders
- **Comprehensive Metabolic Panel**: Evaluates kidney function, liver function, and blood sugar
- **Lipid Panel**: Measures cholesterol levels
- **Thyroid Function**: Assesses thyroid hormone levels
- **Vitamin D**: Checks for deficiency

## How to Prepare for Your Physical

### Before Your Appointment
1. **Gather medical records**: Bring recent test results, medication lists, and specialist reports
2. **Prepare questions**: Write down health concerns or symptoms you want to discuss
3. **Fast if required**: Some blood tests require 8-12 hours of fasting
4. **Wear comfortable clothing**: Easy to remove for examination
5. **Bring insurance cards**: Ensure coverage verification

### Questions to Ask Your Doctor
- Are my vital signs normal for my age?
- Based on my family history, what should I watch for?
- Are there any lifestyle changes I should consider?
- When should I schedule my next appointment?
- Do I need any additional screenings?

## The Importance of Preventive Care

Regular physical exams can help:
- **Detect diseases early**: Many conditions are more treatable when caught early
- **Update preventive care**: Ensure you're current on vaccinations and screenings
- **Monitor chronic conditions**: Track diabetes, hypertension, and other ongoing health issues
- **Build patient-doctor relationships**: Develop trust and open communication with your healthcare provider

## What to Do After Your Exam

1. **Review results**: Understand what your test results mean
2. **Follow recommendations**: Complete any additional screenings or referrals
3. **Schedule follow-ups**: Book your next annual exam
4. **Implement lifestyle changes**: Act on your doctor's health advice
5. **Keep records**: Maintain copies of your test results and recommendations

## When to Schedule Additional Appointments

Don't wait for your annual exam if you experience:
- Persistent or severe symptoms
- Sudden changes in health
- Medication side effects
- Concerns about new symptoms
- Follow-up needs for chronic conditions

## Conclusion

Annual physical exams are an essential part of maintaining good health throughout your life. They provide an opportunity to catch potential problems early, update your preventive care, and develop a strong relationship with your healthcare provider. 

Remember, the goal isn't just to treat illness—it's to help you maintain optimal health and prevent disease whenever possible. Make your annual physical a priority, and don't hesitate to schedule additional appointments when health concerns arise.

---

*This article is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for personalized medical guidance.*
    `,
    author: 'Dr. Sarah Mitchell',
    authorTitle: 'Chief Medical Officer',
    publishDate: '2024-01-15',
    readTime: '5 min read',
    category: 'preventive-care',
    tags: ['physical exam', 'preventive care', 'health screening'],
    image: '/images/blog/annual-physical.jpg'
  },
  {
    slug: 'managing-chronic-conditions-effectively',
    title: 'Managing Chronic Conditions: A Comprehensive Guide',
    excerpt: 'Living with chronic conditions like diabetes, hypertension, or heart disease requires ongoing care and lifestyle management. Our guide provides practical tips for better health outcomes.',
    content: `
# Managing Chronic Conditions: A Comprehensive Guide

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

## Medication Management

### Organization Systems
- Use pill organizers for daily medications
- Set phone alarms for medication reminders
- Keep an updated medication list
- Understand what each medication does
- Know potential side effects

### Communication with Your Pharmacy
- Use one pharmacy for all medications
- Ask about drug interactions
- Understand generic vs. brand options
- Inquire about cost-saving programs
- Set up automatic refills when appropriate

## Lifestyle Modifications

### Diet and Nutrition
**General Principles:**
- Focus on whole, unprocessed foods
- Control portion sizes
- Limit sodium, added sugars, and unhealthy fats
- Stay hydrated
- Plan meals in advance

**Condition-Specific Guidelines:**
- **Diabetes**: Monitor carbohydrate intake, focus on low glycemic foods
- **Hypertension**: Reduce sodium, increase potassium-rich foods
- **Heart Disease**: Limit saturated fats, increase omega-3 fatty acids
- **Kidney Disease**: Monitor protein, phosphorus, and potassium intake

### Exercise and Physical Activity
**Benefits:**
- Improves cardiovascular health
- Helps control blood sugar and weight
- Reduces inflammation
- Enhances mood and energy
- Strengthens bones and muscles

**Getting Started:**
- Consult your doctor before beginning any exercise program
- Start slowly and gradually increase intensity
- Choose activities you enjoy
- Aim for at least 150 minutes of moderate activity per week
- Include strength training exercises

### Stress Management
Chronic stress can worsen many conditions. Try:
- Deep breathing exercises
- Meditation or mindfulness practices
- Regular physical activity
- Adequate sleep (7-9 hours per night)
- Social connections and support groups
- Professional counseling when needed

## Monitoring and Tracking

### Self-Monitoring Tools
- **Blood pressure monitors**: For hypertension management
- **Blood glucose meters**: For diabetes care
- **Peak flow meters**: For asthma management
- **Weight scales**: For heart failure and general health
- **Symptom diaries**: Track patterns and triggers

### Technology Solutions
- Health apps for tracking symptoms and medications
- Wearable devices for activity monitoring
- Telemedicine for regular check-ins
- Online patient portals for accessing test results
- Medication reminder apps

## Building Your Support Network

### Family and Friends
- Educate loved ones about your condition
- Ask for help when needed
- Include them in appointment discussions when appropriate
- Create emergency contact lists

### Support Groups
- Connect with others who have similar conditions
- Share experiences and coping strategies
- Learn about new treatments and resources
- Find both in-person and online communities

### Professional Resources
- Social workers for assistance with healthcare navigation
- Certified diabetes educators for diabetes management
- Cardiac rehabilitation programs for heart conditions
- Pulmonary rehabilitation for lung conditions

## Emergency Preparedness

### Create an Emergency Plan
- Know warning signs that require immediate attention
- Have emergency contact information readily available
- Keep emergency medications accessible
- Maintain current medication and allergy lists
- Plan for medication needs during emergencies

### Warning Signs to Watch For
**General Red Flags:**
- Severe or sudden worsening of symptoms
- Difficulty breathing or shortness of breath
- Chest pain or pressure
- Severe dizziness or fainting
- High fever
- Severe dehydration

**Condition-Specific Emergencies:**
- **Diabetes**: Severe high or low blood sugar
- **Heart Disease**: Chest pain, severe shortness of breath
- **Hypertension**: Severe headache, vision changes, chest pain

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

### Maintain Regular Healthcare
- Keep all scheduled appointments
- Get recommended screenings and tests
- Update vaccinations
- Have annual comprehensive exams
- Don't skip appointments even when feeling well

## Conclusion

Managing a chronic condition is a lifelong journey that requires patience, dedication, and the right support system. By working closely with your healthcare team, making healthy lifestyle choices, and staying informed about your condition, you can live a full and active life.

Remember, everyone's journey is different. What works for one person may not work for another. Be patient with yourself as you find the strategies that work best for your unique situation.

---

*This article provides general information and should not replace individualized medical advice. Always consult with your healthcare providers for guidance specific to your condition and circumstances.*
    `,
    author: 'Dr. Michael Chen',
    authorTitle: 'Family Physician',
    publishDate: '2024-01-12',
    readTime: '7 min read',
    category: 'chronic-care',
    tags: ['diabetes', 'hypertension', 'chronic disease', 'lifestyle'],
    image: '/images/blog/chronic-conditions.jpg'
  },
  {
    slug: 'mental-health-awareness-breaking-stigma',
    title: 'Mental Health Awareness: Breaking the Stigma',
    excerpt: 'Mental health is just as important as physical health. Learn about common mental health conditions, available treatments, and how to seek help without stigma.',
    content: `
# Mental Health Awareness: Breaking the Stigma

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

**Bipolar Disorder**
- Extreme mood swings
- Periods of elevated mood (mania) and depression
- Changes in energy and activity levels

**Post-Traumatic Stress Disorder (PTSD)**
- Flashbacks or nightmares
- Avoidance of trauma reminders
- Hypervigilance
- Emotional numbness

## Breaking Down the Stigma

### Common Myths vs. Facts

**Myth**: Mental health problems are a sign of weakness.
**Fact**: Mental health conditions are medical conditions, often with biological causes.

**Myth**: People with mental health conditions are violent or dangerous.
**Fact**: People with mental health conditions are more likely to be victims of violence than perpetrators.

**Myth**: Mental health problems are rare.
**Fact**: 1 in 5 adults experience mental health issues in any given year.

**Myth**: Children don't experience mental health problems.
**Fact**: Mental health conditions can affect people of all ages, including children.

### Why Stigma Persists
- Lack of education and awareness
- Media misrepresentation
- Fear of the unknown
- Historical misconceptions
- Cultural and societal factors

## Recognizing the Signs

### In Yourself
- Persistent sadness or anxiety
- Extreme mood changes
- Withdrawal from friends and activities
- Significant changes in eating or sleeping habits
- Difficulty concentrating
- Substance abuse
- Thoughts of self-harm

### In Others
- Noticeable personality changes
- Decreased performance at work or school
- Neglecting personal hygiene
- Expressing hopelessness
- Talking about death or suicide
- Giving away possessions

## Treatment Options

### Professional Help
**Therapy/Counseling**
- Cognitive Behavioral Therapy (CBT)
- Dialectical Behavior Therapy (DBT)
- Interpersonal therapy
- Group therapy
- Family therapy

**Medication**
- Antidepressants
- Anti-anxiety medications
- Mood stabilizers
- Antipsychotics
- Sleep aids (when appropriate)

**Other Treatments**
- Electroconvulsive therapy (ECT) for severe cases
- Transcranial magnetic stimulation (TMS)
- Light therapy for seasonal depression
- Hospitalization for crisis situations

### Self-Care Strategies
**Physical Wellness**
- Regular exercise
- Adequate sleep (7-9 hours)
- Healthy nutrition
- Limiting alcohol and avoiding drugs
- Medical check-ups

**Emotional Wellness**
- Mindfulness and meditation
- Journaling
- Creative activities
- Spending time in nature
- Practicing gratitude

**Social Wellness**
- Maintaining relationships
- Joining support groups
- Volunteering
- Setting boundaries
- Seeking social support

## How to Seek Help

### Starting the Conversation
**With Healthcare Providers**
- Be honest about your symptoms
- Share your concerns without minimizing them
- Ask questions about treatment options
- Discuss any medication concerns
- Request referrals when needed

**With Family and Friends**
- Choose trusted individuals
- Pick the right time and place
- Be specific about what you need
- Share educational resources
- Set boundaries about what you're comfortable discussing

### Finding Resources
**Healthcare Providers**
- Primary care physicians
- Psychiatrists
- Psychologists
- Licensed clinical social workers
- Psychiatric nurse practitioners

**Crisis Resources**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Local emergency services: 911
- Hospital emergency departments
- Mobile crisis teams

**Online and Community Resources**
- Mental Health America
- National Alliance on Mental Illness (NAMI)
- Anxiety and Depression Association of America
- Local community mental health centers
- Employee assistance programs

## Supporting Others

### What to Do
- Listen without judgment
- Offer specific help
- Learn about their condition
- Encourage professional help
- Check in regularly
- Respect their privacy
- Take care of yourself

### What Not to Do
- Don't minimize their feelings
- Don't offer simple solutions
- Don't compare their situation to others
- Don't take their behavior personally
- Don't pressure them to "get over it"
- Don't share their information without permission

## Creating Mental Health-Friendly Environments

### At Home
- Open communication
- Regular family check-ins
- Stress management practices
- Healthy routines
- Professional support when needed

### At Work
- Mental health awareness training
- Employee assistance programs
- Flexible work arrangements
- Stress reduction initiatives
- Anti-stigma policies

### In Communities
- Mental health education
- Support group formation
- Crisis intervention training
- Advocacy for better services
- Fundraising for mental health organizations

## The Path Forward

### Personal Actions
- Educate yourself about mental health
- Challenge stigmatizing comments
- Share your own experiences (if comfortable)
- Support mental health initiatives
- Practice self-care

### Societal Changes
- Improve access to mental health services
- Integrate mental health into primary care
- Increase funding for mental health research
- Reform insurance coverage
- Enhance crisis intervention services

## Conclusion

Mental health is health. Period. By breaking down stigma, increasing awareness, and improving access to care, we can create a world where everyone feels comfortable seeking help for mental health concerns.

Remember: seeking help for mental health is a sign of strength, not weakness. If you're struggling, you're not alone, and help is available. Take the first step—your mental health matters.

### Crisis Resources
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

---

*If you or someone you know is in crisis, please seek immediate help. This article is for educational purposes and should not replace professional mental health treatment.*
    `,
    author: 'Dr. Emily Rodriguez',
    authorTitle: 'Family Physician',
    publishDate: '2024-01-10',
    readTime: '6 min read',
    category: 'mental-health',
    tags: ['mental health', 'depression', 'anxiety', 'stigma'],
    image: '/images/blog/mental-health.jpg'
  }
  // Add more blog posts as needed for other slugs...
]

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    return generateSEOMetadata({
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
      keywords: [...KEYWORDS.medical],
      canonical: `/blog/${slug}`,
    })
  }

  const categoryKeywords = post.category === 'preventive-care' ? KEYWORDS.preventive
    : post.category === 'chronic-care' ? KEYWORDS.chronic
    : post.category === 'mental-health' ? KEYWORDS.mental
    : post.category === 'womens-health' ? KEYWORDS.womens
    : post.category === 'pediatrics' ? KEYWORDS.pediatric
    : post.category === 'senior-care' ? KEYWORDS.senior
    : KEYWORDS.medical

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
    keywords: [...KEYWORDS.medical, ...categoryKeywords, ...post.tags],
    canonical: `/blog/${post.slug}`,
    ogType: 'article',
    publishedTime: post.publishDate,
    author: post.author,
    section: 'Health & Wellness',
    tags: post.tags,
  })
}

export default function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'preventive-care': 'bg-green-100 text-green-800',
      'chronic-care': 'bg-blue-100 text-blue-800',
      'mental-health': 'bg-purple-100 text-purple-800',
      'womens-health': 'bg-pink-100 text-pink-800',
      'pediatrics': 'bg-yellow-100 text-yellow-800',
      'senior-care': 'bg-indigo-100 text-indigo-800',
      'nutrition': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const otherPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3)

  // Generate structured data for the blog post
  const blogStructuredData = generateBlogStructuredData(post)

  return (
    <Layout>
      {/* Blog Post Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      {/* Article Header */}
      <article className="bg-white">
        <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <Link href="/blog" className="text-blue-200 hover:text-white transition-colors">
                  ← Back to Health Blog
                </Link>
              </nav>

              {/* Category Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category).replace('text-', 'text-white bg-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                  {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="font-medium text-white">{post.author}</span>
                    <p className="text-sm">{post.authorTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(post.publishDate)}</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image Placeholder */}
            <div className="mb-8 h-64 md:h-96 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center">
              <svg className="h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <div className="text-slate-700 leading-relaxed">
                {post.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return null
                  
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-slate-800 mt-8 mb-4">{paragraph.replace('# ', '')}</h1>
                  }
                  
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-3">{paragraph.replace('## ', '')}</h2>
                  }
                  
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-slate-800 mt-4 mb-2">{paragraph.replace('### ', '')}</h3>
                  }
                  
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h4 key={index} className="text-lg font-semibold text-slate-800 mt-3 mb-2">{paragraph.replace(/\*\*/g, '')}</h4>
                  }
                  
                  if (paragraph.startsWith('- ')) {
                    return <li key={index} className="ml-4 mb-1">{paragraph.replace('- ', '')}</li>
                  }
                  
                  if (paragraph.startsWith('*') && paragraph.endsWith('*') && paragraph.includes('This article')) {
                    return <p key={index} className="text-sm text-slate-500 italic mt-8 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-300">{paragraph.replace(/\*/g, '')}</p>
                  }
                  
                  if (paragraph.startsWith('---')) {
                    return <hr key={index} className="my-8 border-slate-300" />
                  }
                  
                  return <p key={index} className="mb-4">{paragraph}</p>
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">{post.author}</h4>
                  <p className="text-blue-600 mb-2">{post.authorTitle}</p>
                  <p className="text-slate-600 text-sm">
                    {post.author} is a dedicated healthcare professional at Zenith Medical Centre, 
                    committed to providing compassionate, evidence-based care to patients and families. 
                    With years of experience in family medicine, they focus on preventive care and 
                    patient education to help individuals achieve their best health.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-slate-500">
                      <span>{relatedPost.author}</span>
                      <span className="mx-1">•</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions About Your Health?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our healthcare professionals are here to provide personalized medical advice and care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/blog"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Read More Articles
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
} 