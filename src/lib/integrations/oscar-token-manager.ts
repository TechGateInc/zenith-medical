import { OscarOAuthSetup, type OAuthTokens, type OAuthSetupResult } from './oscar-oauth-setup'
import { auditLog } from '../audit/audit-logger'
import type {
  OscarCredentials,
  OscarApiResponse
} from '../../types/oscar'

export interface TokenHealth {
  isValid: boolean
  lastChecked: Date
  lastSuccess: Date | null
  failureCount: number
  lastError?: string
}

export interface TokenManagerConfig {
  healthCheckInterval: number // milliseconds
  maxFailureCount: number
  autoRefreshEnabled: boolean
  fallbackCallbackUrl?: string
}

export class OscarTokenManager {
  private credentials: OscarCredentials
  private tokenHealth: TokenHealth
  private config: TokenManagerConfig
  private healthCheckTimer: NodeJS.Timeout | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(credentials?: OscarCredentials, config?: Partial<TokenManagerConfig>) {
    this.credentials = credentials || this.loadCredentialsFromEnv()
    this.config = {
      healthCheckInterval: 30 * 60 * 1000, // 30 minutes
      maxFailureCount: 3,
      autoRefreshEnabled: true,
      ...config
    }
    
    this.tokenHealth = {
      isValid: false,
      lastChecked: new Date(),
      lastSuccess: null,
      failureCount: 0
    }
  }

  private loadCredentialsFromEnv(): OscarCredentials {
    const baseUrl = process.env.OSCAR_BASE_URL
    const consumerKey = process.env.OSCAR_CONSUMER_KEY
    const consumerSecret = process.env.OSCAR_CONSUMER_SECRET
    const token = process.env.OSCAR_TOKEN
    const tokenSecret = process.env.OSCAR_TOKEN_SECRET

    if (!baseUrl || !consumerKey || !consumerSecret || !token || !tokenSecret) {
      throw new Error('Missing OSCAR API credentials for token manager')
    }

    return {
      baseUrl: baseUrl.replace(/\/$/, ''),
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    }
  }

