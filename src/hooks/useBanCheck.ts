import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BanInfo {
  isBanned: boolean;
  reason?: string;
  banType?: string;
  expiresAt?: string;
}

export const useBanCheck = (userId?: string) => {
  const [banInfo, setBanInfo] = useState<BanInfo>({ isBanned: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_bans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking ban status:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          // Check if ban is still active
          const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
          
          if (!isExpired) {
            setBanInfo({
              isBanned: true,
              reason: data.reason,
              banType: data.ban_type,
              expiresAt: data.expires_at || undefined
            });
          }
        }
      } catch (err) {
        console.error('Ban check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkBanStatus();
  }, [userId]);

  return { ...banInfo, isLoading };
};
