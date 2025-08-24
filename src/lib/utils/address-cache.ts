import { settingsManager } from './settings';

// Cache for address information
let addressCache: {
  address: string;
  businessHours: string;
  primaryPhone: string;
  adminEmail: string;
} | null = null;

let cacheExpiry: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached address information
 */
export async function getCachedAddressInfo() {
  const now = Date.now();
  
  // Return cached address if still valid
  if (addressCache && now < cacheExpiry) {
    return addressCache;
  }

  try {
    const settings = await settingsManager.getSettings();
    
    // Update cache
    addressCache = {
      address: settings.address,
      businessHours: settings.businessHours,
      primaryPhone: settings.primaryPhone,
      adminEmail: settings.adminEmail
    };
    cacheExpiry = now + CACHE_DURATION;

    return addressCache;
  } catch (error) {
    console.error('Error fetching address info:', error);
    
    // Return fallback values if database fails
    return {
      address: 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3',
      businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
      primaryPhone: '249 806 0128',
      adminEmail: 'admin@zenithmedical.ca'
    };
  }
}

/**
 * Get cached address
 */
export async function getCachedAddress(): Promise<string> {
  const addressInfo = await getCachedAddressInfo();
  return addressInfo.address;
}

/**
 * Get cached business hours
 */
export async function getCachedBusinessHours(): Promise<string> {
  const addressInfo = await getCachedAddressInfo();
  return addressInfo.businessHours;
}

/**
 * Get cached primary phone
 */
export async function getCachedPrimaryPhone(): Promise<string> {
  const addressInfo = await getCachedAddressInfo();
  return addressInfo.primaryPhone;
}

/**
 * Get cached admin email
 */
export async function getCachedAdminEmail(): Promise<string> {
  const addressInfo = await getCachedAddressInfo();
  return addressInfo.adminEmail;
}

/**
 * Clear address cache
 */
export function clearAddressCache(): void {
  addressCache = null;
  cacheExpiry = 0;
}

/**
 * Force refresh address cache
 */
export async function refreshAddressCache() {
  clearAddressCache();
  return await getCachedAddressInfo();
}
