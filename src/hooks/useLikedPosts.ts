import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LikedPost {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: Date;
  userId: string;
  username: string;
  avatarUrl?: string;
}

export const useLikedPosts = (currentUserId?: string) => {
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLikedPosts = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          id,
          post_id,
          created_at,
          posts (
            id,
            image_url,
            caption,
            user_id,
            created_at
          )
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Fetch profiles for each post
        const postUserIds = data
          .filter(l => l.posts)
          .map(l => (l.posts as any).user_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', postUserIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const posts: LikedPost[] = data
          .filter(l => l.posts)
          .map(l => {
            const post = l.posts as any;
            const profile = profileMap.get(post.user_id);
            return {
              id: post.id,
              imageUrl: post.image_url || '',
              caption: post.caption || undefined,
              createdAt: new Date(post.created_at),
              userId: post.user_id,
              username: profile?.username || 'user',
              avatarUrl: profile?.avatar_url || undefined
            };
          });

        setLikedPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchLikedPosts();
  }, [fetchLikedPosts]);

  return { likedPosts, loading, refetch: fetchLikedPosts };
};
