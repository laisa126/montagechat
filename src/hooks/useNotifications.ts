import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  user_id: string;
  from_user_id?: string;
  type: string;
  post_id?: string;
  reel_id?: string;
  story_id?: string;
  comment_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  from_user?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profile data for from_user_ids
      const fromUserIds = [...new Set((data || []).filter(n => n.from_user_id).map(n => n.from_user_id))];
      
      let profileMap: Record<string, any> = {};
      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, is_verified')
          .in('user_id', fromUserIds);
        
        profileMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      const enrichedNotifications = (data || []).map(n => ({
        ...n,
        from_user: n.from_user_id ? profileMap[n.from_user_id] : undefined
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [userId]);

  const createNotification = useCallback(async (
    targetUserId: string,
    type: string,
    options?: {
      postId?: string;
      reelId?: string;
      storyId?: string;
      commentId?: string;
      content?: string;
    }
  ) => {
    if (!userId || userId === targetUserId) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          from_user_id: userId,
          type,
          post_id: options?.postId,
          reel_id: options?.reelId,
          story_id: options?.storyId,
          comment_id: options?.commentId,
          content: options?.content
        });
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }, [userId]);

  return { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications 
  };
};
