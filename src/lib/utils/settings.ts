import { prisma } from '@/lib/prisma';
import { clearContactCache } from './address-cache';

export interface SystemSettings {
  id: string;
  primaryPhone: string;
  emergencyPhone?: string;
  faxNumber?: string;
  adminEmail: string;
  address: string;
  businessHours: string;
  timezone: string;
  dateFormat: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;
  ipWhitelist?: string;
  homepageImageUrl?: string;
  appointmentBookingUrl?: string;
  patientIntakeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

// Cache for settings to avoid repeated database calls
let settingsCache: SystemSettings | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class SettingsManager {
  private static instance: SettingsManager;

  private constructor() {}

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Get system settings with caching
   */
  async getSettings(): Promise<SystemSettings> {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (settingsCache && now < cacheExpiry) {
      return settingsCache;
    }

    try {
      // Get settings from database
      let settings = await prisma.systemSettings.findFirst({
        where: { id: 'default-settings' }
      });

      // If no settings exist, create default ones
      if (!settings) {
        settings = await prisma.systemSettings.create({
          data: {
            id: 'default-settings',
            primaryPhone: '249 806 0128',
            adminEmail: 'admin@zenithmedical.ca',
            address: 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3',
            businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
            timezone: 'America/Toronto',
            dateFormat: 'MM/DD/YYYY',

            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordExpiry: 90,

          }
        });
      }

      // Update cache
      settingsCache = settings as SystemSettings;
      cacheExpiry = now + CACHE_DURATION;

      return settingsCache;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      
      // Return fallback settings if database fails
      return {
        id: 'fallback',
        primaryPhone: '249 806 0128',
        adminEmail: 'admin@zenithmedical.ca',
        address: 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3',
        businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
        timezone: 'America/Toronto',
        dateFormat: 'MM/DD/YYYY',

        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        homepageImageUrl: '/images/home.webp',
        appointmentBookingUrl: 'https://zenithmedical.cortico.ca/',
        patientIntakeUrl: 'https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * Update system settings
   */
  async updateSettings(updates: Partial<SystemSettings>, updatedBy?: string): Promise<SystemSettings> {
    try {
      const settings = await prisma.systemSettings.upsert({
        where: { id: 'default-settings' },
        update: {
          ...updates,
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          id: 'default-settings',
          primaryPhone: '249 806 0128',
          adminEmail: 'admin@zenithmedical.ca',
          businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
          timezone: 'America/Toronto',
          dateFormat: 'MM/DD/YYYY',

          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordExpiry: 90,
          updatedBy,
          ...updates
        }
      });

      // Clear cache to force refresh
      settingsCache = null;
      cacheExpiry = 0;
      
      // Clear contact cache as well
      clearContactCache();

      return settings as SystemSettings;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  /**
   * Clear settings cache
   */
  clearCache(): void {
    settingsCache = null;
    cacheExpiry = 0;
  }

  /**
   * Get primary phone number
   */
  async getPrimaryPhone(): Promise<string> {
    const settings = await this.getSettings();
    return settings.primaryPhone;
  }

  /**
   * Get emergency phone number
   */
  async getEmergencyPhone(): Promise<string | undefined> {
    const settings = await this.getSettings();
    return settings.emergencyPhone;
  }

  /**
   * Get admin email
   */
  async getAdminEmail(): Promise<string> {
    const settings = await this.getSettings();
    return settings.adminEmail;
  }



  /**
   * Get business address
   */
  async getAddress(): Promise<string> {
    const settings = await this.getSettings();
    return settings.address;
  }

  /**
   * Get business hours
   */
  async getBusinessHours(): Promise<string> {
    const settings = await this.getSettings();
    return settings.businessHours;
  }
}

// Export singleton instance
export const settingsManager = SettingsManager.getInstance();

// Convenience functions for common settings
export async function getPrimaryPhone(): Promise<string> {
  return settingsManager.getPrimaryPhone();
}

export async function getEmergencyPhone(): Promise<string | undefined> {
  return settingsManager.getEmergencyPhone();
}

export async function getAdminEmail(): Promise<string> {
  return settingsManager.getAdminEmail();
}



export async function getAddress(): Promise<string> {
  return settingsManager.getAddress();
}

export async function getBusinessHours(): Promise<string> {
  return settingsManager.getBusinessHours();
}
