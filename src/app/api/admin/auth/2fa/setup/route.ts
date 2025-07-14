import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit/audit-logger';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        twoFactorEnabled: true, 
        twoFactorSecret: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json({ 
        error: 'Two-factor authentication is already enabled' 
      }, { status: 400 });
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Zenith Medical Centre (${user.email})`,
      issuer: 'Zenith Medical Centre',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store the temporary secret (not enabled yet)
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false // Will be enabled after verification
      }
    });

    // Log the 2FA setup initiation
    await auditLog({
      action: 'TWO_FACTOR_SETUP_INITIATED',
      userId: user.id,
      userEmail: user.email,
      details: {
        success: true,
        setupStage: 'secret_generated'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes: generateBackupCodes(), // Generate backup codes
      message: 'Scan the QR code with your authenticator app'
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to setup 2FA'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        twoFactorSecret: true,
        twoFactorEnabled: true
      }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'No 2FA setup in progress' }, { status: 400 });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before and after
    });

    if (!verified) {
      // Log failed verification
      await auditLog({
        action: 'TWO_FACTOR_VERIFICATION_FAILED',
        userId: user.id,
        userEmail: user.email,
        details: {
          success: false,
          reason: 'invalid_token'
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      return NextResponse.json({ 
        success: false,
        error: 'Invalid verification code' 
      }, { status: 400 });
    }

    // Enable 2FA
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: generateBackupCodes()
      }
    });

    // Log successful 2FA setup
    await auditLog({
      action: 'TWO_FACTOR_ENABLED',
      userId: user.id,
      userEmail: user.email,
      details: {
        success: true,
        setupCompleted: true
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      backupCodes: generateBackupCodes()
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify 2FA'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Password required to disable 2FA' }, { status: 400 });
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    // Disable 2FA
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: []
      }
    });

    // Log 2FA disable
    await auditLog({
      action: 'TWO_FACTOR_DISABLED',
      userId: user.id,
      userEmail: user.email,
      details: {
        success: true,
        disabledBy: 'user'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disable 2FA'
    }, { status: 500 });
  }
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
  }
  return codes;
} 