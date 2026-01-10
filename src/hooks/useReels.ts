import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  audio_name?: string | null;
  audio_artist?: string | null;
  created_at: string;
  // Joined data
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

// Note: This uses local storage since we haven't created a reels table yet
// In production, you'd want a proper database table

const REELS_STORAGE_KEY = 'app-reels';

export const useReels = (currentUserId?: string) => {
  const [reels, setReels] = useState<Reel[]>(() => {
    try {
      const stored = localStorage.getItem(REELS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
  }, [reels]);

  const createReel = async (
    videoFile: File, 
    caption?: string,
    audioName?: string,
    audioArtist?: string
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

      if (uploadError) {
        // If bucket doesn't exist, store locally
        const videoUrl = URL.createObjectURL(videoFile);
        
        // Fetch profile for user info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, is_verified')
          .eq('user_id', currentUserId)
          .single();

        const newReel: Reel = {
          id: crypto.randomUUID(),
          user_id: currentUserId,
          video_url: videoUrl,
          caption,
          audio_name: audioName || 'Original Audio',
          audio_artist: audioArtist,
          created_at: new Date().toISOString(),
          username: profileData?.username,
          display_name: profileData?.display_name,
          avatar_url: profileData?.avatar_url,
          is_verified: profileData?.is_verified,
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
          is_saved: false
        };

        setReels(prev => [newReel, ...prev]);
        return { error: null, reel: newReel };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      // Fetch profile for user info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, is_verified')
        .eq('user_id', currentUserId)
        .single();

      const newReel: Reel = {
        id: crypto.randomUUID(),
        user_id: currentUserId,
        video_url: publicUrl,
        caption,
        audio_name: audioName || 'Original Audio',
        audio_artist: audioArtist,
        created_at: new Date().toISOString(),
        username: profileData?.username,
        display_name: profileData?.display_name,
        avatar_url: profileData?.avatar_url,
        is_verified: profileData?.is_verified,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_saved: false
      };

      setReels(prev => [newReel, ...prev]);
      return { error: null, reel: newReel };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create reel';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback((reelId: string) => {
    setReels(prev => prev.map(reel => 
      reel.id === reelId 
        ? { 
            ...reel, 
            is_liked: !reel.is_liked, 
            likes_count: reel.is_liked ? (reel.likes_count || 1) - 1 : (reel.likes_count || 0) + 1 
          }
        : reel
    ));
  }, []);

  const toggleSave = useCallback((reelId: string) => {
    setReels(prev => prev.map(reel => 
      reel.id === reelId 
        ? { ...reel, is_saved: !reel.is_saved }
        : reel
    ));
  }, []);

  const deleteReel = useCallback((reelId: string) => {
    setReels(prev => prev.filter(reel => reel.id !== reelId));
  }, []);

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
    getUserReels
  };
};
