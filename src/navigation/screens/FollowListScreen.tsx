import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useFollows } from '@/hooks/useFollows';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

type ListTab = 'followers' | 'following';

interface FollowListScreenProps {
  userId: string;
  username: string;
  initialTab?: ListTab;
  currentUserId?: string;
}

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

  const followers = getFollowers(userId);
  const following = getFollowing(userId);
  const followerCount = getFollowerCount(userId);
  const followingCount = getFollowingCount(userId);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleUserTap = (user: { id: string; username: string; displayName: string; avatarUrl?: string }) => {
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

  const currentList = activeTab === 'followers' ? followers : following;

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
                const isCurrentlyFollowing = isFollowing(user.id);
                const isOwnProfile = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => handleUserTap(user)}
                      className="flex items-center gap-3 flex-1 active:opacity-70"
                    >
                      <Avatar className="w-12 h-12">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        ) : null}
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.displayName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      </div>
                    </button>
                    
                    {!isOwnProfile && currentUserId && (
                      <Button
                        variant={isCurrentlyFollowing ? "outline" : "default"}
                        size="sm"
                        className="rounded-xl min-w-[90px]"
                        onClick={() => handleFollowToggle(user.id, user)}
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
        </div>
      </ScrollArea>
    </div>
  );
};
