import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { AdminRole, NotificationType, NotificationMethod } from '@prisma/client'

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

    // Get notification templates
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        method: true,
        subject: true,
        message: true,
        triggerHours: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log access
    await auditLog({
      action: 'NOTIFICATION_TEMPLATES_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { templatesCount: templates.length },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Notification templates fetch error:', error)
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
      name,
      type,
      method,
      subject,
      message,
      triggerHours,
      active = false
    } = body

    // Basic validation
    if (!name || !type || !method || !message || triggerHours === undefined) {
      return NextResponse.json(
        { error: 'Name, type, method, message, and trigger hours are required' },
        { status: 400 }
      )
    }

    // Validate enum values
    const validTypes = Object.values(NotificationType)
    const validMethods = Object.values(NotificationMethod)

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid notification method' },
        { status: 400 }
      )
    }

    if (triggerHours < 0 || triggerHours > 168) { // Max 1 week
      return NextResponse.json(
        { error: 'Trigger hours must be between 0 and 168 (1 week)' },
        { status: 400 }
      )
    }

    // Create notification template
    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        type,
        method,
        subject: subject || null,
        message,
        triggerHours,
        active,
        createdBy: user.id
      }
    })

    // Log creation
    await auditLog({
      action: 'NOTIFICATION_TEMPLATE_CREATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        templateId: template.id,
        name: template.name,
        type: template.type,
        method: template.method,
        triggerHours: template.triggerHours,
        active: template.active
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ template }, { status: 201 })

  } catch (error) {
    console.error('Notification template creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 