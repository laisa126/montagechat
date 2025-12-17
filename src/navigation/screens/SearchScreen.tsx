import { useState, useEffect } from 'react';
import { Search, ChevronLeft, X, User, Hash, Music2, Image, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

type SearchTab = 'top' | 'accounts' | 'tags' | 'audio' | 'places';

interface SearchResult {
  id: string;
  type: 'account' | 'hashtag' | 'audio' | 'post';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  count?: number;
}

interface SearchScreenProps {
  initialQuery?: string;
  initialType?: string;
}

export const SearchScreen = ({ initialQuery = '', initialType }: SearchScreenProps) => {
  const { navigate, goBack } = useNavigation();
  const { trigger } = useHaptic();
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });

  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'tags', label: 'Tags' },
    { id: 'audio', label: 'Audio' },
    { id: 'places', label: 'Places' },
  ];

  // Sample search results based on query
  useEffect(() => {
    if (query.length > 0) {
      // Simulate search results
      const mockResults: SearchResult[] = [
        { id: '1', type: 'account', title: query + '_user', subtitle: `${query} User • 1.2K followers` },
        { id: '2', type: 'account', title: query + '_official', subtitle: `Official ${query} • 50K followers` },
        { id: '3', type: 'hashtag', title: `#${query}`, subtitle: '125K posts', count: 125000 },
        { id: '4', type: 'hashtag', title: `#${query}life`, subtitle: '45K posts', count: 45000 },
        { id: '5', type: 'audio', title: `${query} - Original Sound`, subtitle: 'Used in 500 reels' },
        { id: '6', type: 'audio', title: `${query} Remix`, subtitle: 'Used in 1.2K reels' },
        { id: '7', type: 'post', title: 'Featured Post', subtitle: `About ${query}` },
      ];

      // Filter based on active tab
      const filtered = activeTab === 'top' 
        ? mockResults 
        : mockResults.filter(r => {
            if (activeTab === 'accounts') return r.type === 'account';
            if (activeTab === 'tags') return r.type === 'hashtag';
            if (activeTab === 'audio') return r.type === 'audio';
            return true;
          });

      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleResultTap = (result: SearchResult) => {
    trigger('light');
    
    // Add to recent searches
    const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));

    // Navigate based on result type
    switch (result.type) {
      case 'account':
        navigate('profile', {
          userId: result.id,
          username: result.title,
          displayName: result.title
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

  const handleRemoveRecent = (id: string) => {
    trigger('light');
    const updated = recentSearches.filter(r => r.id !== id);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleClearAllRecent = () => {
    trigger('medium');
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
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
              placeholder="Search"
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
          {/* Search Results */}
          {query && results.length > 0 && (
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
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {result.title[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      getResultIcon(result.type)
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="font-semibold">Recent</h3>
                <button 
                  onClick={handleClearAllRecent}
                  className="text-primary text-sm font-medium active:opacity-70"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-border">
                {recentSearches.map(result => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => handleResultTap(result)}
                      className="flex-1 flex items-center gap-3 active:opacity-70"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {result.type === 'account' ? (
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {result.title[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          getResultIcon(result.type)
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={() => handleRemoveRecent(result.id)}
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
          {!query && (
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
          {query && results.length === 0 && (
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
