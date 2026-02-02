import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  text: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
  createdAt: Date;
  replies?: Comment[];
  parentId?: string;
}

export const useComments = (postId: string, currentUserId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // Fetch profiles for comment authors
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, is_verified')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const commentsWithProfile: Comment[] = data.map(c => {
          const profile = profileMap.get(c.user_id);
          return {
            id: c.id,
            userId: c.user_id,
            username: profile?.username || 'user',
            displayName: profile?.display_name || 'User',
            avatarUrl: profile?.avatar_url || undefined,
            isVerified: profile?.is_verified || false,
            text: c.content,
            likes: 0,
            isLiked: false,
            timeAgo: formatTimeAgo(new Date(c.created_at)),
            createdAt: new Date(c.created_at),
            replies: []
          };
        });

        setComments(commentsWithProfile);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (text: string, parentId?: string) => {
    if (!currentUserId || !text.trim()) return { error: 'Missing data' };

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: text.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch profile for the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, is_verified')
        .eq('user_id', currentUserId)
        .single();

      const newComment: Comment = {
        id: data.id,
        userId: currentUserId,
        username: profile?.username || 'you',
        displayName: profile?.display_name || 'You',
        avatarUrl: profile?.avatar_url || undefined,
        isVerified: profile?.is_verified || false,
        text: data.content,
        likes: 0,
        isLiked: false,
        timeAgo: 'Just now',
        createdAt: new Date(data.created_at),
        parentId,
        replies: []
      };

      if (parentId) {
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        ));
      } else {
        setComments(prev => [...prev, newComment]);
      }

      return { error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { error: 'Failed to add comment' };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { error: 'Failed to delete comment' };
    }
  };

  const likeComment = (commentId: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  return { comments, loading, addComment, deleteComment, likeComment, refetch: fetchComments };
};
