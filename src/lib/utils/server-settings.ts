import { settingsManager } from './settings';

/**
 * Get primary phone number (server-side)
 */
export async function getPrimaryPhone(): Promise<string> {
  try {
    return await settingsManager.getPrimaryPhone();
  } catch (error) {
    console.error('Error getting primary phone:', error);
    return '249 806 0128'; // Fallback
  }
}

/**
 * Get emergency phone number (server-side)
 */
export async function getEmergencyPhone(): Promise<string | undefined> {
  try {
    return await settingsManager.getEmergencyPhone();
  } catch (error) {
    console.error('Error getting emergency phone:', error);
    return undefined;
  }
}

/**
 * Get admin email (server-side)
 */
export async function getAdminEmail(): Promise<string> {
  try {
    return await settingsManager.getAdminEmail();
  } catch (error) {
    console.error('Error getting admin email:', error);
    return 'admin@zenithmedical.ca'; // Fallback
  }
}

/**
 * Get business hours (server-side)
 */
export async function getBusinessHours(): Promise<string> {
  try {
    return await settingsManager.getBusinessHours();
  } catch (error) {
    console.error('Error getting business hours:', error);
    return 'Mon-Fri 8AM-6PM, Sat 9AM-2PM'; // Fallback
  }
}

/**
 * Get business address (server-side)
 */
export async function getAddress(): Promise<string> {
  try {
    return await settingsManager.getAddress();
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3'; // Fallback
  }
}

/**
 * Check if maintenance mode is enabled (server-side)
 */


/**
 * Get all settings (server-side)
 */
export async function getAllSettings() {
  try {
    return await settingsManager.getSettings();
  } catch (error) {
    console.error('Error getting all settings:', error);
    // Return fallback settings
    return {
      id: 'fallback',
      primaryPhone: '249 806 0128',
      emergencyPhone: undefined,
      faxNumber: undefined,
      adminEmail: 'admin@zenithmedical.ca',
      businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
      timezone: 'America/Toronto',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      appointmentReminders: true,
      securityAlerts: true,
      maintenanceMode: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
    
      ipWhitelist: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
