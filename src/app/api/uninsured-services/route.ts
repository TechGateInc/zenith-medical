import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
    clinical: 'Clinical Services',
    work_educational_government: 'Work, Educational and Government Administrative Services',
    insurance_admin: 'Insurance Administrative Services'
}

// GET /api/uninsured-services - Fetch published uninsured services grouped by category
export async function GET() {
    try {
        const services = await prisma.uninsuredService.findMany({
            where: { published: true },
            orderBy: [
                { category: 'asc' },
                { orderIndex: 'asc' }
            ]
        })

        // Group by category
        const grouped: Record<string, {
            name: string,
            items: typeof services
        }> = {}

        for (const service of services) {
            if (!grouped[service.category]) {
                grouped[service.category] = {
                    name: CATEGORY_NAMES[service.category] || service.category,
                    items: []
                }
            }
            grouped[service.category].items.push(service)
        }

        // Convert to array format for easier rendering
        const categories = Object.entries(grouped).map(([key, value]) => ({
            key,
            name: value.name,
            items: value.items
        }))

        return NextResponse.json({
            success: true,
            categories
        })
    } catch (error) {
        console.error('Failed to fetch uninsured services:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch services' },
            { status: 500 }
        )
    }
}
