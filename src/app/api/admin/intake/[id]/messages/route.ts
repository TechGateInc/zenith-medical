/**
 * Patient Messages API - Chat interface for patient communication
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AdminRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { encryptPHI, decryptPHI } from '@/lib/utils/encryption'

// Get all messages for a patient intake
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Disable chat functionality in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Feature not available', message: 'Chat functionality is temporarily disabled' },
      { status: 503 }
    )
  }

  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to view messages' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to view messages' },
        { status: 403 }
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
      return NextResponse.json({ messages: [] })
    }

    // Decrypt message content
    const decryptedMessages = await Promise.all(
      messages.map(async (message: any) => {
        try {
          return {
            id: message.id,
            patientIntakeId: message.patientIntakeId,
            content: await decryptPHI(message.content),
            subject: message.subject ? await decryptPHI(message.subject) : null,
            senderType: message.senderType,
            senderName: await decryptPHI(message.senderName),
            senderEmail: message.senderEmail ? await decryptPHI(message.senderEmail) : null,
            adminUserId: message.adminUserId,
            isRead: message.isRead,
            readAt: message.readAt,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
          }
        } catch (decryptError) {
          console.error('Failed to decrypt message:', message.id, decryptError)
          return {
            ...message,
            content: '[Decryption Failed]',
            senderName: '[Decryption Failed]'
          }
        }
      })
    )

    return NextResponse.json({ messages: decryptedMessages })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to fetch messages. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Disable chat functionality in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Feature not available', message: 'Chat functionality is temporarily disabled' },
      { status: 503 }
    )
  }

  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to send messages' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (session.user.role === AdminRole.EDITOR) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions to send messages' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, subject } = body

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify patient intake exists
    const patientIntake = await prisma.patientIntake.findUnique({
      where: { id: submissionId }
    })

    if (!patientIntake) {
      return NextResponse.json(
        { error: 'Not found', message: 'Patient intake not found' },
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
          subject: subject?.trim() ? await encryptPHI(subject.trim()) : null,
          senderType: 'ADMIN',
          senderName: await encryptPHI(session.user.name || 'Admin'),
          senderEmail: session.user.email ? await encryptPHI(session.user.email) : null,
          adminUserId: session.user.id,
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
      patientIntakeId: newMessage.patientIntakeId,
      content: content.trim(),
      subject: subject?.trim() || null,
      senderType: newMessage.senderType,
      senderName: session.user.name || 'Admin',
      senderEmail: session.user.email || null,
      adminUserId: newMessage.adminUserId,
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
    console.error('Error sending message:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to send message. Please try again later.' 
      },
      { status: 500 }
    )
  }
}