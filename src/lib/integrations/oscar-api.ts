const OAuth = require('oauth-1.0a')
import * as crypto from 'crypto'
import { auditLog } from '../audit/audit-logger'
import { oscarTokenManager } from './oscar-token-manager'
import { 
  OscarError,
  OscarAuthenticationError,
  OscarNetworkError,
  OscarApiError,
  OscarConfigurationError,
  OscarErrorFactory,
  OscarErrorHandler
} from './oscar-errors'
import type {
  OscarCredentials,
  OscarDemographic,
  OscarDemographicResponse,
  OscarProvider,
  OscarAppointment,
  OscarAppointmentResponse,
  OscarQuickSearchResponse,
  OscarApiResponse
} from '../../types/oscar'

export class OscarApiClient {
  private credentials: OscarCredentials
  private oauth: any
  private isInitialized: boolean = false

  constructor(credentials?: OscarCredentials) {
    try {
      // Validate configuration before proceeding
      OscarErrorFactory.validateConfiguration()
      
      this.credentials = credentials || this.loadCredentialsFromEnv()
      this.oauth = new OAuth({
        consumer: {
          key: this.credentials.consumerKey,
          secret: this.credentials.consumerSecret
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string: string, key: string) {
          return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64')
        }
      })
    } catch (error) {
      if (error instanceof OscarError) {
        throw error
      }
      throw new OscarConfigurationError(
        `Failed to initialize OSCAR API client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'missing_setup'
      )
    }
  }

  private loadCredentialsFromEnv(): OscarCredentials {
    const baseUrl = process.env.OSCAR_BASE_URL
    const consumerKey = process.env.OSCAR_CONSUMER_KEY
    const consumerSecret = process.env.OSCAR_CONSUMER_SECRET
    const token = process.env.OSCAR_TOKEN
    const tokenSecret = process.env.OSCAR_TOKEN_SECRET

    if (!baseUrl || !consumerKey || !consumerSecret || !token || !tokenSecret) {
      throw new OscarApiError(
        'Missing OSCAR API credentials. Please check environment variables.',
        'server_error',
        500,
        undefined,
        {
          required: ['OSCAR_BASE_URL', 'OSCAR_CONSUMER_KEY', 'OSCAR_CONSUMER_SECRET', 'OSCAR_TOKEN', 'OSCAR_TOKEN_SECRET'],
          missing: [
            !baseUrl && 'OSCAR_BASE_URL',
            !consumerKey && 'OSCAR_CONSUMER_KEY',
            !consumerSecret && 'OSCAR_CONSUMER_SECRET',
            !token && 'OSCAR_TOKEN',
            !tokenSecret && 'OSCAR_TOKEN_SECRET'
          ].filter(Boolean)
        }
      )
    }

    return {
      baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    }
  }

  public async testConnection(): Promise<OscarApiResponse<boolean>> {
    try {
      // Check token health before making connection test
      await this.ensureValidTokens()
      
      // Test connection with a simple API call
      const response = await this.makeRequest('GET', '/oscar/ws/services/test')
      return {
        success: true,
        data: true,
        message: 'OSCAR API connection successful'
      }
    } catch (error) {
      console.error('OSCAR API connection test failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  private async ensureValidTokens(): Promise<void> {
    try {
      // Check if we should use the token manager
      if (oscarTokenManager && oscarTokenManager.isConfigured()) {
        const tokenHealth = await oscarTokenManager.checkTokenHealth()
        
        if (!tokenHealth.isValid) {
          // Update our credentials with potentially refreshed tokens
          const refreshedCredentials = oscarTokenManager.getCredentials()
          this.credentials = refreshedCredentials
          
          // If tokens are still invalid, warn but don't block the request
          if (oscarTokenManager.needsRefresh()) {
            console.warn('OSCAR tokens may be invalid. Consider refreshing tokens.')
          }
        }
      }
    } catch (error) {
      // Don't block API calls if token health check fails
      console.warn('Token health check failed:', error)
    }
  }

  public async searchPatientByHealthNumber(healthNumber: string): Promise<OscarQuickSearchResponse> {
    try {
      if (!healthNumber || typeof healthNumber !== 'string') {
        throw new OscarApiError('Health number is required and must be a string', 'validation', 400)
      }

      // Ensure tokens are valid before making the request
      await this.ensureValidTokens()

      const endpoint = '/oscar/ws/services/demographics/quickSearch'
      const params = new URLSearchParams({ healthNumber: healthNumber.trim() })
      
      const response = await this.makeRequest('GET', `${endpoint}?${params.toString()}`)
      
      await this.logApiOperation('PATIENT_SEARCH', {
        endpoint,
        healthNumber: '***REDACTED***', // Don't log actual health number
        success: response.success
      })

      return response
    } catch (error) {
      await this.logApiOperation('PATIENT_SEARCH', {
        endpoint: '/oscar/ws/services/demographics/quickSearch',
        healthNumber: '***REDACTED***',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }

  public async createPatient(demographic: OscarDemographic): Promise<OscarDemographicResponse> {
    try {
      if (!demographic || typeof demographic !== 'object') {
        throw new OscarApiError('Demographic data is required', 'validation', 400)
      }

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'healthNumber']
      const missingFields = requiredFields.filter(field => !demographic[field as keyof OscarDemographic])
      
      if (missingFields.length > 0) {
        throw new OscarApiError(
          `Missing required fields: ${missingFields.join(', ')}`, 
          'validation',
          400,
          undefined,
          { missingFields }
        )
      }

      // Ensure tokens are valid before making the request
      await this.ensureValidTokens()

      const endpoint = '/oscar/ws/services/demographics'
      const response = await this.makeRequest('POST', endpoint, demographic)
      
      await this.logApiOperation('PATIENT_CREATE', {
        endpoint,
        patientId: response.demographicNo || 'unknown',
        success: response.success
      })

      return response
    } catch (error) {
      await this.logApiOperation('PATIENT_CREATE', {
        endpoint: '/oscar/ws/services/demographics',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }

  public async createAppointment(appointment: OscarAppointment): Promise<OscarAppointmentResponse> {
    try {
      if (!appointment || typeof appointment !== 'object') {
        throw new OscarApiError('Appointment data is required', 'validation', 400)
      }

      // Validate required fields
      const requiredFields = ['providerNo', 'appointmentDate', 'startTime']
      const missingFields = requiredFields.filter(field => !appointment[field as keyof OscarAppointment])
      
      if (missingFields.length > 0) {
        throw new OscarApiError(
          `Missing required appointment fields: ${missingFields.join(', ')}`, 
          'validation',
          400,
          undefined,
          { missingFields }
        )
      }

      // Ensure tokens are valid before making the request
      await this.ensureValidTokens()

      const endpoint = '/oscar/ws/services/schedule/add'
      const response = await this.makeRequest('POST', endpoint, appointment)
      
      await this.logApiOperation('APPOINTMENT_CREATE', {
        endpoint,
        appointmentId: response.appointmentNo || 'unknown',
        patientId: appointment.demographicNo || 'unknown',
        providerNo: appointment.providerNo,
        success: response.success
      })

      return response
    } catch (error) {
      await this.logApiOperation('APPOINTMENT_CREATE', {
        endpoint: '/oscar/ws/services/schedule/add',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }

  public async getProviders(): Promise<OscarApiResponse<OscarProvider[]>> {
    try {
      // Ensure tokens are valid before making the request
      await this.ensureValidTokens()
      
      const endpoint = '/oscar/ws/services/providers'
      const response = await this.makeRequest('GET', endpoint)
      
      await this.logApiOperation('PROVIDERS_FETCH', {
        endpoint,
        success: response.success,
        count: Array.isArray(response.data) ? response.data.length : 0
      })

      return response
    } catch (error) {
      await this.logApiOperation('PROVIDERS_FETCH', {
        endpoint: '/oscar/ws/services/providers',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }

  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    retryCount: number = 0
  ): Promise<any> {
    const url = `${this.credentials.baseUrl}${endpoint}`
    
    try {
      // Ensure we have valid tokens before making the request
      await this.ensureValidTokens()
      
      const requestData = {
        url,
        method,
        data: data && method !== 'GET' ? data : undefined
      }

      const token = {
        key: this.credentials.token,
        secret: this.credentials.tokenSecret
      }

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token))

      const headers: Record<string, string> = {
        'Authorization': authHeader.Authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Zenith-Medical-Centre/1.0'
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }

      const response = await fetch(url, fetchOptions)
      
      if (!response.ok) {
        const oscarError = await OscarErrorFactory.fromHttpResponse(response, endpoint, data)
        
        // Log the error with structured details
        await auditLog({
          action: 'OSCAR_API_ERROR',
          resource: 'oscar_api',
          details: oscarError.toLogObject(),
          ipAddress: 'system',
          userAgent: 'oscar-api-client'
        })
        
        throw oscarError
      }

      const responseText = await response.text()
      
      if (!responseText) {
        return { success: true, message: 'Request completed successfully' }
      }

      try {
        return JSON.parse(responseText)
      } catch (parseError) {
        // If response is not JSON, wrap it in a standard format
        return { 
          success: true, 
          data: responseText,
          message: 'Request completed successfully'
        }
      }
    } catch (error) {
      // If it's already an OscarError, check if we should retry
      if (error instanceof OscarError) {
        // Check if we should retry this error
        if (OscarErrorHandler.shouldRetry(error, retryCount, 3)) {
          const delay = OscarErrorHandler.getRetryDelay(retryCount)
          
          await auditLog({
            action: 'OSCAR_API_RETRY',
            resource: 'oscar_api',
            details: {
              endpoint,
              retryCount: retryCount + 1,
              delay,
              error: error.toLogObject()
            },
            ipAddress: 'system',
            userAgent: 'oscar-api-client'
          })
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // Retry the request
          return this.makeRequest(method, endpoint, data, retryCount + 1)
        }
        
        throw error
      }

      // Convert unknown errors to OSCAR network errors
      const oscarError = OscarErrorFactory.fromNetworkError(error as Error, endpoint)
      
      // Check if we should retry network errors
      if (OscarErrorHandler.shouldRetry(oscarError, retryCount, 3)) {
        const delay = OscarErrorHandler.getRetryDelay(retryCount)
        
        await auditLog({
          action: 'OSCAR_API_RETRY',
          resource: 'oscar_api',
          details: {
            endpoint,
            retryCount: retryCount + 1,
            delay,
            error: oscarError.toLogObject()
          },
          ipAddress: 'system',
          userAgent: 'oscar-api-client'
        })
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Retry the request
        return this.makeRequest(method, endpoint, data, retryCount + 1)
      }
      
      // Log the final error
      await auditLog({
        action: 'OSCAR_API_ERROR',
        resource: 'oscar_api',
        details: oscarError.toLogObject(),
        ipAddress: 'system',
        userAgent: 'oscar-api-client'
      })
      
      throw oscarError
    }
  }

  private async logApiOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_${operation}`,
        resource: 'oscar_api',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          apiVersion: '1.0'
        },
        ipAddress: 'system',
        userAgent: 'oscar-api-client'
      })
    } catch (error) {
      console.error('Failed to log OSCAR API operation:', error)
      // Don't throw here to avoid breaking the main operation
    }
  }

  public getCredentials(): Partial<OscarCredentials> {
    return {
      baseUrl: this.credentials.baseUrl,
      consumerKey: this.credentials.consumerKey,
      // Don't expose secrets
    }
  }

  public isConfigured(): boolean {
    return !!(
      this.credentials.baseUrl &&
      this.credentials.consumerKey &&
      this.credentials.consumerSecret &&
      this.credentials.token &&
      this.credentials.tokenSecret
    )
  }
}

// Export singleton instance
export const oscarApiClient = new OscarApiClient() 