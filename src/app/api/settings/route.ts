/**
 * Public Settings API
 * Provides public access to system settings without authentication
 */

import { NextResponse } from 'next/server';
import { settingsManager } from '@/lib/utils/settings';

export async function GET() {
  try {
    // Get settings from database
    const settings = await settingsManager.getSettings();

    // Return only the settings that should be publicly accessible
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
          appointmentBookingUrl: settings.appointmentBookingUrl,
          patientIntakeUrl: settings.patientIntakeUrl,
          acceptingNewPatients: settings.acceptingNewPatients
        },
        system: {
          timezone: settings.timezone,
          dateFormat: settings.dateFormat
        },
        announcement: {
          announcementEnabled: settings.announcementEnabled,
          announcementTitle: settings.announcementTitle,
          announcementMessage: settings.announcementMessage,
          announcementType: settings.announcementType,
          announcementDisplay: settings.announcementDisplay
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
