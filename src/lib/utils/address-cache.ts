import { settingsManager } from './settings';

// Cache for contact information (including phone numbers)
let contactCache: {
  address: string;
  businessHours: string;
  primaryPhone: string;
  emergencyPhone?: string;
  faxNumber?: string;
  adminEmail: string;
} | null = null;

let cacheExpiry: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached contact information
 */
export async function getCachedContactInfo() {
  const now = Date.now();
  
  // Return cached contact info if still valid
  if (contactCache && now < cacheExpiry) {
    return contactCache;
  }

  try {
    const settings = await settingsManager.getSettings();
    
    // Update cache
    contactCache = {
      address: settings.address,
      businessHours: settings.businessHours,
      primaryPhone: settings.primaryPhone,
      emergencyPhone: settings.emergencyPhone,
      faxNumber: settings.faxNumber,
      adminEmail: settings.adminEmail
    };
    cacheExpiry = now + CACHE_DURATION;

    return contactCache;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    
    // Return fallback values if database fails
    return {
      address: 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3',
      businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
      primaryPhone: '249 806 0128',
      emergencyPhone: undefined,
      faxNumber: undefined,
      adminEmail: 'admin@zenithmedical.ca'
    };
  }
}

/**
 * Get cached address
 */
export async function getCachedAddress(): Promise<string> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.address;
}

/**
 * Get cached business hours
 */
export async function getCachedBusinessHours(): Promise<string> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.businessHours;
}

/**
 * Get cached primary phone
 */
export async function getCachedPrimaryPhone(): Promise<string> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.primaryPhone;
}

/**
 * Get cached emergency phone
 */
export async function getCachedEmergencyPhone(): Promise<string | undefined> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.emergencyPhone;
}

/**
 * Get cached fax number
 */
export async function getCachedFaxNumber(): Promise<string | undefined> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.faxNumber;
}

/**
 * Get cached admin email
 */
export async function getCachedAdminEmail(): Promise<string> {
  const contactInfo = await getCachedContactInfo();
  return contactInfo.adminEmail;
}

/**
 * Clear contact cache
 */
export function clearContactCache(): void {
  contactCache = null;
  cacheExpiry = 0;
}

/**
 * Force refresh contact cache
 */
export async function refreshContactCache() {
  clearContactCache();
  return await getCachedContactInfo();
}
