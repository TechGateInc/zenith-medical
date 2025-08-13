import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptPHI } from '@/lib/utils/encryption'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { settingsManager } from '@/lib/utils/settings'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, responseMessage } = body

    if (!submissionId || !responseMessage) {
      return NextResponse.json({ error: 'Submission ID and response message are required' }, { status: 400 })
    }

    // Get the submission with decrypted data
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: submissionId }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Decrypt the customer's email
    const customerEmail = decryptPHI(submission.email)
    const customerName = decryptPHI(submission.name)

    // Get contact information from database
    const settings = await settingsManager.getSettings()
    const adminEmail = settings.adminEmail
    const primaryPhone = settings.primaryPhone
    const businessHours = settings.businessHours

    // Dynamically import resend
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.RESEND_FROM_NAME || 'Zenith Medical Centre'

    // Build the response email with proper threading
    const originalSubject = decryptPHI(submission.subject)
    const emailSubject = originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`
    
    // Use the stored original Message-ID for proper threading
    const originalMessageId = submission.originalMessageId
    if (!originalMessageId) {
      return NextResponse.json({ error: 'Original Message-ID not found' }, { status: 400 })
    }
    const replyMessageId = `<reply-${submission.id}-${Date.now()}@zenithmedical.ca>`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response from Zenith Medical Centre</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 12px 12px 0 0;
            text-align: center;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .response {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .contact-info {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Zenith Medical Centre</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Response to Your Inquiry</p>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>Thank you for contacting Zenith Medical Centre. We have received your inquiry and are pleased to provide you with a response.</p>
          
          <div class="response">
            <h3 style="margin-top: 0; color: #2563eb;">Our Response:</h3>
            <p style="white-space: pre-wrap;">${responseMessage}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
            <p style="margin: 0;"><strong>Original Message:</strong></p>
            <div style="background: #f8f9fa; border-left: 3px solid #dee2e6; padding: 10px; margin: 10px 0; font-style: italic;">
              <p style="margin: 0 0 5px 0;"><strong>From:</strong> ${customerName} &lt;${customerEmail}&gt;</p>
              <p style="margin: 0 0 5px 0;"><strong>Subject:</strong> ${originalSubject}</p>
              <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
              <p style="margin: 10px 0 0 0; border-top: 1px solid #dee2e6; padding-top: 10px;">${decryptPHI(submission.message)}</p>
            </div>
          </div>
          
          <p>If you have any further questions or need additional assistance, please don't hesitate to reach out to us.</p>
          
          <div class="contact-info">
            <h4 style="margin-top: 0;">Contact Information:</h4>
            <p><strong>Phone:</strong> <a href="tel:${primaryPhone.replace(/\s/g, '')}">${primaryPhone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${adminEmail}">${adminEmail}</a></p>
            <p><strong>Business Hours:</strong> ${businessHours}</p>
            <p><strong>Address:</strong> Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3</p>
          </div>
          
          <div class="footer">
            <p>This is an automated response from Zenith Medical Centre. Please do not reply to this email.</p>
            <p>For urgent matters, please call us directly at <a href="tel:${primaryPhone.replace(/\s/g, '')}">${primaryPhone}</a>.</p>
            <p>&copy; ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailText = `
      Zenith Medical Centre - Response to Your Inquiry
      
      Dear ${customerName},
      
      Thank you for contacting Zenith Medical Centre. We have received your inquiry and are pleased to provide you with a response.
      
      Our Response:
      ${responseMessage}
      
      Original Message:
      From: ${customerName} <${customerEmail}>
      Subject: ${originalSubject}
      Date: ${new Date(submission.createdAt).toLocaleString()}
      
      ${decryptPHI(submission.message)}
      
      If you have any further questions or need additional assistance, please don't hesitate to reach out to us.
      
      Contact Information:
      Phone: ${primaryPhone}
      Email: ${adminEmail}
      Business Hours: ${businessHours}
      Address: Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3
      
      This is an automated response from Zenith Medical Centre. Please do not reply to this email.
      For urgent matters, please call us directly at ${primaryPhone}.
      
      © ${new Date().getFullYear()} Zenith Medical Centre. All rights reserved.
    `

    // Send the email with proper threading headers
    const emailRes = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [customerEmail],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        'Message-ID': replyMessageId,
        'In-Reply-To': originalMessageId,
        'References': originalMessageId,
        'Reply-To': adminEmail
      }
    })

    console.log('Response email sent:', emailRes)

    return NextResponse.json({ 
      success: true, 
      message: 'Response sent successfully',
      emailId: emailRes.data?.id || 'sent'
    })
  } catch (error) {
    console.error('Error sending response email:', error)
    return NextResponse.json({ error: 'Failed to send response email' }, { status: 500 })
  }
}
