import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { validateEncryptionConfig, testEncryption } from '../../../../../lib/utils/encryption'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access this endpoint' },
        { status: 401 }
      )
    }

    // Only super admin can access debug endpoints
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only super administrators can access debug endpoints' },
        { status: 403 }
      )
    }

    // Validate encryption configuration
    const configValidation = validateEncryptionConfig()
    
    // Test encryption functionality
    const encryptionTest = testEncryption()
    
    // Check environment variables (without exposing their values)
    const envCheck = {
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      encryptionKeyLength: process.env.ENCRYPTION_KEY?.length || 0,
      hasEncryptionIV: !!process.env.ENCRYPTION_IV,
      encryptionIVLength: process.env.ENCRYPTION_IV?.length || 0
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        isValid: configValidation.isValid,
        errors: configValidation.errors
      },
      test: {
        isWorking: encryptionTest.isWorking,
        error: encryptionTest.error
      },
      environment: envCheck,
      overall: {
        healthy: configValidation.isValid && encryptionTest.isWorking,
        summary: configValidation.isValid && encryptionTest.isWorking 
          ? 'Encryption system is working correctly'
          : 'Encryption system has issues that need attention'
      }
    })

  } catch (error) {
    console.error('Encryption debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to check encryption status'
      },
      { status: 500 }
    )
  }
}