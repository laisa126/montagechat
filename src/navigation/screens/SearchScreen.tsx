import { useState, useEffect } from 'react';
import { Search, ChevronLeft, X, User, Hash, Music2, Image, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type SearchTab = 'top' | 'accounts' | 'tags' | 'audio' | 'places';

interface SearchResult {
  id: string;
  type: 'account' | 'hashtag' | 'audio' | 'post';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  count?: number;
}

interface SearchScreenProps {
  initialQuery?: string;
  initialType?: string;
  currentUserId?: string;
}

export const SearchScreen = ({ initialQuery = '', initialType, currentUserId }: SearchScreenProps) => {
  const { navigate, goBack } = useNavigation();
  const { trigger } = useHaptic();
  const { history, addToHistory, removeFromHistory, clearHistory: clearSearchHistory } = useSearchHistory(currentUserId);
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'tags', label: 'Tags' },
    { id: 'audio', label: 'Audio' },
    { id: 'places', label: 'Places' },
  ];

  // Search users from database
  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Search for users
        const { data: users, error } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, is_verified')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20);

        if (error) throw error;

        const searchResults: SearchResult[] = [];

        // Add user results
        if (users) {
          users.forEach(user => {
            searchResults.push({
              id: user.user_id,
              type: 'account',
              title: user.username,
              subtitle: `${user.display_name}`,
              avatarUrl: user.avatar_url || undefined,
              isVerified: user.is_verified || false
            });
          });
        }

        // Add hashtag results (synthetic for now)
        if (activeTab === 'top' || activeTab === 'tags') {
          searchResults.push({
            id: `hashtag-${query}`,
            type: 'hashtag',
            title: `#${query}`,
            subtitle: 'Search hashtag',
            count: 0
          });
        }

        // Filter based on active tab
        const filtered = activeTab === 'top' 
          ? searchResults 
          : searchResults.filter(r => {
              if (activeTab === 'accounts') return r.type === 'account';
              if (activeTab === 'tags') return r.type === 'hashtag';
              if (activeTab === 'audio') return r.type === 'audio';
              return true;
            });

        setResults(filtered);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, activeTab]);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleResultTap = async (result: SearchResult) => {
    trigger('light');
    
    // Add to search history
    await addToHistory({
      search_type: result.type,
      search_value: query,
      result_id: result.id,
      result_title: result.title,
      result_subtitle: result.subtitle
    });

    // Navigate based on result type
    switch (result.type) {
      case 'account':
        navigate('profile', {
          userId: result.id,
          username: result.title,
          displayName: result.subtitle || result.title,
          avatarUrl: result.avatarUrl,
          isVerified: result.isVerified
        });
        break;
      case 'hashtag':
        navigate('search-results', {
          query: result.title,
          type: 'hashtag'
        });
        break;
      case 'audio':
        navigate('search-results', {
          query: result.title,
          type: 'audio'
        });
        break;
      case 'post':
        navigate('post-detail', {
          postId: result.id
        });
        break;
    }
  };

  const handleHistoryTap = (item: typeof history[0]) => {
    trigger('light');
    
    switch (item.search_type) {
      case 'account':
        navigate('profile', {
          userId: item.result_id,
          username: item.result_title,
          displayName: item.result_subtitle || item.result_title
        });
        break;
      case 'hashtag':
        navigate('search-results', {
          query: item.result_title,
          type: 'hashtag'
        });
        break;
      default:
        setQuery(item.search_value);
        break;
    }
  };

  const handleRemoveHistoryItem = async (id: string) => {
    trigger('light');
    await removeFromHistory(id);
  };

  const handleClearAllHistory = async () => {
    trigger('medium');
    await clearSearchHistory();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'account': return <User className="w-4 h-4" />;
      case 'hashtag': return <Hash className="w-4 h-4" />;
      case 'audio': return <Music2 className="w-4 h-4" />;
      case 'post': return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-9 rounded-xl bg-muted border-0 h-10"
              autoFocus
            />
            {query && (
              <button 
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 active:scale-90 transition-transform"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Search Tabs */}
        {query && (
          <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  trigger('light');
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="pb-20">
          {/* Loading State */}
          {loading && query.length >= 2 && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Search Results */}
          {!loading && query && results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map(result => (
                <button
                  key={result.id}
                  onClick={() => handleResultTap(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    result.type === 'hashtag' ? "bg-primary/10" : "bg-muted"
                  )}>
                    {result.type === 'account' ? (
                      <Avatar className="w-12 h-12">
                        {result.avatarUrl && <AvatarImage src={result.avatarUrl} />}
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {result.title[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      getResultIcon(result.type)
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">{result.title}</p>
                      {result.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches from Database */}
          {!query && history.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="font-semibold">Recent</h3>
                <button 
                  onClick={handleClearAllHistory}
                  className="text-primary text-sm font-medium active:opacity-70"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-border">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => handleHistoryTap(item)}
                      className="flex-1 flex items-center gap-3 active:opacity-70"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {item.search_type === 'account' ? (
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {item.result_title[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          getResultIcon(item.search_type)
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{item.result_title}</p>
                        {item.result_subtitle && (
                          <p className="text-sm text-muted-foreground">{item.result_subtitle}</p>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={() => handleRemoveHistoryItem(item.id)}
                      className="p-2 active:scale-90 transition-transform"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Section */}
          {!query && history.length === 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-4 py-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Trending</h3>
              </div>
              <div className="divide-y divide-border">
                {['photography', 'travel', 'food', 'music', 'art'].map((topic, i) => (
                  <button
                    key={topic}
                    onClick={() => {
                      trigger('light');
                      setQuery(topic);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">#{topic}</p>
                      <p className="text-sm text-muted-foreground">{(100 - i * 15)}K posts</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Search className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No results found</h3>
              <p className="text-muted-foreground text-sm">
                Try searching for something else
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
