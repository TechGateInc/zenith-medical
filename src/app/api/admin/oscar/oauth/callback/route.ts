import { NextRequest, NextResponse } from 'next/server'
import { OscarOAuthSetup } from '@/lib/integrations/oscar-oauth-setup'
import { auditLog } from '@/lib/audit/audit-logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.role || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get('oauth_token')
    const oauthVerifier = searchParams.get('oauth_verifier')
    
    // Log OAuth callback attempt
    await auditLog({
      action: 'OSCAR_OAUTH_CALLBACK_RECEIVED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'oscar_oauth',
      details: {
        hasToken: !!oauthToken,
        hasVerifier: !!oauthVerifier,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.json(
        { 
          error: 'Missing OAuth parameters',
          details: 'OAuth token and verifier are required'
        },
        { status: 400 }
      )
    }

    // Initialize OAuth setup
    const oauthSetup = new OscarOAuthSetup()
    
    // Retrieve stored request token secret (you'll need to implement this storage)
    // For now, return instructions for manual completion
    const pendingTokens = await getPendingOAuthTokens(oauthToken)
    
    if (!pendingTokens) {
      await auditLog({
        action: 'OSCAR_OAUTH_CALLBACK_FAILED',
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        resource: 'oscar_oauth',
        details: {
          error: 'No pending OAuth request found',
          oauthToken: oauthToken.substring(0, 8) + '...'
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json(
        { 
          error: 'OAuth session not found',
          details: 'No pending OAuth request found for this token'
        },
        { status: 400 }
      )
    }

    // Complete OAuth flow
    const result = await oauthSetup.getAccessToken(
      oauthToken,
      pendingTokens.requestTokenSecret,
      oauthVerifier
    )

    if (!result.success) {
      await auditLog({
        action: 'OSCAR_OAUTH_TOKEN_EXCHANGE_FAILED',
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        resource: 'oscar_oauth',
        details: {
          error: result.error
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json(
        { 
          error: 'OAuth token exchange failed',
          details: result.error
        },
        { status: 500 }
      )
    }

    // Store the tokens securely (implement your preferred storage method)
    await storeOAuthTokens(result.tokens!)
    
    // Clean up pending tokens
    await clearPendingOAuthTokens(oauthToken)

    // Generate environment configuration
    const envConfig = oauthSetup.generateEnvConfig(result.tokens!)

    await auditLog({
      action: 'OSCAR_OAUTH_SETUP_COMPLETED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'oscar_oauth',
      details: {
        hasAccessToken: !!result.tokens?.accessToken,
        hasAccessTokenSecret: !!result.tokens?.accessTokenSecret
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Return success page with environment variables
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Oscar EMR OAuth Setup Complete</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .config { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            pre { margin: 0; }
            .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>🎉 Oscar EMR OAuth Setup Complete!</h1>
          
          <div class="success">
            <strong>Success!</strong> Your Oscar EMR OAuth credentials have been obtained successfully.
          </div>

          <h2>📋 Next Steps</h2>
          <p>Add these environment variables to your <code>.env</code> file:</p>
          
          <div class="config">
            <pre>${envConfig}</pre>
          </div>

          <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
              <li>Keep these credentials secure and never commit them to version control</li>
              <li>Store them in your production environment's secure configuration</li>
              <li>Consider using a secrets management service for production</li>
            </ul>
          </div>

          <h2>🔄 After Adding Environment Variables</h2>
          <ol>
            <li>Restart your development server</li>
            <li>Test the connection in your admin panel</li>
            <li>Verify patient intake integration is working</li>
          </ol>

          <p><a href="/admin/settings">← Return to Admin Settings</a></p>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    
    await auditLog({
      action: 'OSCAR_OAUTH_CALLBACK_ERROR',
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
        error: 'OAuth callback processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions (you'll need to implement these based on your preferred storage)
async function getPendingOAuthTokens(oauthToken: string) {
  // TODO: Implement retrieval of stored request token secret
  // This could be stored in database, Redis, or secure session storage
  
  // Example implementation using in-memory storage (matches setup route):
  if (typeof global !== 'undefined' && (global as any).pendingOAuthTokens) {
    return (global as any).pendingOAuthTokens.get(oauthToken) || null
  }
  
  return null
}

async function storeOAuthTokens(tokens: any) {
  // TODO: Implement secure storage of OAuth tokens
  // Consider storing in environment variables, database, or secrets manager
  console.log('TODO: Store OAuth tokens securely:', {
    accessToken: tokens.accessToken?.substring(0, 8) + '...',
    accessTokenSecret: tokens.accessTokenSecret?.substring(0, 8) + '...'
  })
}

async function clearPendingOAuthTokens(oauthToken: string) {
  // TODO: Implement cleanup of pending OAuth tokens
  
  // Example implementation using in-memory storage (matches setup route):
  if (typeof global !== 'undefined' && (global as any).pendingOAuthTokens) {
    (global as any).pendingOAuthTokens.delete(oauthToken)
  }
  
  console.log('Cleared pending OAuth token:', oauthToken.substring(0, 8) + '...')
} 