import { useState, useEffect } from 'react';
import type { SystemSettings } from '@/lib/utils/settings';

interface UseSettingsReturn {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the API response to match SystemSettings interface
          const transformedSettings: SystemSettings = {
            id: 'default-settings',
            primaryPhone: data.settings.contact.primaryPhone,
            emergencyPhone: data.settings.contact.emergencyPhone,
            faxNumber: data.settings.contact.faxNumber,
            adminEmail: data.settings.contact.adminEmail,
            address: data.settings.contact.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3',
            businessHours: data.settings.contact.businessHours,
            timezone: data.settings.system.timezone,
            dateFormat: data.settings.system.dateFormat,
            emailNotifications: true, // Default values for public settings
            appointmentReminders: true,
            securityAlerts: true,
            maintenanceMode: data.settings.maintenanceMode,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordExpiry: 90,
            twoFactorAuth: false,
            ipWhitelist: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setSettings(transformedSettings);
        } else {
          throw new Error(data.error || 'Failed to fetch settings');
        }
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refresh
  };
}

// Convenience hook for getting just the phone number
export function usePhoneNumber(): { phoneNumber: string; loading: boolean } {
  const { settings, loading } = useSettings();
  
  return {
    phoneNumber: settings?.primaryPhone || '249 806 0128', // Fallback
    loading
  };
}

// Convenience hook for getting admin email
export function useAdminEmail(): { adminEmail: string; loading: boolean } {
  const { settings, loading } = useSettings();
  
  return {
    adminEmail: settings?.adminEmail || 'admin@zenithmedical.ca', // Fallback
    loading
  };
}
