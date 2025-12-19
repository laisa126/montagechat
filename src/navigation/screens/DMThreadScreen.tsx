import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, Info, Send, Image, Mic, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOutgoing: boolean;
  type?: 'text' | 'image' | 'heart';
}

interface DMThreadScreenProps {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export const DMThreadScreen: React.FC<DMThreadScreenProps> = ({
  userId,
  username,
  displayName,
  avatarUrl
}) => {
  const { goBack, navigate } = useNavigation();
  const { trigger } = useHaptic();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useLocalStorage<Message[]>(`dm_${userId}`, []);

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    trigger('light');
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage.trim(),
      timestamp: new Date(),
      isOutgoing: true,
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleSendHeart = () => {
    trigger('medium');
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: '❤️',
      timestamp: new Date(),
      isOutgoing: true,
      type: 'heart'
    };
    
    setMessages(prev => [...prev, message]);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    msgs.forEach(msg => {
      const dateStr = new Date(msg.timestamp).toLocaleDateString();
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.date === dateStr) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: dateStr, messages: [msg] });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

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
              <Avatar className="w-9 h-9">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName || username} />
                ) : null}
                <AvatarFallback className="bg-muted text-sm">
                  {(displayName || username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-sm leading-tight">{displayName || username}</p>
                <p className="text-xs text-muted-foreground">Active now</p>
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Avatar className="w-20 h-20 mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName || username} />
                ) : null}
                <AvatarFallback className="bg-muted text-2xl">
                  {(displayName || username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{displayName || username}</p>
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
                    {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                  </span>
                </div>
                
                {group.messages.map((msg, msgIndex) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-2",
                      msg.isOutgoing ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2 rounded-2xl",
                        msg.isOutgoing
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                        msg.type === 'heart' && "bg-transparent px-0"
                      )}
                    >
                      {msg.type === 'heart' ? (
                        <span className="text-4xl">{msg.content}</span>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p className={cn(
                        "text-[10px] mt-1",
                        msg.isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-3">
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