import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigation } from './NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

// Instagram default avatar
const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png';

interface NavigableAvatarProps {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showRing?: boolean;
  ringColor?: string;
}

export const NavigableAvatar: React.FC<NavigableAvatarProps> = ({
  userId,
  username,
  displayName,
  avatarUrl,
  size = 'md',
  className,
  showRing = false,
  ringColor
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const handleTap = () => {
    trigger('light');
    navigate('profile', { userId, username, displayName, avatarUrl });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'transition-transform duration-200 hover:scale-105 active:scale-95',
        showRing && 'p-0.5 rounded-full',
        showRing && ringColor,
        className
      )}
    >
      <Avatar className={cn(sizeClasses[size], showRing && 'border-2 border-background')}>
        <AvatarImage src={avatarUrl || DEFAULT_AVATAR} alt={displayName} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {displayName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </button>
  );
};

interface NavigableUsernameProps {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  className?: string;
  isVerified?: boolean;
}

export const NavigableUsername: React.FC<NavigableUsernameProps> = ({
  userId,
  username,
  displayName,
  avatarUrl,
  className,
  isVerified = false
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    navigate('profile', { userId, username, displayName: displayName || username, avatarUrl });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'inline-flex items-center gap-1 font-semibold text-sm hover:underline active:opacity-70 transition-opacity',
        className
      )}
    >
      <span>{username}</span>
      {isVerified && <VerifiedBadge size="sm" />}
    </button>
  );
};

interface NavigablePostProps {
  postId: string;
  imageUrl?: string;
  username: string;
  userId: string;
  children?: React.ReactNode;
  className?: string;
}

export const NavigablePost: React.FC<NavigablePostProps> = ({
  postId,
  imageUrl,
  username,
  userId,
  children,
  className
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    navigate('post-detail', { postId, imageUrl, username, userId });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'w-full text-left active:opacity-80 transition-opacity',
        className
      )}
    >
      {children}
    </button>
  );
};

interface NavigableLikeCountProps {
  postId: string;
  count: number;
  className?: string;
}

export const NavigableLikeCount: React.FC<NavigableLikeCountProps> = ({
  postId,
  count,
  className
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    navigate('post-detail', { postId, showLikes: true });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'font-semibold text-sm hover:underline active:opacity-70 transition-opacity',
        className
      )}
    >
      {count.toLocaleString()} likes
    </button>
  );
};

interface NavigableCommentProps {
  postId: string;
  commentCount?: number;
  className?: string;
  children?: React.ReactNode;
}

export const NavigableComment: React.FC<NavigableCommentProps> = ({
  postId,
  commentCount,
  className,
  children
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    navigate('comment-thread', { postId });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'text-sm text-muted-foreground hover:underline active:opacity-70 transition-opacity',
        className
      )}
    >
      {children || (commentCount ? `View all ${commentCount} comments` : 'Add a comment...')}
    </button>
  );
};

interface NavigableHashtagProps {
  hashtag: string;
  className?: string;
}

export const NavigableHashtag: React.FC<NavigableHashtagProps> = ({
  hashtag,
  className
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    navigate('search-results', { query: hashtag, type: 'hashtag' });
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'text-primary font-medium hover:underline active:opacity-70 transition-opacity',
        className
      )}
    >
      #{hashtag}
    </button>
  );
};

interface NavigableNotificationProps {
  notificationId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  relatedPostId?: string;
  relatedUserId?: string;
  children: React.ReactNode;
  className?: string;
}

export const NavigableNotification: React.FC<NavigableNotificationProps> = ({
  notificationId,
  type,
  relatedPostId,
  relatedUserId,
  children,
  className
}) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();

  const handleTap = () => {
    trigger('light');
    
    switch (type) {
      case 'like':
      case 'comment':
        if (relatedPostId) {
          navigate('post-detail', { postId: relatedPostId, fromNotification: notificationId });
        }
        break;
      case 'follow':
      case 'mention':
        if (relatedUserId) {
          navigate('profile', { userId: relatedUserId, fromNotification: notificationId });
        }
        break;
      default:
        navigate('notification-detail', { notificationId });
    }
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'w-full text-left active:opacity-80 transition-opacity',
        className
      )}
    >
      {children}
    </button>
  );
};
