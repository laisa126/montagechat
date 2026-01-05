import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, Info, Send, Image, Mic, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useConversation } from '@/hooks/useMessages';
import { usePresenceStatus } from '@/hooks/useUserPresence';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

interface DMThreadScreenProps {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  currentUserId?: string;
}

export const DMThreadScreen: React.FC<DMThreadScreenProps> = ({
  userId,
  username,
  displayName,
  avatarUrl,
  isVerified,
  currentUserId
}) => {
  const { goBack, navigate, setHideBottomNav } = useNavigation();
  const { trigger } = useHaptic();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, sendMessage } = useConversation(currentUserId, userId);
  const { isOnline, lastSeen } = usePresenceStatus(userId);

  // Hide bottom nav when in DM
  useEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleProfileTap = () => {
    trigger('light');
    navigate('profile', { 
      userId, 
      username, 
      displayName: displayName || username,
      avatarUrl 
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    trigger('light');
    await sendMessage(newMessage.trim(), 'text');
    setNewMessage('');
  };

  const handleSendHeart = async () => {
    trigger('medium');
    await sendMessage('❤️', 'heart');
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm');
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const getStatusText = () => {
    if (isOnline) return 'Active now';
    if (lastSeen) {
      const now = new Date();
      const diff = now.getTime() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Active just now';
      if (minutes < 60) return `Active ${minutes}m ago`;
      if (hours < 24) return `Active ${hours}h ago`;
      return `Active ${days}d ago`;
    }
    return 'Offline';
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: typeof messages }[] = [];
    
    messages.forEach(msg => {
      const dateStr = formatDateLabel(msg.created_at);
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.date === dateStr) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: dateStr, messages: [msg] });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="p-1 -ml-1 active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={handleProfileTap}
              className="flex items-center gap-3 active:opacity-70 transition-opacity"
            >
              <div className="relative">
                <Avatar className="w-9 h-9">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || username} />}
                  <AvatarFallback className="bg-muted text-sm">
                    {(displayName || username)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-sm leading-tight">{displayName || username}</p>
                  {isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className={cn(
                  "text-xs",
                  isOnline ? "text-green-500" : "text-muted-foreground"
                )}>
                  {getStatusText()}
                </p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-1 active:scale-90 transition-transform">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-1 active:scale-90 transition-transform">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-1 active:scale-90 transition-transform">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Avatar className="w-20 h-20 mb-4">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || username} />}
                <AvatarFallback className="bg-muted text-2xl">
                  {(displayName || username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 mb-1">
                <p className="font-semibold text-lg">{displayName || username}</p>
                {isVerified && <VerifiedBadge size="md" />}
              </div>
              <p className="text-muted-foreground text-sm">@{username}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 rounded-xl"
                onClick={handleProfileTap}
              >
                View Profile
              </Button>
            </div>
          ) : (
            messageGroups.map((group, groupIndex) => (
              <div key={group.date}>
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-2",
                      msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2 rounded-2xl",
                        msg.sender_id === currentUserId
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                        msg.message_type === 'heart' && "bg-transparent px-0"
                      )}
                    >
                      {msg.message_type === 'heart' ? (
                        <span className="text-4xl">{msg.content}</span>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p className={cn(
                        "text-[10px] mt-1",
                        msg.sender_id === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area - no bottom padding since no nav */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-3 safe-area-bottom">
        <div className="flex items-center gap-2">
          <button className="p-2 active:scale-90 transition-transform">
            <Image className="w-6 h-6 text-primary" />
          </button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="rounded-full pr-12 bg-muted border-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 active:scale-90 transition-transform"
              onClick={() => trigger('light')}
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {newMessage.trim() ? (
            <Button
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={handleSendMessage}
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <button 
              className="p-2 active:scale-90 transition-transform"
              onClick={handleSendHeart}
            >
              <Heart className="w-6 h-6 text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
