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

            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordExpiry: 90,
          
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

// Convenience hook for getting address
export function useAddress(): { address: string; loading: boolean } {
  const { settings, loading } = useSettings();
  
  return {
    address: settings?.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3', // Fallback
    loading
  };
}

// Convenience hook for getting business hours
export function useBusinessHours(): { businessHours: string; loading: boolean } {
  const { settings, loading } = useSettings();
  
  return {
    businessHours: settings?.businessHours || 'Mon-Fri 8AM-6PM, Sat 9AM-2PM', // Fallback
    loading
  };
}

// Cache for appointment URLs
let appointmentUrlsCache: {
  appointmentBookingUrl: string;
  patientIntakeUrl: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the appointment URLs cache
 */
export function clearAppointmentUrlsCache() {
  appointmentUrlsCache = null;
}

/**
 * Hook to get appointment booking and patient intake URLs with caching
 */
export function useAppointmentUrls() {
  const [appointmentBookingUrl, setAppointmentBookingUrl] = useState<string>('https://zenithmedical.cortico.ca/')
  const [patientIntakeUrl, setPatientIntakeUrl] = useState<string>('https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUrls = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first (unless forcing refresh)
      if (!forceRefresh && appointmentUrlsCache && (Date.now() - appointmentUrlsCache.timestamp) < CACHE_DURATION) {
        setAppointmentBookingUrl(appointmentUrlsCache.appointmentBookingUrl)
        setPatientIntakeUrl(appointmentUrlsCache.patientIntakeUrl)
        setLoading(false)
        return
      }

      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        const newAppointmentBookingUrl = data.settings?.contact?.appointmentBookingUrl || 'https://zenithmedical.cortico.ca/'
        const newPatientIntakeUrl = data.settings?.contact?.patientIntakeUrl || 'https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227'

        // Update cache
        appointmentUrlsCache = {
          appointmentBookingUrl: newAppointmentBookingUrl,
          patientIntakeUrl: newPatientIntakeUrl,
          timestamp: Date.now()
        }

        setAppointmentBookingUrl(newAppointmentBookingUrl)
        setPatientIntakeUrl(newPatientIntakeUrl)
      } else {
        throw new Error('Failed to fetch appointment URLs')
      }
    } catch (error) {
      console.error('Failed to fetch appointment URLs:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()

    // Listen for settings updates to refresh cache
    const handleSettingsUpdate = () => {
      appointmentUrlsCache = null // Clear cache
      fetchUrls(true) // Force refresh
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate)
    }
  }, [])

  return { 
    appointmentBookingUrl, 
    patientIntakeUrl, 
    loading, 
    error,
    refresh: () => fetchUrls(true)
  }
}