  /**
   * Start automatic token health monitoring
   */
  public startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      this.stopHealthMonitoring()
    }

    // Initial health check
    this.checkTokenHealth()

    // Schedule periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.checkTokenHealth()
    }, this.config.healthCheckInterval)

    this.logTokenOperation('HEALTH_MONITORING_STARTED', {
      interval: this.config.healthCheckInterval,
      autoRefreshEnabled: this.config.autoRefreshEnabled
    })
  }

  /**
   * Stop automatic token health monitoring
   */
  public stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
      
      this.logTokenOperation('HEALTH_MONITORING_STOPPED', {
        lastHealthCheck: this.tokenHealth.lastChecked.toISOString()
      })
    }
  }

  /**
   * Check if current tokens are valid by making a test API call
   */
  public async checkTokenHealth(): Promise<TokenHealth> {
    try {
      const oauthSetup = new OscarOAuthSetup(this.credentials)
      const result = await oauthSetup.validateTokens(
        this.credentials.token,
        this.credentials.tokenSecret
      )

      this.tokenHealth.lastChecked = new Date()

      if (result.success) {
        this.tokenHealth.isValid = true
        this.tokenHealth.lastSuccess = new Date()
        this.tokenHealth.failureCount = 0
        this.tokenHealth.lastError = undefined
        
        await this.logTokenOperation('HEALTH_CHECK_SUCCESS', {
          consecutiveSuccesses: true
        })
      } else {
        this.tokenHealth.isValid = false
        this.tokenHealth.failureCount += 1
        this.tokenHealth.lastError = result.error || 'Token validation failed'
        
        await this.logTokenOperation('HEALTH_CHECK_FAILED', {
          failureCount: this.tokenHealth.failureCount,
          error: this.tokenHealth.lastError,
          maxFailures: this.config.maxFailureCount
        })

        // Trigger automatic refresh if enabled and failure threshold reached
        if (this.config.autoRefreshEnabled && 
            this.tokenHealth.failureCount >= this.config.maxFailureCount && 
            !this.isRefreshing) {
          
          await this.logTokenOperation('AUTO_REFRESH_TRIGGERED', {
            failureCount: this.tokenHealth.failureCount,
            triggerThreshold: this.config.maxFailureCount
          })
          
          // Don't await this to avoid blocking the health check
          this.refreshTokens().catch(error => {
            console.error('Automatic token refresh failed:', error)
          })
        }
      }

      return this.tokenHealth
    } catch (error) {
      this.tokenHealth.isValid = false
      this.tokenHealth.lastChecked = new Date()
      this.tokenHealth.failureCount += 1
      this.tokenHealth.lastError = error instanceof Error ? error.message : 'Unknown error'
      
      await this.logTokenOperation('HEALTH_CHECK_ERROR', {
        failureCount: this.tokenHealth.failureCount,
        error: this.tokenHealth.lastError
      })

      return this.tokenHealth
    }
  }

  /**
   * Refresh OAuth tokens by re-running the authentication flow
   * Note: This requires manual intervention for OAuth 1.0a
   */
  public async refreshTokens(callbackUrl?: string): Promise<boolean> {
    if (this.isRefreshing) {
      // Return existing refresh promise if already refreshing
      return this.refreshPromise || Promise.resolve(false)
    }

    this.isRefreshing = true
    this.refreshPromise = this._performTokenRefresh(callbackUrl)
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async _performTokenRefresh(callbackUrl?: string): Promise<boolean> {
    try {
      await this.logTokenOperation('TOKEN_REFRESH_STARTED', {
        currentTokenValid: this.tokenHealth.isValid,
        failureCount: this.tokenHealth.failureCount
      })

      const oauthSetup = new OscarOAuthSetup(
        {
          baseUrl: this.credentials.baseUrl,
          consumerKey: this.credentials.consumerKey,
          consumerSecret: this.credentials.consumerSecret
        },
        callbackUrl || this.config.fallbackCallbackUrl
      )

      // Initiate OAuth flow to get new tokens
      const setupResult = await oauthSetup.initiateOAuthSetup()

      if (!setupResult.success) {
        await this.logTokenOperation('TOKEN_REFRESH_FAILED', {
          error: setupResult.error,
          step: 'oauth_initiation'
        })
        return false
      }

      // For OAuth 1.0a, we can't automatically complete the flow
      // The user needs to visit the authorization URL manually
      await this.logTokenOperation('TOKEN_REFRESH_PENDING_USER_AUTH', {
        authorizeUrl: setupResult.authorizeUrl,
        hasRequestToken: !!setupResult.tokens?.requestToken
      })

      // Store pending refresh state for completion later
      if (setupResult.tokens) {
        await this.storePendingRefresh(setupResult.tokens)
      }

      return false // OAuth 1.0a requires manual completion
    } catch (error) {
      await this.logTokenOperation('TOKEN_REFRESH_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Complete token refresh after user authorization
   */
  public async completeTokenRefresh(verifier: string): Promise<boolean> {
    try {
      const pendingTokens = await this.getPendingRefresh()
      if (!pendingTokens || !pendingTokens.requestToken || !pendingTokens.requestTokenSecret) {
        throw new Error('No pending token refresh found')
      }

      const oauthSetup = new OscarOAuthSetup(this.credentials)
      const result = await oauthSetup.getAccessToken(
        pendingTokens.requestToken,
        pendingTokens.requestTokenSecret,
        verifier
      )

      if (!result.success || !result.tokens?.accessToken || !result.tokens?.accessTokenSecret) {
        await this.logTokenOperation('TOKEN_REFRESH_COMPLETION_FAILED', {
          error: result.error
        })
        return false
      }

      // Update credentials with new tokens
      this.credentials.token = result.tokens.accessToken
      this.credentials.tokenSecret = result.tokens.accessTokenSecret

      // Reset health status
      this.tokenHealth.isValid = true
      this.tokenHealth.lastSuccess = new Date()
      this.tokenHealth.failureCount = 0
      this.tokenHealth.lastError = undefined

      // Clear pending refresh
      await this.clearPendingRefresh()

      await this.logTokenOperation('TOKEN_REFRESH_COMPLETED', {
        newTokensObtained: true
      })

      return true
    } catch (error) {
      await this.logTokenOperation('TOKEN_REFRESH_COMPLETION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Check if tokens need refresh based on health status
   */
  public needsRefresh(): boolean {
    return !this.tokenHealth.isValid || 
           this.tokenHealth.failureCount >= this.config.maxFailureCount
  }

  /**
   * Get current token health status
   */
  public getTokenHealth(): TokenHealth {
    return { ...this.tokenHealth }
  }

  /**
   * Get current credentials (with new tokens if refreshed)
   */
  public getCredentials(): OscarCredentials {
    return { ...this.credentials }
  }

  /**
   * Update token manager configuration
   */
  public updateConfig(newConfig: Partial<TokenManagerConfig>): void {
    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...newConfig }
    
    // Restart health monitoring if interval changed
    if (oldConfig.healthCheckInterval !== this.config.healthCheckInterval && this.healthCheckTimer) {
      this.stopHealthMonitoring()
      this.startHealthMonitoring()
    }

    this.logTokenOperation('CONFIG_UPDATED', {
      oldConfig,
      newConfig: this.config
    })
  }

  /**
   * Generate new environment configuration with current tokens
   */
  public generateEnvConfig(): string {
    return `
# OSCAR API Configuration (Updated by Token Manager)
OSCAR_BASE_URL=${this.credentials.baseUrl}
OSCAR_CONSUMER_KEY=${this.credentials.consumerKey}
OSCAR_CONSUMER_SECRET=${this.credentials.consumerSecret}
OSCAR_TOKEN=${this.credentials.token}
OSCAR_TOKEN_SECRET=${this.credentials.tokenSecret}

# Token Manager Health Status (Last checked: ${this.tokenHealth.lastChecked.toISOString()})
# Valid: ${this.tokenHealth.isValid}
# Failure count: ${this.tokenHealth.failureCount}
`.trim()
  }

  // Pending refresh state management (could be stored in database or cache)
  private async storePendingRefresh(tokens: OAuthTokens): Promise<void> {
    // In production, store this in database or secure cache
    // For now, we'll use a simple approach
    const pendingData = {
      tokens,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    }
    
    // Store in environment variable temporarily (not ideal for production)
    process.env.OSCAR_PENDING_REFRESH = JSON.stringify(pendingData)
  }

  private async getPendingRefresh(): Promise<OAuthTokens | null> {
    try {
      const pendingData = process.env.OSCAR_PENDING_REFRESH
      if (!pendingData) return null

      const parsed = JSON.parse(pendingData)
      const expiresAt = new Date(parsed.expiresAt)
      
      if (new Date() > expiresAt) {
        await this.clearPendingRefresh()
        return null
      }

      return parsed.tokens
    } catch {
      return null
    }
  }

  private async clearPendingRefresh(): Promise<void> {
    delete process.env.OSCAR_PENDING_REFRESH
  }

  private async logTokenOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_TOKEN_${operation}`,
        resource: 'oscar_token_manager',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          baseUrl: this.credentials.baseUrl,
          consumerKey: this.credentials.consumerKey.substring(0, 8) + '***'
        },
        ipAddress: 'system',
        userAgent: 'oscar-token-manager'
      })
    } catch (error) {
      console.error('Failed to log token operation:', error)
    }
  }

  /**
   * Check if token manager is properly configured
   */
  public isConfigured(): boolean {
    try {
      return !!(
        this.credentials.baseUrl &&
        this.credentials.consumerKey &&
        this.credentials.consumerSecret &&
        this.credentials.token &&
        this.credentials.tokenSecret
      )
    } catch {
      return false
    }
  }

  /**
   * Clean up resources when shutting down
   */
  public destroy(): void {
    this.stopHealthMonitoring()
    this.clearPendingRefresh()
  }
}

// Export singleton instance
export const oscarTokenManager = new OscarTokenManager()

// Auto-start health monitoring
if (process.env.NODE_ENV !== 'test') {
  oscarTokenManager.startHealthMonitoring()
} 