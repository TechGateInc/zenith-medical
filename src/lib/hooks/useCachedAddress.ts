import { useState, useEffect } from 'react';

interface CachedContactInfo {
  address: string;
  businessHours: string;
  primaryPhone: string;
  emergencyPhone?: string;
  faxNumber?: string;
  adminEmail: string;
}

interface UseCachedContactReturn {
  contactInfo: CachedContactInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCachedContact(): UseCachedContactReturn {
  const [contactInfo, setContactInfo] = useState<CachedContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contact-info');
      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }
      
      const data = await response.json();
      if (data.success) {
        setContactInfo({
          address: data.contactInfo.address,
          businessHours: data.contactInfo.businessHours,
          primaryPhone: data.contactInfo.primaryPhone,
          emergencyPhone: data.contactInfo.emergencyPhone,
          faxNumber: data.contactInfo.faxNumber,
          adminEmail: data.contactInfo.adminEmail
        });
      } else {
        throw new Error(data.error || 'Failed to fetch contact information');
      }
    } catch (err) {
      console.error('Error fetching contact info:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return {
    contactInfo,
    loading,
    error,
    refresh: fetchContactInfo
  };
}

// Convenience hooks for specific contact information
export function useCachedAddressOnly(): { address: string; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    address: contactInfo?.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3', // Fallback
    loading
  };
}

export function useCachedBusinessHours(): { businessHours: string; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    businessHours: contactInfo?.businessHours || 'Mon-Fri 8AM-6PM, Sat 9AM-2PM', // Fallback
    loading
  };
}

export function useCachedPrimaryPhone(): { primaryPhone: string; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    primaryPhone: contactInfo?.primaryPhone || '249 806 0128', // Fallback
    loading
  };
}

export function useCachedEmergencyPhone(): { emergencyPhone: string | undefined; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    emergencyPhone: contactInfo?.emergencyPhone,
    loading
  };
}

export function useCachedFaxNumber(): { faxNumber: string | undefined; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    faxNumber: contactInfo?.faxNumber,
    loading
  };
}

export function useCachedAdminEmail(): { adminEmail: string; loading: boolean } {
  const { contactInfo, loading } = useCachedContact();
  return {
    adminEmail: contactInfo?.adminEmail || 'admin@zenithmedical.ca', // Fallback
    loading
  };
}
