import { NextRequest, NextResponse } from 'next/server'
import { settingsManager } from '@/lib/utils/settings'

export async function GET(request: NextRequest) {
  try {
    const settings = await settingsManager.getSettings()
    
    return NextResponse.json({
      success: true,
      contactInfo: {
        primaryPhone: settings.primaryPhone,
        emergencyPhone: settings.emergencyPhone,
        faxNumber: settings.faxNumber,
        adminEmail: settings.adminEmail,
        businessHours: settings.businessHours,
        timezone: settings.timezone,
        address: settings.address
      }
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch contact information' 
    }, { status: 500 })
  }
}
