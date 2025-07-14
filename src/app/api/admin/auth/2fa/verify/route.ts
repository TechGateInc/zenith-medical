import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit/audit-logger';
import speakeasy from 'speakeasy';

export async function POST(request: NextRequest) {
  try {
    const { email, token, isBackupCode = false } = await request.json();
    
    if (!email || !token) {
      return NextResponse.json({ 
        error: 'Email and verification token are required' 
      }, { status: 400 });
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ 
        error: 'Two-factor authentication is not enabled' 
      }, { status: 400 });
    }

    let verified = false;
    let usedBackupCode = false;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = user.twoFactorBackupCodes || [];
      if (backupCodes.includes(token.toUpperCase())) {
        verified = true;
        usedBackupCode = true;
        
        // Remove the used backup code
        const updatedBackupCodes = backupCodes.filter(code => code !== token.toUpperCase());
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: updatedBackupCodes }
        });
      }
    } else {
      // Verify TOTP token
      if (user.twoFactorSecret) {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 2 // Allow 2 time steps before and after
        });
      }
    }

    if (!verified) {
      // Log failed verification
      await auditLog({
        action: 'TWO_FACTOR_LOGIN_FAILED',
        userId: user.id,
        userEmail: user.email,
        details: {
          success: false,
          reason: 'invalid_token',
          isBackupCode
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      return NextResponse.json({ 
        success: false,
        error: 'Invalid verification code' 
      }, { status: 400 });
    }

    // Log successful verification
    await auditLog({
      action: 'TWO_FACTOR_LOGIN_SUCCESS',
      userId: user.id,
      userEmail: user.email,
      details: {
        success: true,
        isBackupCode,
        usedBackupCode
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify 2FA'
    }, { status: 500 });
  }
} 