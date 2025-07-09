/**
 * Admin Settings API
 * Manages system configuration and administrative settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// In a real application, these would be stored in a database
// For now, we'll use in-memory storage (resets on server restart)
const systemSettings = {
  siteName: 'Zenith Medical Centre',
  siteDescription: 'Comprehensive healthcare services for the community',
  adminEmail: 'admin@zenithmedical.com',
  timezone: 'America/Toronto',
  dateFormat: 'MM/DD/YYYY',
  language: 'en'
};

let notificationSettings = {
  emailNotifications: true,
  appointmentReminders: true,
  securityAlerts: true,
  maintenanceMode: false
};

let securitySettings = {
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordExpiry: 90,
  twoFactorAuth: false,
  ipWhitelist: ''
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        system: systemSettings,
        notifications: notificationSettings,
        security: securitySettings
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { system, notifications, security } = body;

    // Validate and update system settings
    if (system) {
      if (system.siteName) systemSettings.siteName = system.siteName;
      if (system.siteDescription) systemSettings.siteDescription = system.siteDescription;
      if (system.adminEmail) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(system.adminEmail)) {
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );
        }
        systemSettings.adminEmail = system.adminEmail;
      }
      if (system.timezone) systemSettings.timezone = system.timezone;
      if (system.dateFormat) systemSettings.dateFormat = system.dateFormat;
      if (system.language) systemSettings.language = system.language;
    }

    // Update notification settings
    if (notifications) {
      if (typeof notifications.emailNotifications === 'boolean') {
        notificationSettings.emailNotifications = notifications.emailNotifications;
      }
      if (typeof notifications.appointmentReminders === 'boolean') {
        notificationSettings.appointmentReminders = notifications.appointmentReminders;
      }
      if (typeof notifications.securityAlerts === 'boolean') {
        notificationSettings.securityAlerts = notifications.securityAlerts;
      }
      if (typeof notifications.maintenanceMode === 'boolean') {
        notificationSettings.maintenanceMode = notifications.maintenanceMode;
      }
    }

    // Update security settings
    if (security) {
      if (typeof security.sessionTimeout === 'number' && security.sessionTimeout > 0) {
        securitySettings.sessionTimeout = security.sessionTimeout;
      }
      if (typeof security.maxLoginAttempts === 'number' && security.maxLoginAttempts > 0) {
        securitySettings.maxLoginAttempts = security.maxLoginAttempts;
      }
      if (typeof security.passwordExpiry === 'number' && security.passwordExpiry > 0) {
        securitySettings.passwordExpiry = security.passwordExpiry;
      }
      if (typeof security.twoFactorAuth === 'boolean') {
        securitySettings.twoFactorAuth = security.twoFactorAuth;
      }
      if (typeof security.ipWhitelist === 'string') {
        securitySettings.ipWhitelist = security.ipWhitelist;
      }
    }

    // In a real application, you would save these to a database here
    // await prisma.settings.upsert({...})

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        system: systemSettings,
        notifications: notificationSettings,
        security: securitySettings
      }
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 