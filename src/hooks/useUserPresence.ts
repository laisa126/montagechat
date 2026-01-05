import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPresence = (userId?: string) => {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!userId) return;
    
    try {
      await supabase.rpc('upsert_user_presence', {
        p_user_id: userId,
        p_is_online: isOnline
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Set online on mount
    updatePresence(true);

    // Update presence every 30 seconds
    intervalRef.current = setInterval(() => {
      updatePresence(true);
    }, 30000);

    // Handle visibility change
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, updatePresence]);

  return { updatePresence };
};

export const usePresenceStatus = (targetUserId?: string) => {
  const [isOnline, setIsOnline] = React.useState(false);
  const [lastSeen, setLastSeen] = React.useState<Date | null>(null);

  useEffect(() => {
    if (!targetUserId) return;

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, last_seen')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (!error && data) {
        setIsOnline(data.is_online ?? false);
        setLastSeen(data.last_seen ? new Date(data.last_seen) : null);
      }
    };

    fetchPresence();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`presence-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${targetUserId}`
        },
        (payload) => {
          const newData = payload.new as { is_online?: boolean; last_seen?: string };
          if (newData) {
            setIsOnline(newData.is_online ?? false);
            setLastSeen(newData.last_seen ? new Date(newData.last_seen) : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  return { isOnline, lastSeen };
};

import React from 'react';
