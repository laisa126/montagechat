import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const useBlockedUsers = (userId?: string) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlockedUsers = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', userId);

      if (error) throw error;

      setBlockedUsers(data || []);
      setBlockedIds(new Set((data || []).map(b => b.blocked_id)));
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const blockUser = useCallback(async (blockedId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({ blocker_id: userId, blocked_id: blockedId });

      if (error) throw error;

      setBlockedIds(prev => new Set([...prev, blockedId]));
      await fetchBlockedUsers();
      return { error: null };
    } catch (err: any) {
      console.error('Error blocking user:', err);
      return { error: err.message };
    }
  }, [userId, fetchBlockedUsers]);

  const unblockUser = useCallback(async (blockedId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);

      if (error) throw error;

      setBlockedIds(prev => {
        const next = new Set(prev);
        next.delete(blockedId);
        return next;
      });
      await fetchBlockedUsers();
      return { error: null };
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      return { error: err.message };
    }
  }, [userId, fetchBlockedUsers]);

  const isBlocked = useCallback((targetId: string) => {
    return blockedIds.has(targetId);
  }, [blockedIds]);

  return { 
    blockedUsers, 
    blockedIds, 
    isLoading, 
    blockUser, 
    unblockUser, 
    isBlocked,
    refetch: fetchBlockedUsers 
  };
};
