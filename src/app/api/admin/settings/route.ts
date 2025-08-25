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
          address: settings.address,
          businessHours: settings.businessHours,
          homepageImageUrl: settings.homepageImageUrl,
          appointmentBookingUrl: settings.appointmentBookingUrl,
          patientIntakeUrl: settings.patientIntakeUrl,
          whyChooseUsImageUrl: settings.whyChooseUsImageUrl,
          aboutMissionImageUrl: settings.aboutMissionImageUrl,
          servicesPaymentImageUrl: settings.servicesPaymentImageUrl
        },
        system: {
          timezone: settings.timezone,
          dateFormat: settings.dateFormat
        },

        security: {
          sessionTimeout: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          passwordExpiry: settings.passwordExpiry,
      
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
    const { contact, system, security } = body;

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

      if (contact.address) {
        updates.address = contact.address;
      }

      if (contact.homepageImageUrl !== undefined) {
        updates.homepageImageUrl = contact.homepageImageUrl || null;
      }

      if (contact.appointmentBookingUrl !== undefined) {
        updates.appointmentBookingUrl = contact.appointmentBookingUrl || null;
      }

      if (contact.patientIntakeUrl !== undefined) {
        updates.patientIntakeUrl = contact.patientIntakeUrl || null;
      }

      if (contact.whyChooseUsImageUrl !== undefined) {
        updates.whyChooseUsImageUrl = contact.whyChooseUsImageUrl || null;
      }

      if (contact.aboutMissionImageUrl !== undefined) {
        updates.aboutMissionImageUrl = contact.aboutMissionImageUrl || null;
      }

      if (contact.servicesPaymentImageUrl !== undefined) {
        updates.servicesPaymentImageUrl = contact.servicesPaymentImageUrl || null;
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
          address: updatedSettings.address,
          businessHours: updatedSettings.businessHours,
          homepageImageUrl: updatedSettings.homepageImageUrl,
          appointmentBookingUrl: updatedSettings.appointmentBookingUrl,
          patientIntakeUrl: updatedSettings.patientIntakeUrl
        },
        system: {
          timezone: updatedSettings.timezone,
          dateFormat: updatedSettings.dateFormat
        },

        security: {
          sessionTimeout: updatedSettings.sessionTimeout,
          maxLoginAttempts: updatedSettings.maxLoginAttempts,
          passwordExpiry: updatedSettings.passwordExpiry,

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