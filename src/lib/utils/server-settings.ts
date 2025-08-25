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
 * Get homepage image URL (server-side)
 */
export async function getHomepageImageUrl(): Promise<string> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.homepageImageUrl || '/images/home.webp';
  } catch (error) {
    console.error('Error getting homepage image URL:', error);
    return '/images/home.webp'; // Fallback
  }
}

/**
 * Get appointment booking URL (server-side)
 */
export async function getAppointmentBookingUrl(): Promise<string> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.appointmentBookingUrl || 'https://zenithmedical.cortico.ca/';
  } catch (error) {
    console.error('Error getting appointment booking URL:', error);
    return 'https://zenithmedical.cortico.ca/'; // Fallback
  }
}

/**
 * Get patient intake URL (server-side)
 */
export async function getPatientIntakeUrl(): Promise<string> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.patientIntakeUrl || 'https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227';
  } catch (error) {
    console.error('Error getting patient intake URL:', error);
    return 'https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227'; // Fallback
  }
}

/**
 * Get Why Choose Us section image URL (server-side)
 */
export async function getWhyChooseUsImageUrl(): Promise<string | undefined> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.whyChooseUsImageUrl;
  } catch (error) {
    console.error('Error getting Why Choose Us image URL:', error);
    return undefined;
  }
}

/**
 * Get About Mission section image URL (server-side)
 */
export async function getAboutMissionImageUrl(): Promise<string | undefined> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.aboutMissionImageUrl;
  } catch (error) {
    console.error('Error getting About Mission image URL:', error);
    return undefined;
  }
}

/**
 * Get Services Payment section image URL (server-side)
 */
export async function getServicesPaymentImageUrl(): Promise<string | undefined> {
  try {
    const settings = await settingsManager.getSettings();
    return settings.servicesPaymentImageUrl;
  } catch (error) {
    console.error('Error getting Services Payment image URL:', error);
    return undefined;
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
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      homepageImageUrl: '/images/home.webp',
      appointmentBookingUrl: 'https://zenithmedical.cortico.ca/',
      patientIntakeUrl: 'https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227',
      ipWhitelist: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
