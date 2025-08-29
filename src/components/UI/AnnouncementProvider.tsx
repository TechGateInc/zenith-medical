"use client";

import { useAnnouncement } from '@/lib/hooks/useAnnouncement';
import AnnouncementPopup from './AnnouncementPopup';
import { usePathname } from 'next/navigation';

export default function AnnouncementProvider() {
  const { announcement, loading, error } = useAnnouncement();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (loading || error || isAdmin) {
    return null;
  }

  // Only show popup if display is set to 'popup' or 'both'
  if (announcement.announcementDisplay === 'popup' || announcement.announcementDisplay === 'both') {
    return <AnnouncementPopup announcement={announcement} />;
  }

  return null;
}
