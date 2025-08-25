import { NextResponse } from 'next/server'
import { getCachedContactInfo } from '@/lib/utils/address-cache'
import { settingsManager } from '@/lib/utils/settings'

export async function GET() {
  try {
    // Use cached contact info for better performance
    const cachedInfo = await getCachedContactInfo()
    const settings = await settingsManager.getSettings()
    
    return NextResponse.json({
      success: true,
      contactInfo: {
        primaryPhone: cachedInfo.primaryPhone,
        emergencyPhone: cachedInfo.emergencyPhone,
        faxNumber: cachedInfo.faxNumber,
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
