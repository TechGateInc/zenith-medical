import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  healthInformationNumber: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  appointmentType: z.string().optional()
})

const ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL || 'admin@zenithmedical.ca'

function buildUserEmail({ name }: { name: string }) {
  return {
    subject: 'Thank you for contacting Zenith Medical Centre',
    html: `<p>Dear ${name},</p><p>Thank you for reaching out to Zenith Medical Centre. We have received your message and will get back to you as soon as possible.</p><p>Best regards,<br/>Zenith Medical Centre Team</p>`,
    text: `Dear ${name},\n\nThank you for reaching out to Zenith Medical Centre. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nZenith Medical Centre Team`
  }
}

function buildAdminEmail(data: any) {
  return {
    subject: `New Contact Form Submission from ${data.name}`,
    html: `<h2>New Contact Form Submission</h2>
      <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Phone:</strong> ${data.phone || 'N/A'}</li>
        <li><strong>Health Information Number:</strong> ${data.healthInformationNumber || 'N/A'}</li>
        <li><strong>Appointment Type:</strong> ${data.appointmentType || 'N/A'}</li>
        <li><strong>Subject:</strong> ${data.subject}</li>
        <li><strong>Message:</strong> ${data.message}</li>
      </ul>`,
    text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nHealth Information Number: ${data.healthInformationNumber || 'N/A'}\nAppointment Type: ${data.appointmentType || 'N/A'}\nSubject: ${data.subject}\nMessage: ${data.message}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Dynamically import resend
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.RESEND_FROM_NAME || 'Zenith Medical Centre'

    // Send confirmation to user
    const userEmail = buildUserEmail(data)
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [data.email],
      subject: userEmail.subject,
      html: userEmail.html,
      text: userEmail.text
    })

    // Send notification to admin
    const adminEmail = buildAdminEmail(data)
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [ADMIN_EMAIL],
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid form data', details: error.errors }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
  }
} 