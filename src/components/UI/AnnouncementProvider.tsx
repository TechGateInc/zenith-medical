"use client";

import { useAnnouncement } from '@/lib/hooks/useAnnouncement';
import AnnouncementPopup from './AnnouncementPopup';

export default function AnnouncementProvider() {
  const { announcement, loading, error } = useAnnouncement();

  if (loading || error) {
    return null;
  }

  // Only show popup if display is set to 'popup' or 'both'
  if (announcement.announcementDisplay === 'popup' || announcement.announcementDisplay === 'both') {
    return <AnnouncementPopup announcement={announcement} />;
  }

  return null;
}
