import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get FAQs
    const faqs = await prisma.fAQ.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        orderIndex: true,
        published: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log access
    await auditLog({
      action: 'FAQ_LIST_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { faqsCount: faqs.length },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ faqs })

  } catch (error) {
    console.error('FAQs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const {
      question,
      answer,
      category,
      published = false,
      orderIndex
    } = body

    // Basic validation
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Get the next order index if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const lastFAQ = await prisma.fAQ.findFirst({
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      })
      finalOrderIndex = (lastFAQ?.orderIndex || 0) + 1
    }

    // Create FAQ
    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || null,
        orderIndex: finalOrderIndex,
        published
      }
    })

    // Log creation
    await auditLog({
      action: 'FAQ_CREATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        faqId: faq.id,
        question: faq.question,
        category: faq.category,
        published: faq.published,
        orderIndex: faq.orderIndex
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ faq }, { status: 201 })

  } catch (error) {
    console.error('FAQ creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 