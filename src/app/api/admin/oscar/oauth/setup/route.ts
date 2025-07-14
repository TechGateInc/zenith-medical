import { NextRequest, NextResponse } from 'next/server'
import { OscarOAuthSetup } from '@/lib/integrations/oscar-oauth-setup'
import { auditLog } from '@/lib/audit/audit-logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { baseUrl, consumerKey, consumerSecret, callbackUrl } = body

    // Validate required parameters
    if (!baseUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          details: 'baseUrl, consumerKey, and consumerSecret are required'
        },
        { status: 400 }
      )
    }

    // Log OAuth setup initiation
    await auditLog({
      action: 'OSCAR_OAUTH_SETUP_INITIATED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'oscar_oauth',
      details: {
        baseUrl,
        hasConsumerKey: !!consumerKey,
        hasConsumerSecret: !!consumerSecret,
        callbackUrl: callbackUrl || 'default'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Initialize OAuth setup with provided credentials
    const oauthSetup = new OscarOAuthSetup(
      { baseUrl, consumerKey, consumerSecret },
      callbackUrl
    )

    // Get request token and authorization URL
    const result = await oauthSetup.getRequestToken()

    if (!result.success) {
      await auditLog({
        action: 'OSCAR_OAUTH_SETUP_FAILED',
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        resource: 'oscar_oauth',
        details: {
          error: result.error,
          baseUrl
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json(
        { 
          error: 'Failed to initiate OAuth setup',
          details: result.error
        },
        { status: 500 }
      )
    }

    // Store pending tokens for later retrieval in callback
    if (result.tokens) {
      await storePendingOAuthTokens(result.tokens.requestToken, {
        requestTokenSecret: result.tokens.requestTokenSecret,
        userId: session.user.id,
        timestamp: new Date()
      })
    }

    await auditLog({
      action: 'OSCAR_OAUTH_REQUEST_TOKEN_SUCCESS',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'oscar_oauth',
      details: {
        hasRequestToken: !!result.tokens?.requestToken,
        authorizeUrl: result.authorizeUrl
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      authorizeUrl: result.authorizeUrl,
      message: 'OAuth setup initiated. Please visit the authorization URL to complete the process.',
      instructions: [
        'Visit the authorization URL in a new tab',
        'Login to your Oscar EMR system',
        'Authorize the application',
        'You will be redirected back to complete the setup'
      ]
    })

  } catch (error) {
    console.error('OAuth setup error:', error)
    
    await auditLog({
      action: 'OSCAR_OAUTH_SETUP_ERROR',
      userId: 'system',
      userEmail: 'system',
      resource: 'oscar_oauth',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json(
      { 
        error: 'OAuth setup processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to store pending OAuth tokens
async function storePendingOAuthTokens(requestToken: string, tokenData: any) {
  // TODO: Implement secure storage of pending OAuth tokens
  // This could be stored in database, Redis, or secure session storage
  // For production, consider using a time-limited storage (e.g., expire after 1 hour)
  console.log('TODO: Store pending OAuth tokens:', {
    requestToken: requestToken.substring(0, 8) + '...',
    userId: tokenData.userId,
    timestamp: tokenData.timestamp
  })
  
  // Example implementation using in-memory storage (not recommended for production):
  // You might want to use Redis, database, or encrypted session storage instead
  if (typeof global !== 'undefined') {
    if (!(global as any).pendingOAuthTokens) {
      (global as any).pendingOAuthTokens = new Map()
    }
    (global as any).pendingOAuthTokens.set(requestToken, tokenData)
    
    // Clean up after 1 hour
    setTimeout(() => {
      (global as any).pendingOAuthTokens?.delete(requestToken)
    }, 60 * 60 * 1000)
  }
} 