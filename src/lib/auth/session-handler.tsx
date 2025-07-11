/**
 * Session Handler Component
 * Handles session expiration and automatic redirects to login
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface SessionHandlerProps {
  children: React.ReactNode;
}

export default function SessionHandler({ children }: SessionHandlerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only handle session changes on admin routes
    if (!pathname.startsWith('/admin')) {
      return;
    }

    // Don't redirect if we're already on the login page
    if (pathname === '/admin/login') {
      return;
    }

    // If session is unauthenticated and we're on an admin route, redirect to login
    if (status === 'unauthenticated') {
      toast.error('Session expired. Please sign in again.');
      router.push('/admin/login');
      return;
    }

    // If session is loading, don't do anything yet
    if (status === 'loading') {
      return;
    }

    // If we have a session but it's invalid (no user), redirect to login
    if (status === 'authenticated' && !session?.user) {
      toast.error('Invalid session. Please sign in again.');
      router.push('/admin/login');
      return;
    }
  }, [session, status, router, pathname]);

  return <>{children}</>;
} 