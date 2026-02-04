import { useState, useMemo, useEffect } from 'react';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { AccountTab } from '@/components/tabs/AccountTab';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { BannedUserScreen } from '@/components/BannedUserScreen';
import { Toaster } from '@/components/ui/sonner';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useFollows } from '@/hooks/useFollows';
import { usePosts } from '@/hooks/usePosts';
import { useReels } from '@/hooks/useReels';
import { useFeedAlgorithm, useInteractionHistory } from '@/hooks/useFeedAlgorithm';
import { useBanCheck } from '@/hooks/useBanCheck';
import { warmupProfileCache } from '@/hooks/useProfileCache';
import { NavigationProvider, useNavigation } from '@/navigation/NavigationContext';
import { ScreenRouter } from '@/navigation/ScreenRouter';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Warmup profile cache on app load for instant verification badges
warmupProfileCache();

interface Story {
  id: string;
  name: string;
  image?: string;
  isOwn?: boolean;
  hasNewStory?: boolean;
  storyImage?: string;
  text?: string;
  music?: { name: string; artist: string };
  timestamp?: string;
}

const MainContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, profile, signUp, signIn, signOut, updateProfile, verifyUser, getAllProfiles, setSimulatedFollowers, isAdmin, isAuthenticated, loading } = useSupabaseAuth();
  const { isDark, toggleTheme } = useTheme();
  const { swipeOffset, isSwiping, swipeHandlers } = useSwipeNavigation(activeTab, setActiveTab);
  const { currentNode, navigate, clearHistory, setOriginTab, hideBottomNav } = useNavigation();
  
  const [stories, setStories] = useLocalStorage<Story[]>('app-stories', []);
  const { getFollowingUserIds } = useFollows(profile?.user_id);
  const { posts: dbPosts, createPost, uploadPostImage, toggleLike, toggleSave, refetch: refetchPosts } = usePosts(profile?.user_id);
  const { createReel } = useReels(profile?.user_id);
  
  // Use interaction history for feed algorithm
  const { likedUserIds, commentedUserIds, recordLike } = useInteractionHistory(profile?.user_id || '');
  const followingIds = getFollowingUserIds(profile?.user_id || '');
  
  // Filter posts to show (own + following)
  const relevantPosts = useMemo(() => {
    return dbPosts.filter(post => 
      post.user_id === profile?.user_id || // Own posts
      followingIds.includes(post.user_id) // Posts from followed users
    );
  }, [dbPosts, profile?.user_id, followingIds]);
  
  // Apply feed algorithm
  const algorithmPosts = useFeedAlgorithm(relevantPosts, {
    likedUserIds,
    commentedUserIds,
    followingIds,
    currentUserId: profile?.user_id || ''
  });
  
  // Transform database posts to feed format
  const feedPosts = useMemo(() => {
    return algorithmPosts.map(post => ({
      id: post.id,
      username: post.username || 'user',
      userId: post.user_id,
      avatarUrl: post.avatar_url || undefined,
      content: post.caption || '',
      image: post.image_url || undefined,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
      isLiked: post.is_liked || false,
      isSaved: post.is_saved || false,
      isVerified: post.is_verified || false
    }));
  }, [algorithmPosts]);
  
  // Track user presence
  useUserPresence(profile?.user_id);
  
  // Check ban status
  const { isBanned, reason: banReason, banType, expiresAt: banExpiresAt, isLoading: banLoading } = useBanCheck(profile?.user_id);

  if (loading || banLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={signIn} onSignUp={signUp} />;
  }
  
  // Show banned screen if user is banned
  if (isBanned) {
    return (
      <BannedUserScreen
        reason={banReason || 'Violation of Community Guidelines'}
        banType={banType || 'permanent'}
        expiresAt={banExpiresAt}
        onSignOut={signOut}
      />
    );
  }

  const handleCreatePost = async (post: { image?: string; imageFile?: File; caption: string }) => {
    let imageUrl: string | null = null;
    
    // Upload image if file provided
    if (post.imageFile) {
      const { url, error: uploadError } = await uploadPostImage(post.imageFile);
      if (uploadError) {
        toast.error('Failed to upload image');
        return;
      }
      imageUrl = url;
    }
    
    const { error } = await createPost(imageUrl, post.caption);
    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post created!');
    }
  };

  const handleCreateStory = (story: { image: string; text?: string; music?: { name: string; artist: string } }) => {
    const newStory: Story = {
      id: Date.now().toString(),
      name: profile?.display_name || 'Your Story',
      image: profile?.avatar_url || undefined,
      storyImage: story.image,
      text: story.text,
      music: story.music,
      hasNewStory: true,
      timestamp: 'Just now'
    };
    setStories(prev => [newStory, ...prev]);
  };

  const handleStoryViewed = (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, hasNewStory: false }
        : story
    ));
  };

  const handleCreateReel = async (reel: { videoFile: File; caption?: string; audioName?: string }) => {
    const { error } = await createReel(reel.videoFile, reel.caption, reel.audioName);
    if (error) {
      toast.error('Failed to create reel');
    } else {
      toast.success('Reel created!');
    }
  };
  const handleLike = async (postId: string) => {
    // Find the post to get the user_id for algorithm tracking
    const post = dbPosts.find(p => p.id === postId);
    if (post) {
      recordLike(post.user_id);
    }
    await toggleLike(postId);
  };

  const handleSave = async (postId: string) => {
    await toggleSave(postId);
  };

  const handleRefresh = async () => {
    await refetchPosts();
  };

  const handleTabChange = (tab: TabType) => {
    clearHistory();
    setOriginTab(tab);
    setActiveTab(tab);
  };

  const handleNavigate = (screen: 'notifications' | 'create-post' | 'create-story') => {
    navigate(screen);
  };

  // If there's a current navigation node, render the screen router
  if (currentNode) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScreenRouter
            onBack={() => clearHistory()}
            onCreatePost={handleCreatePost}
            onCreateStory={handleCreateStory}
            onCreateReel={handleCreateReel}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSignOut={signOut}
            user={profile ? {
              id: profile.user_id,
              displayName: profile.display_name,
              username: profile.username,
              email: '',
              bio: profile.bio,
              avatarUrl: profile.avatar_url || undefined,
              isVerified: profile.is_verified
            } : undefined}
            onUpdateUser={(updates) => updateProfile({
              display_name: updates.displayName,
              username: updates.username,
              bio: updates.bio,
              avatar_url: updates.avatarUrl
            })}
            isAdmin={isAdmin}
            onVerifyUser={verifyUser}
            onSetSimulatedFollowers={setSimulatedFollowers}
            getAllProfiles={getAllProfiles}
          />
        </div>
        {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
        <Toaster position="top-center" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            onCreatePost={() => handleNavigate('create-post')}
            onCreateStory={() => handleNavigate('create-story')}
            onNotifications={() => handleNavigate('notifications')}
            stories={stories}
            posts={feedPosts}
            onLike={handleLike}
            onSave={handleSave}
            onStoryViewed={handleStoryViewed}
            currentUserId={profile?.user_id}
            onRefresh={handleRefresh}
          />
        );
      case 'search':
        navigate('search');
        return null;
      case 'chat':
        return <ChatTab currentUserId={profile?.user_id} />;
      case 'reels':
        return (
          <ReelsTab 
            currentUserId={profile?.user_id}
            onCreateReel={() => navigate('create-reel')}
          />
        );
      case 'account':
        return profile ? (
          <AccountTab 
            user={{
              id: profile.user_id,
              displayName: profile.display_name,
              username: profile.username,
              email: user?.email || '',
              bio: profile.bio,
              avatarUrl: profile.avatar_url || undefined,
              isVerified: profile.is_verified,
              simulatedFollowers: profile.simulated_followers,
              createdAt: new Date(profile.created_at)
            }} 
            isAdmin={isAdmin}
            onVerifyUser={verifyUser}
            getAllProfiles={getAllProfiles}
            onSignOut={signOut} 
            isDark={isDark} 
            onToggleTheme={toggleTheme}
            onUpdateUser={(updates) => updateProfile({
              display_name: updates.displayName,
              username: updates.username,
              bio: updates.bio,
              avatar_url: updates.avatarUrl
            })}
          />
        ) : null;
      default:
        return (
          <HomeTab 
            onCreatePost={() => handleNavigate('create-post')}
            onCreateStory={() => handleNavigate('create-story')}
            onNotifications={() => handleNavigate('notifications')}
            stories={stories}
            posts={feedPosts}
            onLike={handleLike}
            onSave={handleSave}
            onStoryViewed={handleStoryViewed}
          />
        );
    }
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div 
        className={cn(
          "flex-1 overflow-hidden transition-transform duration-200 ease-out",
          !isSwiping && "transition-transform duration-300"
        )}
        style={{ 
          transform: isSwiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
        }}
        {...swipeHandlers}
      >
        {renderTab()}
      </div>
      {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
      <Toaster position="top-center" />
    </div>
  );
};

const Index = () => {
  return (
    <NavigationProvider>
      <MainContent />
    </NavigationProvider>
  );
};

export default Index;
