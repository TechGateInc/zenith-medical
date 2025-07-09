import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { appointmentBookingService } from '../../../../lib/integrations/appointment-booking'
import { prisma } from '../../../../lib/prisma'
import { auditLog } from '../../../../lib/audit/audit-logger'
import { z } from 'zod'

// Validation schema for provider configuration
const providerConfigSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: z.enum(['acuity', 'calendly', 'simplepractice', 'generic_webhook', 'embed']),
  active: z.boolean(),
  isDefault: z.boolean().optional(),
  config: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    subdomain: z.string().optional(),
    embedUrl: z.string().optional(),
    webhookUrl: z.string().optional(),
    redirectUrl: z.string().optional()
  })
})

// GET /api/appointments/providers - Get available booking providers
export async function GET() {
  try {
    // Mock providers data - in production, this would be fetched from database or external APIs
    const providers = [
      {
        id: 'jane-app',
        name: 'Jane App',
        status: 'active',
        capabilities: ['online_booking', 'calendar_sync', 'patient_reminders'],
        lastSync: new Date().toISOString()
      },
      {
        id: 'acuity',
        name: 'Acuity Scheduling',
        status: 'inactive',
        capabilities: ['online_booking', 'payment_processing'],
        lastSync: null
      }
    ];

    // Mock provider availability check
    const providerAvailability = await Promise.all(
      providers.map(async (provider) => {
        // In a real scenario, you would call a service to check availability
        // For now, we'll just return a placeholder
        return {
          id: provider.id,
          name: provider.name,
          isAvailable: true, // Placeholder for actual availability check
          lastSync: provider.lastSync
        };
      })
    );

    return NextResponse.json({
      success: true,
      providers: providerAvailability,
      activeProvider: appointmentBookingService.getActiveProvider()?.type || null
    });

  } catch (error) {
    console.error('Error fetching booking providers:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch booking providers',
      providers: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow super admin to manage providers
    if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = providerConfigSchema.parse(body)
    
    // Check if provider type already exists
    const existingProvider = await prisma.bookingProvider.findUnique({
      where: { type: validatedData.type }
    })
    
    if (existingProvider) {
      return NextResponse.json({
        success: false,
        error: 'Provider type already exists'
      }, { status: 400 })
    }
    
    // If this is set as default, remove default from others
    if (validatedData.isDefault) {
      await prisma.bookingProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }
    
    // Create new provider
    const provider = await prisma.bookingProvider.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        active: validatedData.active,
        isDefault: validatedData.isDefault || false,
        config: validatedData.config
      }
    })
    
    // Update the booking service if this is the new default
    if (validatedData.isDefault && validatedData.active) {
      appointmentBookingService.setActiveProvider(validatedData.type)
    }
    
    // Audit log
    await auditLog({
      action: 'BOOKING_PROVIDER_CREATED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'booking_provider',
      resourceId: provider.id,
      details: {
        providerName: validatedData.name,
        providerType: validatedData.type,
        active: validatedData.active,
        isDefault: validatedData.isDefault
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        active: provider.active,
        isDefault: provider.isDefault
      }
    })
    
  } catch (error) {
    console.error('Error creating booking provider:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid provider configuration',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking provider'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow super admin to manage providers
    if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required'
      }, { status: 400 })
    }
    
    // Validate update data
    const partialSchema = providerConfigSchema.partial()
    const validatedData = partialSchema.parse(updateData)
    
    // Check if provider exists
    const existingProvider = await prisma.bookingProvider.findUnique({
      where: { id }
    })
    
    if (!existingProvider) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found'
      }, { status: 404 })
    }
    
    // If setting as default, remove default from others
    if (validatedData.isDefault) {
      await prisma.bookingProvider.updateMany({
        where: { 
          id: { not: id },
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }
    
    // Update provider
    const updatedProvider = await prisma.bookingProvider.update({
      where: { id },
      data: validatedData
    })
    
    // Update the booking service if this is the new default
    if (validatedData.isDefault && updatedProvider.active) {
      appointmentBookingService.setActiveProvider(updatedProvider.type)
    }
    
    // Audit log
    await auditLog({
      action: 'BOOKING_PROVIDER_UPDATED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'booking_provider',
      resourceId: updatedProvider.id,
      details: {
        providerName: updatedProvider.name,
        providerType: updatedProvider.type,
        changes: validatedData
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    return NextResponse.json({
      success: true,
      provider: {
        id: updatedProvider.id,
        name: updatedProvider.name,
        type: updatedProvider.type,
        active: updatedProvider.active,
        isDefault: updatedProvider.isDefault
      }
    })
    
  } catch (error) {
    console.error('Error updating booking provider:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid provider configuration',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update booking provider'
    }, { status: 500 })
  }
} 