import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { AdminRole } from '../../../../../generated/prisma'

export async function GET(request: NextRequest) {
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

    // Get FAQs
    const faqs = await prisma.fAQItem.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        sortOrder: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true
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
    const user = await prisma.user.findUnique({
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
      sortOrder
    } = body

    // Basic validation
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Get the next sort order if not provided
    let finalSortOrder = sortOrder
    if (finalSortOrder === undefined) {
      const lastFAQ = await prisma.fAQItem.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      })
      finalSortOrder = (lastFAQ?.sortOrder || 0) + 1
    }

    // Create FAQ
    const faq = await prisma.fAQItem.create({
      data: {
        question,
        answer,
        category: category || null,
        sortOrder: finalSortOrder,
        published,
        createdBy: user.id
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
        sortOrder: faq.sortOrder
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