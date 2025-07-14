const OAuth = require('oauth-1.0a')
import * as crypto from 'crypto'
import { auditLog } from '../audit/audit-logger'
import type {
  OscarCredentials,
  OscarApiResponse
} from '../../types/oscar'

export interface OAuthTokens {
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
  verifier?: string
}

export interface OAuthSetupResult {
  success: boolean
  authorizeUrl?: string
  tokens?: OAuthTokens
  error?: string
  message?: string
}

export class OscarOAuthSetup {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private oauth: any
  private callbackUrl: string

  constructor(credentials?: Partial<OscarCredentials>, callbackUrl?: string) {
    this.baseUrl = credentials?.baseUrl || process.env.OSCAR_BASE_URL || ''
    this.consumerKey = credentials?.consumerKey || process.env.OSCAR_CONSUMER_KEY || ''
    this.consumerSecret = credentials?.consumerSecret || process.env.OSCAR_CONSUMER_SECRET || ''
    this.callbackUrl = callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/admin/oscar/oauth/callback`

    if (!this.baseUrl || !this.consumerKey || !this.consumerSecret) {
      throw new Error('Missing required OAuth credentials: OSCAR_BASE_URL, OSCAR_CONSUMER_KEY, OSCAR_CONSUMER_SECRET')
    }

    this.oauth = new OAuth({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
      }
    })
  }

  /**
   * Step 1: Get request token from OSCAR
   * This initiates the OAuth flow
   */
  public async getRequestToken(): Promise<OAuthSetupResult> {
    try {
      const requestTokenUrl = `${this.baseUrl}/oscar/ws/oauth/request_token`
      
      const requestData = {
        url: requestTokenUrl,
        method: 'POST',
        data: {
          oauth_callback: this.callbackUrl
        }
      }

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData))
      
      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader.Authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        body: `oauth_callback=${encodeURIComponent(this.callbackUrl)}`
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get request token: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const responseText = await response.text()
      const params = new URLSearchParams(responseText)
      
      const requestToken = params.get('oauth_token')
      const requestTokenSecret = params.get('oauth_token_secret')
      const callbackConfirmed = params.get('oauth_callback_confirmed')

      if (!requestToken || !requestTokenSecret) {
        throw new Error('Invalid response from OSCAR: missing oauth_token or oauth_token_secret')
      }

      if (callbackConfirmed !== 'true') {
        throw new Error('OAuth callback not confirmed by OSCAR')
      }

      const tokens: OAuthTokens = {
        requestToken,
        requestTokenSecret
      }

      // Generate authorization URL
      const authorizeUrl = `${this.baseUrl}/oscar/ws/oauth/authorize?oauth_token=${requestToken}`

      await this.logOAuthOperation('REQUEST_TOKEN_SUCCESS', {
        hasRequestToken: !!requestToken,
        hasRequestTokenSecret: !!requestTokenSecret,
        callbackConfirmed
      })

      return {
        success: true,
        authorizeUrl,
        tokens,
        message: 'Request token obtained successfully. User must visit authorize URL to complete authentication.'
      }

    } catch (error) {
      await this.logOAuthOperation('REQUEST_TOKEN_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get request token'
      }
    }
  }

  /**
   * Step 2: Exchange request token + verifier for access token
   * This is called after user authorizes the application in OSCAR
   */
  public async getAccessToken(requestToken: string, requestTokenSecret: string, verifier: string): Promise<OAuthSetupResult> {
    try {
      if (!requestToken || !requestTokenSecret || !verifier) {
        throw new Error('Missing required parameters: requestToken, requestTokenSecret, and verifier are all required')
      }

      const accessTokenUrl = `${this.baseUrl}/oscar/ws/oauth/access_token`
      
      const requestData = {
        url: accessTokenUrl,
        method: 'POST',
        data: {
          oauth_verifier: verifier
        }
      }

      const token = {
        key: requestToken,
        secret: requestTokenSecret
      }

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token))
      
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader.Authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        body: `oauth_verifier=${encodeURIComponent(verifier)}`
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const responseText = await response.text()
      const params = new URLSearchParams(responseText)
      
      const accessToken = params.get('oauth_token')
      const accessTokenSecret = params.get('oauth_token_secret')

      if (!accessToken || !accessTokenSecret) {
        throw new Error('Invalid response from OSCAR: missing oauth_token or oauth_token_secret in access token response')
      }

      const tokens: OAuthTokens = {
        requestToken,
        requestTokenSecret,
        accessToken,
        accessTokenSecret,
        verifier
      }

      await this.logOAuthOperation('ACCESS_TOKEN_SUCCESS', {
        hasAccessToken: !!accessToken,
        hasAccessTokenSecret: !!accessTokenSecret
      })

      return {
        success: true,
        tokens,
        message: 'Access token obtained successfully. Save OSCAR_TOKEN and OSCAR_TOKEN_SECRET to environment variables.'
      }

    } catch (error) {
      await this.logOAuthOperation('ACCESS_TOKEN_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get access token'
      }
    }
  }

  /**
   * Complete OAuth setup flow - combines request token and access token steps
   * Note: This requires manual intervention for user authorization
   */
  public async initiateOAuthSetup(): Promise<OAuthSetupResult> {
    try {
      const requestTokenResult = await this.getRequestToken()
      
      if (!requestTokenResult.success || !requestTokenResult.authorizeUrl || !requestTokenResult.tokens) {
        return requestTokenResult
      }

      return {
        success: true,
        authorizeUrl: requestTokenResult.authorizeUrl,
        tokens: requestTokenResult.tokens,
        message: `OAuth setup initiated. Please visit the authorization URL and complete the process manually: ${requestTokenResult.authorizeUrl}`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth setup'
      }
    }
  }

  /**
   * Validate and test OAuth tokens by making a test API call
   */
  public async validateTokens(accessToken: string, accessTokenSecret: string): Promise<OscarApiResponse<boolean>> {
    try {
      const testUrl = `${this.baseUrl}/oscar/ws/services/test`
      
      const requestData = {
        url: testUrl,
        method: 'GET'
      }

      const token = {
        key: accessToken,
        secret: accessTokenSecret
      }

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token))
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader.Authorization,
          'Accept': 'application/json'
        }
      })

      const isValid = response.ok
      
      await this.logOAuthOperation('TOKEN_VALIDATION', {
        isValid,
        statusCode: response.status
      })

      return {
        success: isValid,
        data: isValid,
        message: isValid ? 'OAuth tokens are valid' : 'OAuth tokens are invalid or expired'
      }

    } catch (error) {
      await this.logOAuthOperation('TOKEN_VALIDATION_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate tokens'
      }
    }
  }

  /**
   * Generate environment variable configuration for completed OAuth setup
   */
  public generateEnvConfig(tokens: OAuthTokens): string {
    if (!tokens.accessToken || !tokens.accessTokenSecret) {
      throw new Error('Access token and secret are required to generate environment configuration')
    }

    return `
# OSCAR OAuth Configuration
# Add these to your .env file after completing OAuth setup

OSCAR_BASE_URL=${this.baseUrl}
OSCAR_CONSUMER_KEY=${this.consumerKey}
OSCAR_CONSUMER_SECRET=${this.consumerSecret}
OSCAR_TOKEN=${tokens.accessToken}
OSCAR_TOKEN_SECRET=${tokens.accessTokenSecret}
`.trim()
  }

  private async logOAuthOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_OAUTH_${operation}`,
        resource: 'oscar_oauth_setup',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          baseUrl: this.baseUrl,
          consumerKey: this.consumerKey.substring(0, 8) + '***' // Partial key for debugging
        },
        ipAddress: 'system',
        userAgent: 'oscar-oauth-setup'
      })
    } catch (error) {
      console.error('Failed to log OAuth operation:', error)
    }
  }

  public getConfiguration(): { baseUrl: string; consumerKey: string; callbackUrl: string } {
    return {
      baseUrl: this.baseUrl,
      consumerKey: this.consumerKey,
      callbackUrl: this.callbackUrl
    }
  }
}

// Export helper function for easy OAuth setup
export async function setupOscarOAuth(callbackUrl?: string): Promise<OAuthSetupResult> {
  const oauthSetup = new OscarOAuthSetup(undefined, callbackUrl)
  return await oauthSetup.initiateOAuthSetup()
} 