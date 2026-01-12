import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  caption?: string | null;
  audio_name?: string | null;
  created_at: string;
  // Joined data
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export const useReels = (currentUserId?: string) => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false });

      if (reelsError) {
        // If table doesn't exist yet, use empty array
        if (reelsError.code === '42P01') {
          setReels([]);
          return;
        }
        throw reelsError;
      }

      // Get unique user IDs from reels
      const userIds = [...new Set((reelsData || []).map(r => r.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified')
        .in('user_id', userIds);

      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, typeof profilesData[0]>);

      // Fetch user's likes and saves
      let userLikes: string[] = [];
      let userSaves: string[] = [];
      
      if (currentUserId) {
        const { data: likesData } = await supabase
          .from('reel_likes')
          .select('reel_id')
          .eq('user_id', currentUserId);
        userLikes = likesData?.map(l => l.reel_id) || [];

        const { data: savesData } = await supabase
          .from('reel_saves')
          .select('reel_id')
          .eq('user_id', currentUserId);
        userSaves = savesData?.map(s => s.reel_id) || [];
      }

      // Count likes per reel
      const { data: allLikes } = await supabase
        .from('reel_likes')
        .select('reel_id');
      
      const likesCount = (allLikes || []).reduce((acc, like) => {
        acc[like.reel_id] = (acc[like.reel_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const enrichedReels = (reelsData || []).map(reel => {
        const profile = profilesMap[reel.user_id];
        return {
          ...reel,
          username: profile?.username,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          is_verified: profile?.is_verified,
          likes_count: likesCount[reel.id] || reel.likes_count || 0,
          is_liked: userLikes.includes(reel.id),
          is_saved: userSaves.includes(reel.id)
        };
      });

      setReels(enrichedReels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reels');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const createReel = async (
    videoFile: File, 
    caption?: string,
    audioName?: string
  ): Promise<{ error: string | null; reel?: Reel }> => {
    if (!currentUserId) return { error: 'Not authenticated' };

    try {
      setLoading(true);
      
      // Upload video to storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      // Insert reel into database
      const { data: newReel, error: insertError } = await supabase
        .from('reels')
        .insert({
          user_id: currentUserId,
          video_url: publicUrl,
          caption,
          audio_name: audioName || 'Original Audio'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Fetch profile for enriched data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, is_verified')
        .eq('user_id', currentUserId)
        .single();

      const enrichedReel: Reel = {
        ...newReel,
        username: profileData?.username,
        display_name: profileData?.display_name,
        avatar_url: profileData?.avatar_url,
        is_verified: profileData?.is_verified,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_saved: false
      };

      setReels(prev => [enrichedReel, ...prev]);
      return { error: null, reel: enrichedReel };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create reel';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback(async (reelId: string) => {
    if (!currentUserId) return;

    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    // Optimistic update
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { 
            ...r, 
            is_liked: !r.is_liked, 
            likes_count: r.is_liked ? (r.likes_count || 1) - 1 : (r.likes_count || 0) + 1 
          }
        : r
    ));

    if (reel.is_liked) {
      await supabase
        .from('reel_likes')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('reel_likes')
        .insert({ reel_id: reelId, user_id: currentUserId });
    }
  }, [currentUserId, reels]);

  const toggleSave = useCallback(async (reelId: string) => {
    if (!currentUserId) return;

    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    // Optimistic update
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { ...r, is_saved: !r.is_saved }
        : r
    ));

    if (reel.is_saved) {
      await supabase
        .from('reel_saves')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('reel_saves')
        .insert({ reel_id: reelId, user_id: currentUserId });
    }
  }, [currentUserId, reels]);

  const deleteReel = useCallback(async (reelId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', reelId)
      .eq('user_id', currentUserId);

    if (!error) {
      setReels(prev => prev.filter(r => r.id !== reelId));
    }
  }, [currentUserId]);

  const getUserReels = useCallback((userId: string) => {
    return reels.filter(r => r.user_id === userId);
  }, [reels]);

  return {
    reels,
    loading,
    error,
    createReel,
    toggleLike,
    toggleSave,
    deleteReel,
    getUserReels,
    refetch: fetchReels
  };
};