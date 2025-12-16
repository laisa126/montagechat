import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Grid3X3, Bookmark, Heart, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { NavigablePost } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

type ContentTab = 'posts' | 'reels' | 'saved';

interface ProfileScreenProps {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface Post {
  id: string;
  imageUrl: string;
  type?: 'image' | 'reel';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  username,
  displayName,
  avatarUrl
}) => {
  const { goBack, navigate, updateState, currentNode } = useNavigation();
  const { trigger } = useHaptic();
  const [activeTab, setActiveTab] = useState<ContentTab>(
    (currentNode?.state?.selectedTab as ContentTab) || 'posts'
  );
  
  const [userPosts] = useLocalStorage<Post[]>(`profile_posts_${userId}`, []);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Restore scroll position
  useEffect(() => {
    if (currentNode?.state?.scrollPosition && scrollRef.current) {
      scrollRef.current.scrollTop = currentNode.state.scrollPosition;
    }
  }, [currentNode?.state?.scrollPosition]);

  const handleBack = () => {
    trigger('light');
    // Save state before going back
    if (scrollRef.current) {
      updateState({ 
        scrollPosition: scrollRef.current.scrollTop,
        selectedTab: activeTab 
      });
    }
    goBack();
  };

  const handleTabChange = (tab: ContentTab) => {
    trigger('light');
    setActiveTab(tab);
    updateState({ selectedTab: tab });
  };

  const handlePostTap = (post: Post) => {
    trigger('light');
    if (post.type === 'reel') {
      navigate('reel-viewer', { reelId: post.id, userId });
    } else {
      navigate('post-detail', { postId: post.id, userId, username });
    }
  };

  const stats = [
    { label: 'Posts', value: userPosts.length },
    { label: 'Followers', value: Math.floor(Math.random() * 1000) },
    { label: 'Following', value: Math.floor(Math.random() * 500) }
  ];

  const tabs: { id: ContentTab; icon: typeof Grid3X3 }[] = [
    { id: 'posts', icon: Grid3X3 },
    { id: 'reels', icon: Play },
    { id: 'saved', icon: Bookmark }
  ];

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
            <h1 className="text-xl font-bold tracking-tight">{username}</h1>
          </div>
          <button className="p-1 active:scale-90 transition-transform">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="pb-20">
          {/* Profile Info */}
          <div className="px-4 py-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 border-2 border-border">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {displayName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 flex justify-around pt-2">
                {stats.map((stat) => (
                  <button 
                    key={stat.label} 
                    className="text-center active:scale-95 transition-transform"
                  >
                    <p className="font-bold text-lg">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bio description goes here
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1 rounded-xl h-9">
                Follow
              </Button>
              <Button variant="secondary" className="flex-1 rounded-xl h-9">
                Message
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-t border-border">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex-1 py-3 flex items-center justify-center transition-colors",
                      isActive
                        ? "border-b-2 border-foreground"
                        : "border-b border-transparent text-muted-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-0.5">
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {userPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handlePostTap(post)}
                    className="aspect-square bg-muted overflow-hidden active:opacity-80 transition-opacity relative"
                  >
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {post.type === 'reel' && (
                      <div className="absolute top-2 right-2">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                  <Grid3X3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground text-sm">
                  This user hasn't posted anything yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
