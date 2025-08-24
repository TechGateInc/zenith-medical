import React from 'react';
import { useCachedAddressOnly, useCachedPrimaryPhone, useCachedAdminEmail, useCachedBusinessHours } from '@/lib/hooks/useCachedAddress';

/**
 * Demo component showing how to use the new address caching functionality
 * This component demonstrates the various hooks available for fetching cached address information
 */
export default function AddressDemo() {
  const { address, loading: addressLoading } = useCachedAddressOnly();
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();
  const { adminEmail, loading: emailLoading } = useCachedAdminEmail();
  const { businessHours, loading: hoursLoading } = useCachedBusinessHours();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information (Cached)</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Address</h3>
          <p className="text-gray-900">
            {addressLoading ? 'Loading...' : address}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Phone</h3>
          <p className="text-gray-900">
            {phoneLoading ? 'Loading...' : primaryPhone}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Email</h3>
          <p className="text-gray-900">
            {emailLoading ? 'Loading...' : adminEmail}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Business Hours</h3>
          <p className="text-gray-900">
            {hoursLoading ? 'Loading...' : businessHours}
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Benefits of this caching system:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• 10-minute cache duration for better performance</li>
          <li>• Automatic cache invalidation when settings are updated</li>
          <li>• Fallback values if database is unavailable</li>
          <li>• Individual hooks for specific data needs</li>
        </ul>
      </div>
    </div>
  );
}
