# Address Caching System

This document describes the new address caching system implemented to improve performance and provide consistent access to address information throughout the application.

## Overview

The address caching system provides:
- **10-minute cache duration** for better performance
- **Automatic cache invalidation** when settings are updated
- **Fallback values** if database is unavailable
- **Individual hooks** for specific data needs
- **Server-side caching** for API endpoints

## Architecture

### 1. Settings Manager (`src/lib/utils/settings.ts`)
The core settings manager now includes address-specific methods:

```typescript
// Get business address
async getAddress(): Promise<string>

// Get business hours  
async getBusinessHours(): Promise<string>

// Convenience functions
export async function getAddress(): Promise<string>
export async function getBusinessHours(): Promise<string>
```

### 2. Address Cache (`src/lib/utils/address-cache.ts`)
Dedicated caching layer for address information:

```typescript
// Get cached address information
export async function getCachedAddressInfo()

// Individual cached getters
export async function getCachedAddress(): Promise<string>
export async function getCachedBusinessHours(): Promise<string>
export async function getCachedPrimaryPhone(): Promise<string>
export async function getCachedAdminEmail(): Promise<string>

// Cache management
export function clearAddressCache(): void
export async function refreshAddressCache()
```

### 3. Server-Side Functions (`src/lib/utils/server-settings.ts`)
Server-side functions with error handling and fallbacks:

```typescript
export async function getAddress(): Promise<string>
export async function getBusinessHours(): Promise<string>
```

### 4. React Hooks (`src/lib/hooks/useCachedAddress.ts`)
React hooks for client-side usage:

```typescript
// Main hook for all address info
export function useCachedAddress(): UseCachedAddressReturn

// Individual convenience hooks
export function useCachedAddressOnly(): { address: string; loading: boolean }
export function useCachedBusinessHours(): { businessHours: string; loading: boolean }
export function useCachedPrimaryPhone(): { primaryPhone: string; loading: boolean }
export function useCachedAdminEmail(): { adminEmail: string; loading: boolean }
```

## Usage Examples

### Server-Side Usage

```typescript
import { getAddress, getBusinessHours } from '@/lib/utils/server-settings';

// In a server component or API route
const address = await getAddress();
const hours = await getBusinessHours();
```

### Client-Side Usage

```typescript
import { useCachedAddressOnly, useCachedPrimaryPhone } from '@/lib/hooks/useCachedAddress';

function MyComponent() {
  const { address, loading: addressLoading } = useCachedAddressOnly();
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();

  return (
    <div>
      <p>Address: {addressLoading ? 'Loading...' : address}</p>
      <p>Phone: {phoneLoading ? 'Loading...' : primaryPhone}</p>
    </div>
  );
}
```

### API Usage

The `/api/contact-info` endpoint now uses cached address information for better performance.

## Cache Management

### Automatic Invalidation
The cache is automatically cleared when:
- Settings are updated via the admin panel
- The cache duration expires (10 minutes)

### Manual Cache Management
```typescript
import { clearAddressCache, refreshAddressCache } from '@/lib/utils/address-cache';

// Clear the cache
clearAddressCache();

// Force refresh the cache
const freshData = await refreshAddressCache();
```

## Performance Benefits

1. **Reduced Database Queries**: Address information is cached for 10 minutes
2. **Faster API Responses**: `/api/contact-info` uses cached data
3. **Better User Experience**: Consistent loading states and fallback values
4. **Automatic Fallbacks**: Graceful degradation if database is unavailable

## Fallback Values

If the database is unavailable, the system provides these fallback values:

- **Address**: `'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3'`
- **Phone**: `'249 806 0128'`
- **Email**: `'admin@zenithmedical.ca'`
- **Business Hours**: `'Mon-Fri 8AM-6PM, Sat 9AM-2PM'`

## Migration Guide

### From Old Phone Number Hooks
```typescript
// Old way
import { usePhoneNumber } from '@/lib/hooks/useSettings';

// New way
import { useCachedPrimaryPhone } from '@/lib/hooks/useCachedAddress';
```

### From Contact Info Hook
```typescript
// Old way
import { useContactInfo } from '@/lib/hooks/useContactInfo';

// New way
import { useCachedAddress } from '@/lib/hooks/useCachedAddress';
```

## Testing

You can test the caching functionality using the `AddressDemo` component:

```typescript
import AddressDemo from '@/components/AddressDemo';

// Use in any page to see the cached address information
<AddressDemo />
```

## Monitoring

The caching system includes error logging for monitoring:
- Database connection errors are logged
- Cache invalidation events are tracked
- Fallback usage is logged for monitoring

This ensures the system remains reliable and performant while providing excellent user experience.
