import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestrictedUser {
  id: string;
  restricted_id: string;
  created_at: string;
}

export const useRestrictedUsers = (userId?: string) => {
  const [restrictedUsers, setRestrictedUsers] = useState<RestrictedUser[]>([]);
  const [restrictedIds, setRestrictedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestrictedUsers = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('restricted_users')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setRestrictedUsers(data || []);
      setRestrictedIds(new Set((data || []).map(r => r.restricted_id)));
    } catch (err) {
      console.error('Error fetching restricted users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRestrictedUsers();
  }, [fetchRestrictedUsers]);

  const restrictUser = useCallback(async (restrictedId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('restricted_users')
        .insert({ user_id: userId, restricted_id: restrictedId });

      if (error) throw error;

      setRestrictedIds(prev => new Set([...prev, restrictedId]));
      return { error: null };
    } catch (err: any) {
      console.error('Error restricting user:', err);
      return { error: err.message };
    }
  }, [userId]);

  const unrestrictUser = useCallback(async (restrictedId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('restricted_users')
        .delete()
        .eq('user_id', userId)
        .eq('restricted_id', restrictedId);

      if (error) throw error;

      setRestrictedIds(prev => {
        const next = new Set(prev);
        next.delete(restrictedId);
        return next;
      });
      return { error: null };
    } catch (err: any) {
      console.error('Error unrestricting user:', err);
      return { error: err.message };
    }
  }, [userId]);

  const isRestricted = useCallback((targetId: string) => {
    return restrictedIds.has(targetId);
  }, [restrictedIds]);

  return { 
    restrictedUsers, 
    restrictedIds, 
    isLoading, 
    restrictUser, 
    unrestrictUser, 
    isRestricted,
    refetch: fetchRestrictedUsers 
  };
};
