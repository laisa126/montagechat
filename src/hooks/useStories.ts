import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface Story {
  id: string;
  user_id: string;
  image_url: string | null;
  text_content: string | null;
  text_position: { x: number; y: number };
  text_style: { fontSize: number; color: string };
  music_name: string | null;
  music_artist: string | null;
  background_color: string;
  created_at: string;
  expires_at: string;
  // Joined data
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  is_verified?: boolean;
}

export const useStories = () => {
  const { profile } = useSupabaseAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('stories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories' },
        () => fetchStories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!stories_user_id_fkey (
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedStories = data.map((story: any) => ({
        ...story,
        text_position: story.text_position || { x: 50, y: 50 },
        text_style: story.text_style || { fontSize: 24, color: '#ffffff' },
        username: story.profiles?.username,
        display_name: story.profiles?.display_name,
        avatar_url: story.profiles?.avatar_url,
        is_verified: story.profiles?.is_verified
      }));
      setStories(mappedStories);
    }
    setLoading(false);
  };

  const uploadStoryImage = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    if (!profile) return { url: null, error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  };

  const createStory = async (data: {
    imageUrl?: string | null;
    textContent?: string;
    textPosition?: { x: number; y: number };
    textStyle?: { fontSize: number; color: string };
    musicName?: string;
    musicArtist?: string;
    backgroundColor?: string;
  }) => {
    if (!profile) return { error: 'Not authenticated' };

    const { error } = await supabase.from('stories').insert({
      user_id: profile.user_id,
      image_url: data.imageUrl || null,
      text_content: data.textContent || null,
      text_position: data.textPosition || { x: 50, y: 50 },
      text_style: data.textStyle || { fontSize: 24, color: '#ffffff' },
      music_name: data.musicName || null,
      music_artist: data.musicArtist || null,
      background_color: data.backgroundColor || '#000000'
    });

    return { error: error?.message || null };
  };

  const deleteStory = async (storyId: string) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    return { error: error?.message || null };
  };

  const getStoriesByUser = (userId: string) => {
    return stories.filter(s => s.user_id === userId);
  };

  const getUsersWithStories = () => {
    const userMap = new Map<string, Story[]>();
    stories.forEach(story => {
      const existing = userMap.get(story.user_id) || [];
      userMap.set(story.user_id, [...existing, story]);
    });
    return Array.from(userMap.entries()).map(([userId, userStories]) => ({
      userId,
      username: userStories[0].username,
      displayName: userStories[0].display_name,
      avatarUrl: userStories[0].avatar_url,
      isVerified: userStories[0].is_verified,
      stories: userStories
    }));
  };

  return {
    stories,
    loading,
    createStory,
    deleteStory,
    uploadStoryImage,
    getStoriesByUser,
    getUsersWithStories,
    refetch: fetchStories
  };
};
