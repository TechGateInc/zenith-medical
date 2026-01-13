/**
 * API Authentication Hook
 * Handles API authentication errors and session expiration
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export function useApiAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleApiError = useCallback((error: unknown, response?: Response) => {
    const errorObj = error as Error | { message?: string } | null;
    // Handle 401 Unauthorized errors
    if (response?.status === 401 || errorObj?.message?.includes('Unauthorized')) {
      toast.error('Session expired. Please sign in again.');
      router.push('/admin/login');
      return true; // Indicates that the error was handled
    }

    // Handle 403 Forbidden errors
    if (response?.status === 403 || errorObj?.message?.includes('Forbidden')) {
      toast.error('Access denied. You do not have permission to perform this action.');
      return true;
    }

    // Handle other authentication-related errors
    if (errorObj?.message?.includes('Authentication required') ||
      errorObj?.message?.includes('Invalid session') ||
      errorObj?.message?.includes('Token expired')) {
      toast.error('Authentication required. Please sign in again.');
      router.push('/admin/login');
      return true;
    }

    return false; // Error was not handled by this hook
  }, [router]);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  return {
    handleApiError,
    isAuthenticated,
    isLoading,
    session
  };
} 