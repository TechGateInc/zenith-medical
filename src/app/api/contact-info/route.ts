import { NextRequest, NextResponse } from 'next/server'
import { getCachedAddressInfo } from '@/lib/utils/address-cache'
import { settingsManager } from '@/lib/utils/settings'

export async function GET(request: NextRequest) {
  try {
    // Use cached address info for better performance
    const cachedInfo = await getCachedAddressInfo()
    const settings = await settingsManager.getSettings()
    
    return NextResponse.json({
      success: true,
      contactInfo: {
        primaryPhone: cachedInfo.primaryPhone,
        emergencyPhone: settings.emergencyPhone,
        faxNumber: settings.faxNumber,
        adminEmail: cachedInfo.adminEmail,
        businessHours: cachedInfo.businessHours,
        timezone: settings.timezone,
        address: cachedInfo.address
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
