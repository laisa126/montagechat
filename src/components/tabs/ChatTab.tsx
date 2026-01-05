import { useState, useEffect } from 'react';
import { Search, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/navigation/NavigationContext';
import { useMessages, Conversation } from '@/hooks/useMessages';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useHaptic } from '@/hooks/useHaptic';

interface ChatTabProps {
  currentUserId?: string;
}

export const ChatTab = ({ currentUserId }: ChatTabProps) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { conversations, loading } = useMessages(currentUserId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filteredConversations = conversations.filter((conv) =>
    conv.partnerDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.partnerUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd/MM/yy');
  };

  // Search for users to start new conversation
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, is_verified')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .neq('user_id', currentUserId)
          .limit(10);

        if (!error && data) {
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUserId]);

  const handleOpenConversation = (conv: Conversation) => {
    trigger('light');
    navigate('dm-thread', {
      userId: conv.partnerId,
      username: conv.partnerUsername,
      displayName: conv.partnerDisplayName,
      avatarUrl: conv.partnerAvatarUrl,
      isVerified: conv.partnerIsVerified
    });
  };

  const handleStartNewConversation = (user: any) => {
    trigger('light');
    navigate('dm-thread', {
      userId: user.user_id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {}}
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
            placeholder="Search users..."
            className="pl-9 rounded-xl bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </header>

      {/* Search Results */}
      {searchQuery.length >= 2 && searchResults.length > 0 && (
        <div className="border-b border-border/50 bg-muted/30 px-4 py-2">
          <p className="text-xs text-muted-foreground mb-2">Search Results</p>
          {searchResults.map((user) => (
            <button
              key={user.user_id}
              onClick={() => handleStartNewConversation(user)}
              className="w-full flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Avatar className="w-10 h-10">
                {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {user.display_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm">{user.display_name}</span>
                  {user.is_verified && <VerifiedBadge size="sm" />}
                </div>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Edit className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
              <p className="text-muted-foreground text-sm">
                Search for users above to start a conversation
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => handleOpenConversation(conv)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    {conv.partnerAvatarUrl && <AvatarImage src={conv.partnerAvatarUrl} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {conv.partnerDisplayName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold truncate">{conv.partnerDisplayName}</span>
                      {conv.partnerIsVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm truncate",
                      conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
