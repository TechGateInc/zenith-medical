/**
 * Admin Team Management Page
 * Route: /admin/content/team
 */

import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import TeamManager from '@/components/Admin/TeamManager';

export const metadata = {
  title: 'Team Management - Zenith Medical Centre',
  description: 'Manage team members and staff information',
};

export default async function TeamManagementPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/admin/login');
  }

  // Check admin role
  if (session.user.role !== 'admin') {
    redirect('/admin/dashboard');
  }

  return <TeamManager />;
} 