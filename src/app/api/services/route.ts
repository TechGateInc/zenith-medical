import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { orderIndex: 'asc' }
  })
  return NextResponse.json({ success: true, services })
} 