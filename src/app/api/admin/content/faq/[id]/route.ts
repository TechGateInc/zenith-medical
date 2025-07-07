import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { prisma } from '../../../../../../lib/db/prisma'
import { auditLog } from '../../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const faqId = params.id

    // Get FAQ
    const faq = await prisma.fAQItem.findUnique({
      where: { id: faqId },
      include: {
        createdByUser: {
          select: { email: true, name: true }
        }
      }
    })

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    // Log access
    await auditLog({
      action: 'FAQ_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { 
        faqId: faq.id,
        question: faq.question,
        category: faq.category
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ faq })

  } catch (error) {
    console.error('FAQ fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const faqId = params.id

    // Check if FAQ exists
    const existingFAQ = await prisma.fAQItem.findUnique({
      where: { id: faqId },
      select: { id: true, question: true, createdBy: true }
    })

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const updateData: any = {}

    // Handle fields
    if (body.question !== undefined) updateData.question = body.question
    if (body.answer !== undefined) updateData.answer = body.answer
    if (body.category !== undefined) updateData.category = body.category || null
    if (body.published !== undefined) updateData.published = body.published
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

    // Validate required fields if being updated
    if (updateData.question !== undefined && !updateData.question.trim()) {
      return NextResponse.json(
        { error: 'Question cannot be empty' },
        { status: 400 }
      )
    }

    if (updateData.answer !== undefined && !updateData.answer.trim()) {
      return NextResponse.json(
        { error: 'Answer cannot be empty' },
        { status: 400 }
      )
    }

    // Update the FAQ
    const updatedFAQ = await prisma.fAQItem.update({
      where: { id: faqId },
      data: updateData
    })

    // Log update
    await auditLog({
      action: 'FAQ_UPDATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        faqId: updatedFAQ.id,
        question: updatedFAQ.question,
        category: updatedFAQ.category,
        changedFields: Object.keys(updateData),
        published: updatedFAQ.published,
        sortOrder: updatedFAQ.sortOrder
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ faq: updatedFAQ })

  } catch (error) {
    console.error('FAQ update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    // Only admins and super admins can delete FAQs
    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const faqId = params.id

    // Check if FAQ exists
    const existingFAQ = await prisma.fAQItem.findUnique({
      where: { id: faqId },
      select: { id: true, question: true, category: true }
    })

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    // Delete the FAQ
    await prisma.fAQItem.delete({
      where: { id: faqId }
    })

    // Log deletion
    await auditLog({
      action: 'FAQ_DELETE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        faqId: existingFAQ.id,
        question: existingFAQ.question,
        category: existingFAQ.category
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ message: 'FAQ deleted successfully' })

  } catch (error) {
    console.error('FAQ deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 