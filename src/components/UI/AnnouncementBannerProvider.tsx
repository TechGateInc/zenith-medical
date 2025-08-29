"use client";

import { useAnnouncement } from '@/lib/hooks/useAnnouncement';
import AnnouncementBanner from './AnnouncementBanner';
import { usePathname } from 'next/navigation';

export default function AnnouncementBannerProvider() {
  const { announcement, loading, error } = useAnnouncement();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (loading || error || isAdmin) {
    return null;
  }

  // Only show banner if display is set to 'banner' or 'both'
  if (announcement.announcementDisplay === 'banner' || announcement.announcementDisplay === 'both') {
    return <AnnouncementBanner announcement={announcement} />;
  }

  return null;
}
