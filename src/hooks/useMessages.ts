import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerUsername: string;
  partnerDisplayName: string;
  partnerAvatarUrl: string | null;
  partnerIsVerified: boolean;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

export const useMessages = (currentUserId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      // Get all messages for current user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, Message[]>();
      messages?.forEach(msg => {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      // Get partner profiles
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified')
        .in('user_id', partnerIds);

      // Get presence data
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', partnerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const presenceMap = new Map(presenceData?.map(p => [p.user_id, p.is_online]) || []);

      const convos: Conversation[] = [];
      conversationMap.forEach((msgs, partnerId) => {
        const profile = profileMap.get(partnerId);
        const latestMessage = msgs[0];
        const unreadCount = msgs.filter(m => 
          m.receiver_id === currentUserId && !m.is_read
        ).length;

        convos.push({
          partnerId,
          partnerUsername: profile?.username || 'Unknown',
          partnerDisplayName: profile?.display_name || 'Unknown',
          partnerAvatarUrl: profile?.avatar_url || null,
          partnerIsVerified: profile?.is_verified || false,
          lastMessage: latestMessage.content,
          lastMessageTime: new Date(latestMessage.created_at),
          unreadCount,
          isOnline: presenceMap.get(partnerId) || false
        });
      });

      // Sort by last message time
      convos.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      setConversations(convos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();

    if (!currentUserId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUserId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
};

export const useConversation = (currentUserId?: string, partnerId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !partnerId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, partnerId]);

  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!currentUserId || !partnerId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: partnerId,
          content: content.trim(),
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }, [currentUserId, partnerId]);

  useEffect(() => {
    fetchMessages();

    if (!currentUserId || !partnerId) return;

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`conversation-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === partnerId) ||
            (newMsg.sender_id === partnerId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages(prev => [...prev, newMsg]);
            
            // Mark as read if received
            if (newMsg.sender_id === partnerId) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, partnerId, fetchMessages]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
};
