import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MutedUser {
  id: string;
  muted_id: string;
  mute_stories: boolean;
  mute_posts: boolean;
  created_at: string;
}

export const useMutedUsers = (userId?: string) => {
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchMutedUsers = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('muted_users')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setMutedUsers(data || []);
      setMutedIds(new Set((data || []).map(m => m.muted_id)));
    } catch (err) {
      console.error('Error fetching muted users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMutedUsers();
  }, [fetchMutedUsers]);

  const muteUser = useCallback(async (
    mutedId: string, 
    options?: { muteStories?: boolean; mutePosts?: boolean }
  ) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('muted_users')
        .insert({ 
          user_id: userId, 
          muted_id: mutedId,
          mute_stories: options?.muteStories ?? true,
          mute_posts: options?.mutePosts ?? true
        });

      if (error) throw error;

      setMutedIds(prev => new Set([...prev, mutedId]));
      await fetchMutedUsers();
      return { error: null };
    } catch (err: any) {
      console.error('Error muting user:', err);
      return { error: err.message };
    }
  }, [userId, fetchMutedUsers]);

  const unmuteUser = useCallback(async (mutedId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('muted_users')
        .delete()
        .eq('user_id', userId)
        .eq('muted_id', mutedId);

      if (error) throw error;

      setMutedIds(prev => {
        const next = new Set(prev);
        next.delete(mutedId);
        return next;
      });
      await fetchMutedUsers();
      return { error: null };
    } catch (err: any) {
      console.error('Error unmuting user:', err);
      return { error: err.message };
    }
  }, [userId, fetchMutedUsers]);

  const isMuted = useCallback((targetId: string) => {
    return mutedIds.has(targetId);
  }, [mutedIds]);

  const getMuteSettings = useCallback((targetId: string) => {
    const muted = mutedUsers.find(m => m.muted_id === targetId);
    return {
      muteStories: muted?.mute_stories ?? false,
      mutePosts: muted?.mute_posts ?? false
    };
  }, [mutedUsers]);

  return { 
    mutedUsers, 
    mutedIds, 
    isLoading, 
    muteUser, 
    unmuteUser, 
    isMuted,
    getMuteSettings,
    refetch: fetchMutedUsers 
  };
};
