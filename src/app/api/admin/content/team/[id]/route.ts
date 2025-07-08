import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth/config'
import { prisma } from '../../../../../../lib/prisma'
import { auditLog } from '../../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: memberId } = await params

    // Get team member
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: memberId }
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Log access
    await auditLog({
      action: 'TEAM_MEMBER_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { 
        teamMemberId: teamMember.id,
        name: teamMember.name,
        title: teamMember.title
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ teamMember })

  } catch (error) {
    console.error('Team member fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: memberId } = await params

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { id: true, name: true }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const updateData: any = {}

    // Handle fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.title !== undefined) updateData.title = body.title
    if (body.specialties !== undefined) updateData.specialties = body.specialties || null
    if (body.bio !== undefined) updateData.bio = body.bio || null
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl || null
    if (body.published !== undefined) updateData.published = body.published
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex

    // Validate required fields if being updated
    if (updateData.name !== undefined && !updateData.name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      )
    }

    if (updateData.title !== undefined && !updateData.title.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Update the team member
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: updateData
    })

    // Log update
    await auditLog({
      action: 'TEAM_MEMBER_UPDATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        teamMemberId: updatedMember.id,
        name: updatedMember.name,
        title: updatedMember.title,
        changedFields: Object.keys(updateData),
        published: updatedMember.published,
        orderIndex: updatedMember.orderIndex
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ teamMember: updatedMember })

  } catch (error) {
    console.error('Team member update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only admins and super admins can delete team members
    if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: memberId } = await params

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, title: true }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Delete the team member
    await prisma.teamMember.delete({
      where: { id: memberId }
    })

    // Log deletion
    await auditLog({
      action: 'TEAM_MEMBER_DELETE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        teamMemberId: existingMember.id,
        name: existingMember.name,
        title: existingMember.title
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ message: 'Team member deleted successfully' })

  } catch (error) {
    console.error('Team member deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 