import React from 'react';
import { useNavigation } from './NavigationContext';
import { ProfileScreen } from './screens/ProfileScreen';
import { PostDetailScreen } from './screens/PostDetailScreen';
import { CommentThreadScreen } from './screens/CommentThreadScreen';
import { ReelViewerScreen } from './screens/ReelViewerScreen';
import { SearchScreen } from './screens/SearchScreen';
import { FollowListScreen } from './screens/FollowListScreen';
import { DMThreadScreen } from './screens/DMThreadScreen';
import { FollowRequestsScreen } from './screens/FollowRequestsScreen';
import { NotificationsScreen } from '@/components/notifications/NotificationsScreen';
import { PostCreationScreen } from '@/components/create/PostCreationScreen';
import { StoryCreationScreen } from '@/components/create/StoryCreationScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';

interface ScreenRouterProps {
  onBack: () => void;
  onCreatePost?: (post: { image?: string; caption: string }) => void;
  onCreateStory?: (story: { image: string; text?: string; music?: { name: string; artist: string } }) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onSignOut?: () => void;
  user?: {
    id?: string;
    displayName: string;
    username: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  onUpdateUser?: (updates: { displayName?: string; username?: string; bio?: string; avatarUrl?: string }) => void;
  isAdmin?: boolean;
  onVerifyUser?: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  getAllProfiles?: () => Promise<{ data: any[] | null; error: string | null }>;
}

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  onBack,
  onCreatePost,
  onCreateStory,
  isDark = false,
  onToggleTheme,
  onSignOut,
  user,
  onUpdateUser,
  isAdmin,
  onVerifyUser,
  getAllProfiles
}) => {
  const { currentNode, goBack } = useNavigation();

  if (!currentNode) return null;

  const handleGoBack = () => {
    const didGoBack = goBack();
    if (!didGoBack) {
      onBack();
    }
  };

  const params = currentNode.params || {};
  const currentUserId = user?.id;

  switch (currentNode.screen) {
    case 'profile':
      return (
        <ProfileScreen
          userId={params.userId as string}
          username={params.username as string}
          displayName={params.displayName as string}
          avatarUrl={params.avatarUrl as string}
          currentUserId={currentUserId}
        />
      );

    case 'post-detail':
      return (
        <PostDetailScreen
          postId={params.postId as string}
          imageUrl={params.imageUrl as string}
          username={params.username as string}
          userId={params.userId as string}
          showLikes={params.showLikes as boolean}
        />
      );

    case 'comment-thread':
      return (
        <CommentThreadScreen
          postId={params.postId as string}
        />
      );

    case 'reel-viewer':
      return (
        <ReelViewerScreen
          reelId={params.reelId as string}
          initialIndex={params.initialIndex as number}
        />
      );

    case 'search':
    case 'search-results':
      return (
        <SearchScreen
          initialQuery={params.query as string}
          initialType={params.type as string}
        />
      );

    case 'follow-list':
      return (
        <FollowListScreen
          userId={params.userId as string}
          username={params.username as string}
          initialTab={params.initialTab as 'followers' | 'following'}
          currentUserId={currentUserId}
        />
      );

    case 'dm-thread':
      return (
        <DMThreadScreen
          userId={params.userId as string}
          username={params.username as string}
          displayName={params.displayName as string}
          avatarUrl={params.avatarUrl as string}
        />
      );

    case 'notifications':
      return (
        <NotificationsScreen 
          onBack={handleGoBack}
          currentUserId={currentUserId}
        />
      );

    case 'create-post':
      return (
        <PostCreationScreen 
          onBack={handleGoBack} 
          onPost={(post) => {
            onCreatePost?.(post);
            handleGoBack();
          }} 
        />
      );

    case 'create-story':
      return (
        <StoryCreationScreen 
          onBack={handleGoBack} 
          onPost={(story) => {
            onCreateStory?.(story);
            handleGoBack();
          }} 
        />
      );

    case 'settings':
      if (user && onSignOut && onToggleTheme && onUpdateUser) {
        return (
          <SettingsScreen
            onBack={handleGoBack}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onSignOut={onSignOut}
            user={user}
            onUpdateUser={onUpdateUser}
            isAdmin={isAdmin}
            onVerifyUser={onVerifyUser}
            getAllProfiles={getAllProfiles}
          />
        );
      }
      return null;

    default:
      return null;
  }
};
