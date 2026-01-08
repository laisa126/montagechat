import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
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

export const usePosts = (currentUserId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch posts with profile data
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch likes counts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id');

      // Fetch comments counts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id');

      // Fetch user's likes if logged in
      let userLikes: string[] = [];
      if (currentUserId) {
        const { data: userLikesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUserId);
        userLikes = userLikesData?.map(l => l.post_id) || [];
      }

      // Count likes and comments per post
      const likesCount = (likesData || []).reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commentsCount = (commentsData || []).reduce((acc, comment) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const enrichedPosts = (postsData || []).map(post => ({
        ...post,
        username: post.profiles?.username,
        display_name: post.profiles?.display_name,
        avatar_url: post.profiles?.avatar_url,
        is_verified: post.profiles?.is_verified,
        likes_count: likesCount[post.id] || 0,
        comments_count: commentsCount[post.id] || 0,
        is_liked: userLikes.includes(post.id),
        is_saved: false // TODO: implement saves table
      }));

      setPosts(enrichedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const createPost = async (imageUrl: string | null, caption: string) => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const { error } = await supabase.from('posts').insert({
      user_id: currentUserId,
      image_url: imageUrl,
      caption
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const uploadPostImage = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    if (!currentUserId) return { url: null, error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, file);

    if (uploadError) return { url: null, error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  };

  const toggleLike = async (postId: string) => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const post = posts.find(p => p.id === postId);
    if (!post) return { error: 'Post not found' };

    if (post.is_liked) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);
      
      if (error) return { error: error.message };
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUserId });
      
      if (error) return { error: error.message };
    }

    // Optimistically update local state
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            is_liked: !p.is_liked, 
            likes_count: p.is_liked ? (p.likes_count || 1) - 1 : (p.likes_count || 0) + 1 
          }
        : p
    ));

    return { error: null };
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: currentUserId, content });

    if (error) return { error: error.message };
    return { error: null };
  };

  const getPostComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles!post_comments_user_id_fkey (
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  };

  const getUserPosts = useCallback((userId: string) => {
    return posts.filter(p => p.user_id === userId);
  }, [posts]);

  return {
    posts,
    loading,
    error,
    createPost,
    uploadPostImage,
    toggleLike,
    addComment,
    getPostComments,
    getUserPosts,
    refetch: fetchPosts
  };
};
