"use client";

import { useAnnouncement } from '@/lib/hooks/useAnnouncement';
import AnnouncementBanner from './AnnouncementBanner';

export default function AnnouncementBannerProvider() {
  const { announcement, loading, error } = useAnnouncement();

  if (loading || error) {
    return null;
  }

  // Only show banner if display is set to 'banner' or 'both'
  if (announcement.announcementDisplay === 'banner' || announcement.announcementDisplay === 'both') {
    return <AnnouncementBanner announcement={announcement} />;
  }

  return null;
}
