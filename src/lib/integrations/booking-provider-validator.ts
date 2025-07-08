import type { BookingProvider } from './appointment-booking'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface TestResult {
  success: boolean
  responseTime?: number
  errorMessage?: string
  statusCode?: number
  testDetails?: Record<string, any>
}

export interface ProviderHealthCheck {
  provider: BookingProvider
  configurationValid: ValidationResult
  connectivityTest: TestResult
  lastChecked: Date
  overallStatus: 'healthy' | 'warning' | 'error' | 'untested'
}

export class BookingProviderValidator {
  /**
   * Validate provider configuration
   */
  public validateProvider(provider: BookingProvider): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Basic validation
    if (!provider.name || provider.name.trim().length === 0) {
      result.errors.push('Provider name is required')
      result.isValid = false
    }

    if (!provider.type) {
      result.errors.push('Provider type is required')
      result.isValid = false
    }

    // Type-specific validation
    switch (provider.type) {
      case 'acuity':
        this.validateAcuityConfig(provider, result)
        break
      case 'calendly':
        this.validateCalendlyConfig(provider, result)
        break
      case 'simplepractice':
        this.validateSimplePracticeConfig(provider, result)
        break
      case 'generic_webhook':
        this.validateWebhookConfig(provider, result)
        break
      case 'embed':
        this.validateEmbedConfig(provider, result)
        break
      default:
        result.errors.push(`Unknown provider type: ${provider.type}`)
        result.isValid = false
    }

