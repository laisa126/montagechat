import { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Phone, Video, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chat, Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (content: string) => void;
}

export function ChatArea({ chat, onSendMessage }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((msg) => {
      const dateStr = msg.timestamp.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === dateStr) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: dateStr, messages: [msg] });
      }
    });
    
    return groups;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 animate-pulse-soft">
          <MessageCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium text-foreground mb-2">Welcome to Messages</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Select a conversation from the sidebar or start a new one to begin messaging
        </p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(chat.messages);

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-medium">
              {chat.name.charAt(0).toUpperCase()}
            </div>
            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-online rounded-full border-2 border-card" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-foreground">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    {group.date}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  {group.messages.map((msg, msgIndex) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex animate-fade-in",
                        msg.isOutgoing ? "justify-end" : "justify-start"
                      )}
                      style={{ animationDelay: `${msgIndex * 0.05}s` }}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2.5 rounded-2xl shadow-message",
                          msg.isOutgoing
                            ? "bg-message-outgoing rounded-br-md"
                            : "bg-message-incoming rounded-bl-md"
                        )}
                      >
                        <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p className={cn(
                          "text-[11px] mt-1",
                          msg.isOutgoing ? "text-primary/60" : "text-muted-foreground"
                        )}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary py-6"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
