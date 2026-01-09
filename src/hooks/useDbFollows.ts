import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

export const useDbFollows = (currentUserId?: string) => {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) {
      fetchFollows();
      
      const channel = supabase
        .channel('follows-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'follows' },
          () => fetchFollows()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const fetchFollows = async () => {
    const { data, error } = await supabase
      .from('follows')
      .select('*');

    if (!error && data) {
      setFollows(data);
    }
    setLoading(false);
  };

  const isFollowing = useCallback((targetUserId: string): boolean => {
    if (!currentUserId) return false;
    return follows.some(f => f.follower_id === currentUserId && f.following_id === targetUserId);
  }, [follows, currentUserId]);

  const followUser = async (targetUserId: string): Promise<{ error: string | null }> => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const { error } = await supabase.from('follows').insert({
      follower_id: currentUserId,
      following_id: targetUserId
    });

    if (error) {
      if (error.code === '23505') {
        return { error: 'Already following' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const unfollowUser = async (targetUserId: string): Promise<{ error: string | null }> => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    return { error: error?.message || null };
  };

  const toggleFollow = async (targetUserId: string): Promise<{ error: string | null }> => {
    if (isFollowing(targetUserId)) {
      return unfollowUser(targetUserId);
    } else {
      return followUser(targetUserId);
    }
  };

  const getFollowers = async (userId: string): Promise<FollowUser[]> => {
    const followerIds = follows
      .filter(f => f.following_id === userId)
      .map(f => f.follower_id);

    if (followerIds.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, is_verified')
      .in('user_id', followerIds);

    if (error || !data) return [];

    return data.map(p => ({
      id: p.user_id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      is_verified: p.is_verified || false
    }));
  };

  const getFollowing = async (userId: string): Promise<FollowUser[]> => {
    const followingIds = follows
      .filter(f => f.follower_id === userId)
      .map(f => f.following_id);

    if (followingIds.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, is_verified')
      .in('user_id', followingIds);

    if (error || !data) return [];

    return data.map(p => ({
      id: p.user_id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      is_verified: p.is_verified || false
    }));
  };

  const getFollowerCount = useCallback((userId: string): number => {
    return follows.filter(f => f.following_id === userId).length;
  }, [follows]);

  const getFollowingCount = useCallback((userId: string): number => {
    return follows.filter(f => f.follower_id === userId).length;
  }, [follows]);

  const getFollowingUserIds = useCallback((userId: string): string[] => {
    return follows
      .filter(f => f.follower_id === userId)
      .map(f => f.following_id);
  }, [follows]);

  return {
    follows,
    loading,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    getFollowingUserIds,
    refetch: fetchFollows
  };
};
