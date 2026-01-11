import React, { useState, useMemo } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useFollows } from '@/hooks/useFollows';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

// Instagram default avatar
const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png';

type ListTab = 'followers' | 'following';

interface FollowListScreenProps {
  userId: string;
  username: string;
  initialTab?: ListTab;
  currentUserId?: string;
}

// Mock followers to show when there are none
const generateMockFollowers = (count: number = 4) => {
  const mockNames = [
    { username: 'alex_photo', displayName: 'Alex Photography', isVerified: false },
    { username: 'travel_sarah', displayName: 'Sarah Travels', isVerified: true },
    { username: 'foodie_mike', displayName: 'Mike Eats', isVerified: false },
    { username: 'art_emma', displayName: 'Emma Creates', isVerified: true },
    { username: 'music_jay', displayName: 'Jay Beats', isVerified: false },
  ];
  
  return mockNames.slice(0, count).map((name, index) => ({
    id: `mock-${index}`,
    username: name.username,
    displayName: name.displayName,
    avatarUrl: DEFAULT_AVATAR,
    isVerified: name.isVerified,
    isMock: true
  }));
};

export const FollowListScreen: React.FC<FollowListScreenProps> = ({
  userId,
  username,
  initialTab = 'followers',
  currentUserId
}) => {
  const { goBack, navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { 
    getFollowers, 
    getFollowing, 
    isFollowing, 
    toggleFollow,
    getFollowerCount,
    getFollowingCount
  } = useFollows(currentUserId);
  
  const [activeTab, setActiveTab] = useState<ListTab>(initialTab);

  const allFollowers = getFollowers(userId);
  const following = getFollowing(userId);
  const followerCount = getFollowerCount(userId);
  const followingCount = getFollowingCount(userId);
  
  // Only show 3-5 followers if not viewing own profile
  const isOwnProfile = userId === currentUserId;
  const displayLimit = 4; // Show 4 followers for non-owners
  
  const displayFollowers = useMemo(() => {
    if (isOwnProfile) {
      return allFollowers;
    }
    
    // If there are real followers, show up to displayLimit
    if (allFollowers.length > 0) {
      return allFollowers.slice(0, displayLimit);
    }
    
    // If no real followers, show mock followers
    return generateMockFollowers(displayLimit);
  }, [allFollowers, isOwnProfile, displayLimit]);
  
  const hasMoreFollowers = !isOwnProfile && (allFollowers.length > displayLimit || allFollowers.length === 0);
  const showingMockFollowers = !isOwnProfile && allFollowers.length === 0;

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleUserTap = (user: { id: string; username: string; displayName: string; avatarUrl?: string; isMock?: boolean }) => {
    if (user.isMock) return; // Don't navigate to mock profiles
    trigger('light');
    navigate('profile', {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  };

  const handleFollowToggle = (targetUserId: string, targetUser: { id: string; username: string; displayName: string; avatarUrl?: string }) => {
    trigger('medium');
    toggleFollow(targetUserId, targetUser);
  };

  const currentList = activeTab === 'followers' ? displayFollowers : following;

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{username}</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => {
            trigger('light');
            setActiveTab('followers');
          }}
          className={cn(
            "flex-1 py-3 text-center font-medium transition-colors relative",
            activeTab === 'followers' ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span>{followerCount} Followers</span>
          {activeTab === 'followers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => {
            trigger('light');
            setActiveTab('following');
          }}
          className={cn(
            "flex-1 py-3 text-center font-medium transition-colors relative",
            activeTab === 'following' ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span>{followingCount} Following</span>
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-20">
          {currentList.length > 0 ? (
            <div className="divide-y divide-border">
              {currentList.map(user => {
                const isMockUser = 'isMock' in user && user.isMock;
                const isCurrentlyFollowing = !isMockUser && isFollowing(user.id);
                const isUserOwnProfile = user.id === currentUserId;
                const userIsVerified = 'isVerified' in user && user.isVerified;

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      isMockUser && "opacity-70"
                    )}
                  >
                    <button
                      onClick={() => handleUserTap(user as any)}
                      className={cn(
                        "flex items-center gap-3 flex-1",
                        !isMockUser && "active:opacity-70"
                      )}
                      disabled={isMockUser as boolean}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={user.avatarUrl || DEFAULT_AVATAR} 
                          alt={user.displayName} 
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.displayName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold">{user.username}</p>
                          {userIsVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      </div>
                    </button>
                    
                    {!isUserOwnProfile && currentUserId && !isMockUser && (
                      <Button
                        variant={isCurrentlyFollowing ? "outline" : "default"}
                        size="sm"
                        className="rounded-xl min-w-[90px]"
                        onClick={() => handleFollowToggle(user.id, user as any)}
                      >
                        {isCurrentlyFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {activeTab === 'followers' ? 'No Followers Yet' : 'Not Following Anyone'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {activeTab === 'followers' 
                  ? 'When people follow this account, they\'ll appear here.' 
                  : 'When this account follows people, they\'ll appear here.'}
              </p>
            </div>
          )}
          
          {/* Show "only owner can view all" message for followers tab */}
          {activeTab === 'followers' && hasMoreFollowers && (
            <div className="py-6 px-4 text-center border-t border-border">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <p className="text-sm">
                  Only @{username} can see their full list of followers
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
