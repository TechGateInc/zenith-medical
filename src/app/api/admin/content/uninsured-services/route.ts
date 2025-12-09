import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/content/uninsured-services - Fetch all uninsured services
export async function GET() {
    try {
        const services = await prisma.uninsuredService.findMany({
            orderBy: [
                { category: 'asc' },
                { orderIndex: 'asc' }
            ]
        })
        return NextResponse.json({ success: true, services })
    } catch (error) {
        console.error('Failed to fetch uninsured services:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch services' },
            { status: 500 }
        )
    }
}

// POST /api/admin/content/uninsured-services - Create new uninsured service
export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        const { category, title, description, price, isInsured, orderIndex, published } = data

        if (!category || !title || !price) {
            return NextResponse.json(
                { success: false, error: 'Category, title, and price are required' },
                { status: 400 }
            )
        }

        const service = await prisma.uninsuredService.create({
            data: {
                category,
                title,
                description: description || null,
                price,
                isInsured: isInsured || false,
                orderIndex: orderIndex || 0,
                published: published !== false
            }
        })
        return NextResponse.json({ success: true, service })
    } catch (error) {
        console.error('Failed to create uninsured service:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create service' },
            { status: 500 }
        )
    }
}

// PATCH /api/admin/content/uninsured-services - Update uninsured service
export async function PATCH(req: NextRequest) {
    try {
        const data = await req.json()
        const { id, ...update } = data

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing id' },
                { status: 400 }
            )
        }

        const service = await prisma.uninsuredService.update({
            where: { id },
            data: update
        })
        return NextResponse.json({ success: true, service })
    } catch (error) {
        console.error('Failed to update uninsured service:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update service' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/content/uninsured-services - Delete uninsured service
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json()

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing id' },
                { status: 400 }
            )
        }

        await prisma.uninsuredService.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete uninsured service:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete service' },
            { status: 500 }
        )
    }
}
