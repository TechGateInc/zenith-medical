import { useState, useEffect } from 'react';

interface CachedAddressInfo {
  address: string;
  businessHours: string;
  primaryPhone: string;
  adminEmail: string;
}

interface UseCachedAddressReturn {
  addressInfo: CachedAddressInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCachedAddress(): UseCachedAddressReturn {
  const [addressInfo, setAddressInfo] = useState<CachedAddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contact-info');
      if (!response.ok) {
        throw new Error('Failed to fetch address information');
      }
      
      const data = await response.json();
      if (data.success) {
        setAddressInfo({
          address: data.contactInfo.address,
          businessHours: data.contactInfo.businessHours,
          primaryPhone: data.contactInfo.primaryPhone,
          adminEmail: data.contactInfo.adminEmail
        });
      } else {
        throw new Error(data.error || 'Failed to fetch address information');
      }
    } catch (err) {
      console.error('Error fetching address info:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddressInfo();
  }, []);

  return {
    addressInfo,
    loading,
    error,
    refresh: fetchAddressInfo
  };
}

// Convenience hooks for specific address information
export function useCachedAddressOnly(): { address: string; loading: boolean } {
  const { addressInfo, loading } = useCachedAddress();
  return {
    address: addressInfo?.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3', // Fallback
    loading
  };
}

export function useCachedBusinessHours(): { businessHours: string; loading: boolean } {
  const { addressInfo, loading } = useCachedAddress();
  return {
    businessHours: addressInfo?.businessHours || 'Mon-Fri 8AM-6PM, Sat 9AM-2PM', // Fallback
    loading
  };
}

export function useCachedPrimaryPhone(): { primaryPhone: string; loading: boolean } {
  const { addressInfo, loading } = useCachedAddress();
  return {
    primaryPhone: addressInfo?.primaryPhone || '249 806 0128', // Fallback
    loading
  };
}

export function useCachedAdminEmail(): { adminEmail: string; loading: boolean } {
  const { addressInfo, loading } = useCachedAddress();
  return {
    adminEmail: addressInfo?.adminEmail || 'admin@zenithmedical.ca', // Fallback
    loading
  };
}