    return result
  }

  /**
   * Test provider connectivity and functionality
   */
  public async testProvider(provider: BookingProvider): Promise<TestResult> {
    const startTime = Date.now()

    try {
      switch (provider.type) {
        case 'acuity':
          return await this.testAcuityProvider(provider, startTime)
        case 'calendly':
          return await this.testCalendlyProvider(provider, startTime)
        case 'simplepractice':
          return await this.testSimplePracticeProvider(provider, startTime)
        case 'generic_webhook':
          return await this.testWebhookProvider(provider, startTime)
        case 'embed':
          return await this.testEmbedProvider(provider, startTime)
        default:
          return {
            success: false,
            errorMessage: `Testing not implemented for provider type: ${provider.type}`,
            responseTime: Date.now() - startTime
          }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async performHealthCheck(provider: BookingProvider): Promise<ProviderHealthCheck> {
    const configurationValid = this.validateProvider(provider)
    const connectivityTest = await this.testProvider(provider)
    
    let overallStatus: 'healthy' | 'warning' | 'error' | 'untested' = 'untested'
    
    if (!configurationValid.isValid) {
      overallStatus = 'error'
    } else if (configurationValid.warnings.length > 0) {
      overallStatus = 'warning'
    } else if (connectivityTest.success) {
      overallStatus = 'healthy'
    } else {
      overallStatus = 'error'
    }

    return {
      provider,
      configurationValid,
      connectivityTest,
      lastChecked: new Date(),
      overallStatus
    }
  }

  // Provider-specific validation methods

  private validateAcuityConfig(provider: BookingProvider, result: ValidationResult): void {
    const { apiKey, apiSecret, subdomain } = provider.config

    if (!apiKey) {
      result.errors.push('Acuity API key is required')
      result.isValid = false
    } else if (!apiKey.match(/^[A-Za-z0-9]+$/)) {
      result.warnings.push('Acuity API key format may be incorrect')
    }

    if (!apiSecret) {
      result.errors.push('Acuity API secret is required')
      result.isValid = false
    }

    if (!subdomain) {
      result.errors.push('Acuity subdomain is required')
      result.isValid = false
    } else if (!subdomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)) {
      result.warnings.push('Acuity subdomain format may be incorrect')
    }

    if (!provider.config.redirectUrl) {
      result.suggestions.push('Consider setting a custom redirect URL for better user experience')
    }
  }

  private validateCalendlyConfig(provider: BookingProvider, result: ValidationResult): void {
    const { embedUrl } = provider.config

    if (!embedUrl) {
      result.errors.push('Calendly embed URL is required')
      result.isValid = false
    } else {
      try {
        const url = new URL(embedUrl)
        if (!url.hostname.includes('calendly.com')) {
          result.warnings.push('Embed URL does not appear to be a Calendly URL')
        }
      } catch (error) {
        result.errors.push('Calendly embed URL is not a valid URL')
        result.isValid = false
      }
    }

    result.suggestions.push('Calendly does not support programmatic appointment creation - this integration redirects users to Calendly booking pages')
  }

  private validateSimplePracticeConfig(provider: BookingProvider, result: ValidationResult): void {
    const { embedUrl, subdomain } = provider.config

    if (!embedUrl && !subdomain) {
      result.errors.push('Either SimplePractice embed URL or subdomain is required')
      result.isValid = false
    }

    if (embedUrl) {
      try {
        const url = new URL(embedUrl)
        if (!url.hostname.includes('simplepractice.com')) {
          result.warnings.push('Embed URL does not appear to be a SimplePractice URL')
        }
      } catch (error) {
        result.errors.push('SimplePractice embed URL is not a valid URL')
        result.isValid = false
      }
    }

    if (subdomain && !subdomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/)) {
      result.warnings.push('SimplePractice subdomain format may be incorrect')
    }

    result.suggestions.push('SimplePractice uses appointment request widgets - ensure your widget is properly configured')
  }

  private validateWebhookConfig(provider: BookingProvider, result: ValidationResult): void {
    const { webhookUrl, apiKey } = provider.config

    if (!webhookUrl) {
      result.errors.push('Webhook URL is required')
      result.isValid = false
    } else {
      try {
        const url = new URL(webhookUrl)
        if (url.protocol !== 'https:') {
          result.warnings.push('Webhook URL should use HTTPS for security')
        }
      } catch (error) {
        result.errors.push('Webhook URL is not a valid URL')
        result.isValid = false
      }
    }

    if (!apiKey) {
      result.warnings.push('No API key configured - webhook requests will not be authenticated')
    }
  }

  private validateEmbedConfig(provider: BookingProvider, result: ValidationResult): void {
    const { embedUrl } = provider.config

    if (!embedUrl) {
      result.errors.push('Embed URL is required')
      result.isValid = false
    } else {
      try {
        new URL(embedUrl)
      } catch (error) {
        result.errors.push('Embed URL is not a valid URL')
        result.isValid = false
      }
    }
  }

  // Provider-specific testing methods

  private async testAcuityProvider(provider: BookingProvider, startTime: number): Promise<TestResult> {
    const { apiKey, apiSecret } = provider.config

    if (!apiKey || !apiSecret) {
      return {
        success: false,
        errorMessage: 'API credentials not configured',
        responseTime: Date.now() - startTime
      }
    }

    try {
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const response = await fetch('https://acuityscheduling.com/api/v1/me', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          responseTime,
          testDetails: {
            statusCode: response.status,
            accountId: data.id,
            businessName: data.name
          }
        }
      } else {
        return {
          success: false,
          errorMessage: `Acuity API returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          responseTime
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      }
    }
  }

  private async testCalendlyProvider(provider: BookingProvider, startTime: number): Promise<TestResult> {
    const { embedUrl } = provider.config

    if (!embedUrl) {
      return {
        success: false,
        errorMessage: 'Embed URL not configured',
        responseTime: Date.now() - startTime
      }
    }

    try {
      const response = await fetch(embedUrl, { method: 'HEAD' })
      const responseTime = Date.now() - startTime

      if (response.ok || response.status === 405) { // 405 Method Not Allowed is acceptable for HEAD requests
        return {
          success: true,
          responseTime,
          testDetails: {
            statusCode: response.status,
            accessible: true
          }
        }
      } else {
        return {
          success: false,
          errorMessage: `Calendly page returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          responseTime
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      }
    }
  }

  private async testSimplePracticeProvider(provider: BookingProvider, startTime: number): Promise<TestResult> {
    const { embedUrl, subdomain } = provider.config
    
    const testUrl = embedUrl || (subdomain ? `https://${subdomain}.simplepractice.com/appointment_requests/new` : null)

    if (!testUrl) {
      return {
        success: false,
        errorMessage: 'No URL to test - configure embed URL or subdomain',
        responseTime: Date.now() - startTime
      }
    }

    try {
      const response = await fetch(testUrl, { method: 'HEAD' })
      const responseTime = Date.now() - startTime

      if (response.ok || response.status === 405) {
        return {
          success: true,
          responseTime,
          testDetails: {
            statusCode: response.status,
            accessible: true
          }
        }
      } else {
        return {
          success: false,
          errorMessage: `SimplePractice page returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          responseTime
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      }
    }
  }

  private async testWebhookProvider(provider: BookingProvider, startTime: number): Promise<TestResult> {
    const { webhookUrl, apiKey } = provider.config

    if (!webhookUrl) {
      return {
        success: false,
        errorMessage: 'Webhook URL not configured',
        responseTime: Date.now() - startTime
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      // Send a test ping to the webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'test_connection',
          timestamp: new Date().toISOString(),
          source: 'zenith_medical_booking_validator'
        })
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        return {
          success: true,
          responseTime,
          testDetails: {
            statusCode: response.status,
            accessible: true
          }
        }
      } else {
        return {
          success: false,
          errorMessage: `Webhook returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          responseTime
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      }
    }
  }

  private async testEmbedProvider(provider: BookingProvider, startTime: number): Promise<TestResult> {
    const { embedUrl } = provider.config

    if (!embedUrl) {
      return {
        success: false,
        errorMessage: 'Embed URL not configured',
        responseTime: Date.now() - startTime
      }
    }

    try {
      const response = await fetch(embedUrl, { method: 'HEAD' })
      const responseTime = Date.now() - startTime

      if (response.ok || response.status === 405) {
        return {
          success: true,
          responseTime,
          testDetails: {
            statusCode: response.status,
            accessible: true
          }
        }
      } else {
        return {
          success: false,
          errorMessage: `Embed page returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          responseTime
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      }
    }
  }
}

// Export singleton instance
export const bookingProviderValidator = new BookingProviderValidator() 