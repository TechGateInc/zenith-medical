import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptPHI, encryptPHI } from '@/lib/utils/encryption'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          appointmentType: true,
          status: true,
          priority: true,
          assignedTo: true,
          respondedAt: true,
          responseMessage: true,
          createdAt: true,
          updatedAt: true,
          ipAddress: true,
          userAgent: true
        }
      }),
      prisma.contactSubmission.count({ where })
    ])

    // Decrypt sensitive data
    const decryptedSubmissions = submissions.map(submission => ({
      ...submission,
      name: decryptPHI(submission.name),
      email: decryptPHI(submission.email),
      phone: submission.phone ? decryptPHI(submission.phone) : null,
      subject: decryptPHI(submission.subject),
      message: decryptPHI(submission.message),
      appointmentType: submission.appointmentType ? decryptPHI(submission.appointmentType) : null,
      responseMessage: submission.responseMessage ? decryptPHI(submission.responseMessage) : null
    }))

    return NextResponse.json({
      submissions: decryptedSubmissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, priority, assignedTo, responseMessage } = body

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Update submission
    const updateData: any = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (responseMessage) {
      updateData.responseMessage = encryptPHI(responseMessage)
      updateData.respondedAt = new Date()
      updateData.responseAdminId = session.user.id
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error('Error updating contact submission:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
