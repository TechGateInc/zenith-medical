import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { appointmentBookingService } from '../../../../../lib/integrations/appointment-booking'
import { bookingProviderValidator, type ProviderHealthCheck } from '../../../../../lib/integrations/booking-provider-validator'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { z } from 'zod'

// Validation schema for test request
const testProviderSchema = z.object({
  providerType: z.enum(['acuity', 'calendly', 'simplepractice', 'generic_webhook', 'embed']).optional(),
  testConnectivity: z.boolean().default(true),
  testConfiguration: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to test providers
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const body = await request.json()
    const { providerType, testConnectivity, testConfiguration } = testProviderSchema.parse(body)
    
    // Get all providers or specific provider
    const providers = appointmentBookingService.getAllProviders()
    const providersToTest = providerType 
      ? providers.filter(p => p.type === providerType)
      : providers
    
    if (providersToTest.length === 0) {
      return NextResponse.json({
        success: false,
        error: providerType ? `No provider found with type: ${providerType}` : 'No providers configured'
      }, { status: 404 })
    }
    
    const results: ProviderHealthCheck[] = []
    
    // Test each provider
    for (const provider of providersToTest) {
      try {
        const healthCheck = await bookingProviderValidator.performHealthCheck(provider)
        results.push(healthCheck)
        
        // Log the test attempt
        await auditLog({
          action: 'BOOKING_PROVIDER_TEST',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          resource: 'booking_provider',
          resourceId: provider.type,
          details: {
            providerName: provider.name,
            providerType: provider.type,
            testResult: healthCheck.overallStatus,
            configurationValid: healthCheck.configurationValid.isValid,
            connectivityTest: healthCheck.connectivityTest.success,
            errors: healthCheck.configurationValid.errors,
            warnings: healthCheck.configurationValid.warnings
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
      } catch (error) {
        // Log the error but continue testing other providers
        console.error(`Error testing provider ${provider.type}:`, error)
        
        results.push({
          provider,
          configurationValid: {
            isValid: false,
            errors: [`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: [],
            suggestions: []
          },
          connectivityTest: {
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          },
          lastChecked: new Date(),
          overallStatus: 'error'
        })
      }
    }
    
    // Calculate summary statistics
    const summary = {
      totalProviders: results.length,
      healthyProviders: results.filter(r => r.overallStatus === 'healthy').length,
      warningProviders: results.filter(r => r.overallStatus === 'warning').length,
      errorProviders: results.filter(r => r.overallStatus === 'error').length,
      untestedProviders: results.filter(r => r.overallStatus === 'untested').length
    }
    
    return NextResponse.json({
      success: true,
      summary,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error testing booking providers:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test booking providers'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to view provider status
    if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const providerType = searchParams.get('type')
    const includeDetails = searchParams.get('details') === 'true'
    
    // Get all providers
    const providers = appointmentBookingService.getAllProviders()
    const activeProvider = appointmentBookingService.getActiveProvider()
    
    const providersToCheck = providerType 
      ? providers.filter(p => p.type === providerType)
      : providers
    
    const results = []
    
    for (const provider of providersToCheck) {
      const validation = bookingProviderValidator.validateProvider(provider)
      
      const result: any = {
        name: provider.name,
        type: provider.type,
        active: provider.active,
        isActiveProvider: activeProvider?.type === provider.type,
        configurationStatus: validation.isValid ? 'valid' : 'invalid',
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        suggestionCount: validation.suggestions.length
      }
      
      if (includeDetails) {
        result.validation = validation
        result.configuration = {
          // Only return safe configuration (no secrets)
          hasApiKey: !!(provider.config.apiKey),
          hasApiSecret: !!(provider.config.apiSecret),
          hasEmbedUrl: !!(provider.config.embedUrl),
          hasWebhookUrl: !!(provider.config.webhookUrl),
          hasSubdomain: !!(provider.config.subdomain),
          redirectUrl: provider.config.redirectUrl
        }
      }
      
      results.push(result)
    }
    
    return NextResponse.json({
      success: true,
      providers: results,
      summary: {
        total: results.length,
        active: results.filter(r => r.active).length,
        valid: results.filter(r => r.configurationStatus === 'valid').length,
        invalid: results.filter(r => r.configurationStatus === 'invalid').length,
        activeProvider: activeProvider?.type || null
      }
    })
    
  } catch (error) {
    console.error('Error getting provider status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get provider status'
    }, { status: 500 })
  }
} 