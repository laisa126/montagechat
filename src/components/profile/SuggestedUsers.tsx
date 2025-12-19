import React from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useNavigation } from '@/navigation/NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useFollows } from '@/hooks/useFollows';
import { cn } from '@/lib/utils';

interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  mutualCount?: number;
  mutualNames?: string[];
  reason?: string;
}

interface SuggestedUsersProps {
  currentUserId?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showDismiss?: boolean;
  title?: string;
}

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  currentUserId,
  className,
  variant = 'horizontal',
  showDismiss = true,
  title = 'Suggested for you'
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { 
    isFollowing, 
    toggleFollow, 
    getSuggestedUsers,
    dismissSuggestedUser
  } = useFollows(currentUserId);

  const suggestedUsers = getSuggestedUsers();

  const handleProfileTap = (user: SuggestedUser) => {
    trigger('light');
    navigate('profile', {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  };

  const handleFollow = (user: SuggestedUser) => {
    trigger('medium');
    toggleFollow(user.id, {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  };

  const handleDismiss = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    trigger('light');
    dismissSuggestedUser(userId);
  };

  if (suggestedUsers.length === 0) {
    return null;
  }

  if (variant === 'vertical') {
    return (
      <div className={cn("py-4", className)}>
        <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-3">
          {title}
        </h3>
        <div className="space-y-1">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-2"
            >
              <button
                onClick={() => handleProfileTap(user)}
                className="active:opacity-70 transition-opacity"
              >
                <Avatar className="w-11 h-11">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  ) : null}
                  <AvatarFallback className="bg-muted">
                    {user.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              <button
                onClick={() => handleProfileTap(user)}
                className="flex-1 text-left active:opacity-70 transition-opacity"
              >
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {user.mutualCount && user.mutualCount > 0
                    ? `Followed by ${user.mutualNames?.[0]}${user.mutualCount > 1 ? ` + ${user.mutualCount - 1} more` : ''}`
                    : user.reason || 'Suggested for you'}
                </p>
              </button>

              <Button
                variant={isFollowing(user.id) ? "outline" : "default"}
                size="sm"
                className="rounded-xl h-8 px-4"
                onClick={() => handleFollow(user)}
              >
                {isFollowing(user.id) ? 'Following' : 'Follow'}
              </Button>

              {showDismiss && (
                <button
                  onClick={(e) => handleDismiss(user.id, e)}
                  className="p-1 active:scale-90 transition-transform text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button 
          className="text-sm text-primary font-semibold active:opacity-70"
          onClick={() => trigger('light')}
        >
          See All
        </button>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4 pb-2">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="relative flex flex-col items-center bg-card border border-border rounded-xl p-4 min-w-[150px] w-[150px]"
            >
              {showDismiss && (
                <button
                  onClick={(e) => handleDismiss(user.id, e)}
                  className="absolute top-2 right-2 p-1 active:scale-90 transition-transform text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleProfileTap(user)}
                className="active:opacity-70 transition-opacity"
              >
                <Avatar className="w-16 h-16 mb-2">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-xl">
                    {user.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              <button
                onClick={() => handleProfileTap(user)}
                className="text-center active:opacity-70 transition-opacity mb-2"
              >
                <p className="font-semibold text-sm truncate max-w-[120px]">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.mutualCount && user.mutualCount > 0
                    ? `${user.mutualCount} mutual`
                    : user.displayName}
                </p>
              </button>

              <Button
                variant={isFollowing(user.id) ? "outline" : "default"}
                size="sm"
                className="w-full rounded-xl h-8"
                onClick={() => handleFollow(user)}
              >
                {isFollowing(user.id) ? 'Following' : 'Follow'}
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};