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
          businessHours: settings.businessHours
        },
        system: {
          timezone: settings.timezone,
          dateFormat: settings.dateFormat
        },
        maintenanceMode: settings.maintenanceMode
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
