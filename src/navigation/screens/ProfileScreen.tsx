import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Grid3X3, Bookmark, Heart, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { NavigablePost } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFollows } from '@/hooks/useFollows';
import { usePresenceStatus } from '@/hooks/useUserPresence';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type ContentTab = 'posts' | 'reels' | 'saved';

interface ProfileScreenProps {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  currentUserId?: string;
}

interface Post {
  id: string;
  imageUrl: string;
  type?: 'image' | 'reel';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  username: initialUsername,
  displayName: initialDisplayName,
  avatarUrl: initialAvatarUrl,
  isVerified: initialIsVerified,
  currentUserId
}) => {
  const { goBack, navigate, updateState, currentNode } = useNavigation();
  const { trigger } = useHaptic();
  const { 
    isFollowing, 
    toggleFollow, 
    getFollowerCount, 
    getFollowingCount,
    registerUser 
  } = useFollows(currentUserId);
  const { isOnline } = usePresenceStatus(userId);
  
  const [activeTab, setActiveTab] = useState<ContentTab>(
    (currentNode?.state?.selectedTab as ContentTab) || 'posts'
  );
  
  // Profile data state - fetch from database
  const [profileData, setProfileData] = useState({
    username: initialUsername,
    displayName: initialDisplayName,
    avatarUrl: initialAvatarUrl,
    bio: '',
    isVerified: initialIsVerified || false,
    simulatedFollowers: 0
  });
  
  const [userPosts] = useLocalStorage<Post[]>(`profile_posts_${userId}`, []);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isOwnProfile = userId === currentUserId;
  const following = isFollowing(userId);
  const realFollowerCount = getFollowerCount(userId);
  const realFollowingCount = getFollowingCount(userId);
  
  // Display simulated + real followers
  const followerCount = realFollowerCount + (profileData.simulatedFollowers || 0);
  const followingCount = realFollowingCount;
  
  const { username, displayName, avatarUrl, bio, isVerified } = profileData;

  // Fetch profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, bio, is_verified, simulated_followers')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setProfileData({
          username: data.username,
          displayName: data.display_name,
          avatarUrl: data.avatar_url || undefined,
          bio: data.bio || '',
          isVerified: data.is_verified || false,
          simulatedFollowers: data.simulated_followers || 0
        });
      }
    };
    
    fetchProfile();
  }, [userId]);

  // Register this user for follow system
  useEffect(() => {
    registerUser({ id: userId, username, displayName, avatarUrl });
  }, [userId, username, displayName, avatarUrl, registerUser]);

  // Restore scroll position
  useEffect(() => {
    if (currentNode?.state?.scrollPosition && scrollRef.current) {
      scrollRef.current.scrollTop = currentNode.state.scrollPosition;
    }
  }, [currentNode?.state?.scrollPosition]);

  const handleBack = () => {
    trigger('light');
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

  const handlePostTap = (post: Post, index: number) => {
    trigger('light');
    if (post.type === 'reel') {
      navigate('reel-viewer', { reelId: post.id, userId });
    } else {
      // Open Instagram-style scrollable feed viewer
      navigate('post-feed-viewer', { 
        posts: userPosts, 
        initialIndex: index,
        userId,
        username,
        displayName,
        avatarUrl,
        isVerified
      });
    }
  };

  const handleFollowToggle = () => {
    trigger('medium');
    toggleFollow(userId, { id: userId, username, displayName, avatarUrl });
  };

  const handleFollowersTap = () => {
    trigger('light');
    navigate('follow-list', { 
      userId, 
      username, 
      initialTab: 'followers',
      currentUserId 
    });
  };

  const handleFollowingTap = () => {
    trigger('light');
    navigate('follow-list', { 
      userId, 
      username, 
      initialTab: 'following',
      currentUserId 
    });
  };

  const handleMessageTap = () => {
    trigger('light');
    navigate('dm-thread', { userId, username, displayName, avatarUrl, isVerified });
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  };

  const stats = [
    { label: 'Posts', value: userPosts.length, displayValue: userPosts.length.toString(), onTap: undefined },
    { label: 'Followers', value: followerCount, displayValue: formatCount(followerCount), onTap: handleFollowersTap },
    { label: 'Following', value: followingCount, displayValue: formatCount(followingCount), onTap: handleFollowingTap }
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
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight">{username}</h1>
              {isVerified && <VerifiedBadge size="md" />}
            </div>
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
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-border">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {displayName[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 flex justify-around pt-2">
                {stats.map((stat) => (
                  <button 
                    key={stat.label} 
                    onClick={stat.onTap}
                    disabled={!stat.onTap}
                    className={cn(
                      "text-center transition-transform",
                      stat.onTap && "active:scale-95"
                    )}
                  >
                    <p className="font-bold text-lg">{stat.displayValue}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold">{displayName}</h2>
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {bio || 'No bio yet'}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {isOwnProfile ? (
                <>
                  <Button variant="secondary" className="flex-1 rounded-xl h-9">
                    Edit Profile
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-xl h-9">
                    Share Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={following ? "outline" : "default"}
                    className="flex-1 rounded-xl h-9"
                    onClick={handleFollowToggle}
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 rounded-xl h-9"
                    onClick={handleMessageTap}
                  >
                    Message
                  </Button>
                </>
              )}
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
                {userPosts.map((post, index) => (
                  <button
                    key={post.id}
                    onClick={() => handlePostTap(post, index)}
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
