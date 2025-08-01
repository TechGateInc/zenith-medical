/**
 * Patient-facing Messages API - For patients to view and respond to messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptPHI, decryptPHI } from '@/lib/utils/encryption'

// Get all messages for a patient (using submission ID)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    // Verify patient intake exists
    const patientIntake = await prisma.patientIntake.findUnique({
      where: { id: submissionId }
    })

    if (!patientIntake) {
      return NextResponse.json(
        { error: 'Not found', message: 'Patient record not found' },
        { status: 404 }
      )
    }

    // Fetch messages with try-catch for database compatibility
    let messages = []
    try {
      messages = await (prisma as any).message.findMany({
        where: {
          patientIntakeId: submissionId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    } catch (error) {
      console.log('Message table not available yet, returning empty array')
      return NextResponse.json({ 
        messages: [],
        patientName: await decryptPHI(patientIntake.legalFirstName) + ' ' + await decryptPHI(patientIntake.legalLastName)
      })
    }

    // Decrypt message content
    const decryptedMessages = await Promise.all(
      messages.map(async (message: any) => {
        try {
          return {
            id: message.id,
            content: await decryptPHI(message.content),
            subject: message.subject ? await decryptPHI(message.subject) : null,
            senderType: message.senderType,
            senderName: await decryptPHI(message.senderName),
            isRead: message.isRead,
            readAt: message.readAt,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
          }
        } catch (decryptError) {
          console.error('Failed to decrypt message:', message.id, decryptError)
          return {
            ...message,
            content: '[Message temporarily unavailable]',
            senderName: 'Zenith Medical Centre'
          }
        }
      })
    )

    return NextResponse.json({ 
      messages: decryptedMessages,
      patientName: await decryptPHI(patientIntake.legalFirstName) + ' ' + await decryptPHI(patientIntake.legalLastName)
    })

  } catch (error) {
    console.error('Error fetching patient messages:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to fetch messages. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Send a patient response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    const body = await request.json()
    const { content, patientName, patientEmail } = body

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Message content is required' },
        { status: 400 }
      )
    }

    if (!patientName || !patientEmail) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Patient name and email are required' },
        { status: 400 }
      )
    }

    // Verify patient intake exists
    const patientIntake = await prisma.patientIntake.findUnique({
      where: { id: submissionId }
    })

    if (!patientIntake) {
      return NextResponse.json(
        { error: 'Not found', message: 'Patient record not found' },
        { status: 404 }
      )
    }

    // Create new message with try-catch for database compatibility
    let newMessage
    try {
      newMessage = await (prisma as any).message.create({
        data: {
          patientIntakeId: submissionId,
          content: await encryptPHI(content.trim()),
          senderType: 'PATIENT',
          senderName: await encryptPHI(patientName),
          senderEmail: await encryptPHI(patientEmail),
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    } catch (error) {
      console.error('Message table not available yet:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Message feature not available yet. Please run database migration.' },
        { status: 503 }
      )
    }

    // Return decrypted message
    const decryptedMessage = {
      id: newMessage.id,
      content: content.trim(),
      subject: null,
      senderType: newMessage.senderType,
      senderName: patientName,
      isRead: newMessage.isRead,
      readAt: newMessage.readAt,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: decryptedMessage
    })

  } catch (error) {
    console.error('Error sending patient message:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to send message. Please try again later.' 
      },
      { status: 500 }
    )
  }
}