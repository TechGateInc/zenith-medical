import { useState, useEffect } from 'react'

interface ContactInfo {
  primaryPhone: string
  emergencyPhone?: string
  faxNumber?: string
  adminEmail: string
  businessHours: string
  timezone: string
  address: string
}

interface UseContactInfoReturn {
  contactInfo: ContactInfo | null
  loading: boolean
  error: string | null
}

export function useContactInfo(): UseContactInfoReturn {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/contact-info')
        if (!response.ok) {
          throw new Error('Failed to fetch contact information')
        }
        
        const data = await response.json()
        if (data.success) {
          setContactInfo(data.contactInfo)
        } else {
          throw new Error(data.error || 'Failed to fetch contact information')
        }
      } catch (err) {
        console.error('Error fetching contact info:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  return { contactInfo, loading, error }
}

// Convenience hooks for specific contact information
export function usePrimaryPhone(): { phone: string; loading: boolean } {
  const { contactInfo, loading } = useContactInfo()
  return {
    phone: contactInfo?.primaryPhone || '249 806 0128', // Fallback
    loading
  }
}

export function useAdminEmail(): { email: string; loading: boolean } {
  const { contactInfo, loading } = useContactInfo()
  return {
    email: contactInfo?.adminEmail || 'admin@zenithmedical.ca', // Fallback
    loading
  }
}

export function useBusinessHours(): { hours: string; loading: boolean } {
  const { contactInfo, loading } = useContactInfo()
  return {
    hours: contactInfo?.businessHours || 'Mon-Fri 8AM-6PM', // Fallback
    loading
  }
}

export function useAddress(): { address: string; loading: boolean } {
  const { contactInfo, loading } = useContactInfo()
  return {
    address: contactInfo?.address || 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3', // Fallback
    loading
  }
}
