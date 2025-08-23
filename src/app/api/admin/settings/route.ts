/**
 * Admin Settings API
 * Manages system configuration and administrative settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { settingsManager } from '@/lib/utils/settings';
import type { SystemSettings } from '@/lib/utils/settings';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to verify current role
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from database
    const settings = await settingsManager.getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        contact: {
          primaryPhone: settings.primaryPhone,
          emergencyPhone: settings.emergencyPhone,
          faxNumber: settings.faxNumber,
          adminEmail: settings.adminEmail,
          businessHours: settings.businessHours
        },
        system: {
          timezone: settings.timezone,
          dateFormat: settings.dateFormat
        },
        notifications: {
          emailNotifications: settings.emailNotifications,
          appointmentReminders: settings.appointmentReminders,
          securityAlerts: settings.securityAlerts,
          maintenanceMode: settings.maintenanceMode,
          contactFormEnabled: settings.contactFormEnabled
        },
        security: {
          sessionTimeout: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          passwordExpiry: settings.passwordExpiry,
          twoFactorAuth: settings.twoFactorAuth,
          ipWhitelist: settings.ipWhitelist
        }
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to verify current role
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contact, system, notifications, security } = body;

    const updates: Partial<SystemSettings> = {};

    // Validate and prepare contact settings updates
    if (contact) {
      if (contact.primaryPhone) {
        // Basic phone validation
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(contact.primaryPhone)) {
          return NextResponse.json(
            { error: 'Invalid primary phone number format' },
            { status: 400 }
          );
        }
        updates.primaryPhone = contact.primaryPhone;
      }

      if (contact.emergencyPhone !== undefined) {
        if (contact.emergencyPhone) {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(contact.emergencyPhone)) {
            return NextResponse.json(
              { error: 'Invalid emergency phone number format' },
              { status: 400 }
            );
          }
        }
        updates.emergencyPhone = contact.emergencyPhone || null;
      }

      if (contact.faxNumber !== undefined) {
        if (contact.faxNumber) {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(contact.faxNumber)) {
            return NextResponse.json(
              { error: 'Invalid fax number format' },
              { status: 400 }
            );
          }
        }
        updates.faxNumber = contact.faxNumber || null;
      }

      if (contact.adminEmail) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.adminEmail)) {
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );
        }
        updates.adminEmail = contact.adminEmail;
      }

      if (contact.businessHours) {
        updates.businessHours = contact.businessHours;
      }
    }

    // Validate and prepare system settings updates
    if (system) {
      if (system.timezone) {
        updates.timezone = system.timezone;
      }
      if (system.dateFormat) {
        updates.dateFormat = system.dateFormat;
      }
    }

    // Validate and prepare notification settings updates
    if (notifications) {
      if (typeof notifications.emailNotifications === 'boolean') {
        updates.emailNotifications = notifications.emailNotifications;
      }
      if (typeof notifications.appointmentReminders === 'boolean') {
        updates.appointmentReminders = notifications.appointmentReminders;
      }
      if (typeof notifications.securityAlerts === 'boolean') {
        updates.securityAlerts = notifications.securityAlerts;
      }
      if (typeof notifications.maintenanceMode === 'boolean') {
        updates.maintenanceMode = notifications.maintenanceMode;
      }
      if (typeof notifications.contactFormEnabled === 'boolean') {
        updates.contactFormEnabled = notifications.contactFormEnabled;
      }
    }

    // Validate and prepare security settings updates
    if (security) {
      if (typeof security.sessionTimeout === 'number' && security.sessionTimeout > 0) {
        updates.sessionTimeout = security.sessionTimeout;
      }
      if (typeof security.maxLoginAttempts === 'number' && security.maxLoginAttempts > 0) {
        updates.maxLoginAttempts = security.maxLoginAttempts;
      }
      if (typeof security.passwordExpiry === 'number' && security.passwordExpiry > 0) {
        updates.passwordExpiry = security.passwordExpiry;
      }
      if (typeof security.twoFactorAuth === 'boolean') {
        updates.twoFactorAuth = security.twoFactorAuth;
      }
      if (typeof security.ipWhitelist === 'string') {
        updates.ipWhitelist = security.ipWhitelist;
      }
    }

    // Update settings in database
    const updatedSettings = await settingsManager.updateSettings(updates, user.id);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        contact: {
          primaryPhone: updatedSettings.primaryPhone,
          emergencyPhone: updatedSettings.emergencyPhone,
          faxNumber: updatedSettings.faxNumber,
          adminEmail: updatedSettings.adminEmail,
          businessHours: updatedSettings.businessHours
        },
        system: {
          timezone: updatedSettings.timezone,
          dateFormat: updatedSettings.dateFormat
        },
        notifications: {
          emailNotifications: updatedSettings.emailNotifications,
          appointmentReminders: updatedSettings.appointmentReminders,
          securityAlerts: updatedSettings.securityAlerts,
          maintenanceMode: updatedSettings.maintenanceMode,
          contactFormEnabled: updatedSettings.contactFormEnabled
        },
        security: {
          sessionTimeout: updatedSettings.sessionTimeout,
          maxLoginAttempts: updatedSettings.maxLoginAttempts,
          passwordExpiry: updatedSettings.passwordExpiry,
          twoFactorAuth: updatedSettings.twoFactorAuth,
          ipWhitelist: updatedSettings.ipWhitelist
        }
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