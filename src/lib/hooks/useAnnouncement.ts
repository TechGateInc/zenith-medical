import { useState, useEffect } from 'react';

interface AnnouncementData {
  announcementEnabled: boolean;
  announcementTitle?: string;
  announcementMessage?: string;
  announcementType?: string;
  announcementDisplay?: string;
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<AnnouncementData>({
    announcementEnabled: false,
    announcementTitle: '',
    announcementMessage: '',
    announcementType: 'info',
            announcementDisplay: 'popup'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch announcement data');
        }
        
        const data = await response.json();
        if (data.success && data.settings.announcement) {
          setAnnouncement(data.settings.announcement);
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, []);

  return { announcement, loading, error };
}
