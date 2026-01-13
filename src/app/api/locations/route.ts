import { NextResponse } from 'next/server'
import { getActiveLocations } from '@/lib/utils/location-content'

// GET active locations (public API)
export async function GET() {
  try {
    const locations = await getActiveLocations()
    return NextResponse.json({ success: true, locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
