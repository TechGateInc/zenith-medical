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

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        specialties: true,
        bio: true,
        email: true,
        phone: true,
        photoUrl: true,
        sortOrder: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true
      }
    })

    // Log access
    await auditLog({
      action: 'TEAM_LIST_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { teamMembersCount: teamMembers.length },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ teamMembers })

  } catch (error) {
    console.error('Team members fetch error:', error)
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
      name,
      title,
      specialties,
      bio,
      email,
      phone,
      photoUrl,
      published = false,
      sortOrder
    } = body

    // Basic validation
    if (!name || !title) {
      return NextResponse.json(
        { error: 'Name and title are required' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Get the next sort order if not provided
    let finalSortOrder = sortOrder
    if (finalSortOrder === undefined) {
      const lastMember = await prisma.teamMember.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      })
      finalSortOrder = (lastMember?.sortOrder || 0) + 1
    }

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        title,
        specialties: specialties || null,
        bio: bio || null,
        email: email || null,
        phone: phone || null,
        photoUrl: photoUrl || null,
        sortOrder: finalSortOrder,
        published,
        createdBy: user.id
      }
    })

    // Log creation
    await auditLog({
      action: 'TEAM_MEMBER_CREATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        teamMemberId: teamMember.id,
        name: teamMember.name,
        title: teamMember.title,
        published: teamMember.published,
        sortOrder: teamMember.sortOrder
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ teamMember }, { status: 201 })

  } catch (error) {
    console.error('Team member creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 