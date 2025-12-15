import { useState } from 'react';
import { Search, Edit, ChevronLeft, Send, Phone, Video, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Chat, Message } from '@/types/chat';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

export const ChatTab = () => {
  const [chats, setChats] = useLocalStorage<Chat[]>('telegram-chats', []);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd/MM/yy');
  };

  const formatMessageTime = (date: Date) => format(new Date(date), 'HH:mm');

  const handleCreateChat = () => {
    if (!newChatName.trim()) return;
    
    const newChat: Chat = {
      id: crypto.randomUUID(),
      name: newChatName.trim(),
      messages: [],
      isOnline: Math.random() > 0.5,
    };
    
    setChats(prev => [newChat, ...prev]);
    setNewChatName('');
    setIsCreatingChat(false);
    setSelectedChat(newChat);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: messageInput.trim(),
      timestamp: new Date(),
      isOutgoing: true,
    };

    setChats(prev =>
      prev.map(chat => {
        if (chat.id === selectedChat.id) {
          const updated = {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: messageInput.trim(),
            lastMessageTime: new Date(),
          };
          setSelectedChat(updated);
          return updated;
        }
        return chat;
      })
    );

    setMessageInput('');
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      let dateLabel: string;
      
      if (isToday(date)) dateLabel = 'Today';
      else if (isYesterday(date)) dateLabel = 'Yesterday';
      else dateLabel = format(date, 'MMMM d, yyyy');

      const existingGroup = groups.find((g) => g.date === dateLabel);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateLabel, messages: [message] });
      }
    });

    return groups;
  };

  // Chat Detail View
  if (selectedChat) {
    const messageGroups = groupMessagesByDate(selectedChat.messages);

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Chat Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChat(null)}
                className="h-9 w-9"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {selectedChat.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{selectedChat.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedChat.isOnline ? 'Active now' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Info className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3">
          <div className="py-4 space-y-4">
            {selectedChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {selectedChat.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{selectedChat.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Start a conversation
                </p>
              </div>
            ) : (
              messageGroups.map((group) => (
                <div key={group.date} className="space-y-2">
                  <div className="flex justify-center">
                    <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.isOutgoing ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-2 rounded-2xl",
                          message.isOutgoing
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            message.isOutgoing
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="sticky bottom-16 bg-background border-t border-border/50 px-3 py-2 safe-area-bottom">
          <div className="flex items-center gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Message..."
              className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="rounded-full h-10 w-10 shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Chat List View
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreatingChat(true)}
            className="h-9 w-9"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="pl-9 rounded-xl bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </header>

      {/* New Chat Input */}
      {isCreatingChat && (
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateChat()}
              placeholder="Enter name..."
              className="flex-1 rounded-xl"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateChat} disabled={!newChatName.trim()}>
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setIsCreatingChat(false);
              setNewChatName('');
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="pb-20">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Edit className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
              <p className="text-muted-foreground text-sm">
                Tap the edit icon to start a new conversation
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {chat.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold truncate">{chat.name}</span>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
