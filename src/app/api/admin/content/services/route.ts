import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { getServerSession } from 'next-auth' // Uncomment and use for real auth

export async function GET() {
  // TODO: Add admin authentication check
  const services = await prisma.service.findMany({ orderBy: { orderIndex: 'asc' } })
  return NextResponse.json({ success: true, services })
}

export async function POST(req: NextRequest) {
  // TODO: Add admin authentication check
  const data = await req.json()
  const { title, description, features, icon, orderIndex, published } = data
  const service = await prisma.service.create({
    data: { title, description, features, icon, orderIndex, published }
  })
  return NextResponse.json({ success: true, service })
}

export async function PATCH(req: NextRequest) {
  // TODO: Add admin authentication check
  const data = await req.json()
  const { id, ...update } = data
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
  const service = await prisma.service.update({ where: { id }, data: update })
  return NextResponse.json({ success: true, service })
}

export async function DELETE(req: NextRequest) {
  // TODO: Add admin authentication check
  const { id } = await req.json()
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
  await prisma.service.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 