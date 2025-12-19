import { useState } from 'react';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { AccountTab } from '@/components/tabs/AccountTab';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NavigationProvider, useNavigation } from '@/navigation/NavigationContext';
import { ScreenRouter } from '@/navigation/ScreenRouter';
import { cn } from '@/lib/utils';

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

interface Post {
  id: string;
  username: string;
  userId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

const MainContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, signUp, updateUser, signOut, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { swipeOffset, isSwiping, swipeHandlers } = useSwipeNavigation(activeTab, setActiveTab);
  const { currentNode, navigate, clearHistory, setOriginTab } = useNavigation();
  
  const [stories, setStories] = useLocalStorage<Story[]>('app-stories', []);
  const [posts, setPosts] = useLocalStorage<Post[]>('app-posts', []);

  if (!isAuthenticated) {
    return <SignUpScreen onSignUp={signUp} />;
  }

  const handleCreatePost = (post: { image?: string; caption: string }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      username: user?.username || 'user',
      userId: user?.id || 'current_user',
      content: post.caption,
      image: post.image,
      likes: 0,
      comments: 0,
      timeAgo: 'Just now',
      isLiked: false,
      isSaved: false
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleCreateStory = (story: { image: string; text?: string; music?: { name: string; artist: string } }) => {
    const newStory: Story = {
      id: Date.now().toString(),
      name: user?.displayName || 'Your Story',
      image: user?.avatarUrl,
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

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
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
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSignOut={signOut}
            user={user ? {
              id: user.id,
              displayName: user.displayName,
              username: user.username,
              email: user.email,
              bio: user.bio,
              avatarUrl: user.avatarUrl
            } : undefined}
            onUpdateUser={updateUser}
          />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
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
            posts={posts}
            onLike={handleLike}
            onSave={handleSave}
            onStoryViewed={handleStoryViewed}
            currentUserId={user?.id}
          />
        );
      case 'chat':
        return <ChatTab />;
      case 'reels':
        return <ReelsTab />;
      case 'account':
        return (
          <AccountTab 
            user={user!} 
            onSignOut={signOut} 
            isDark={isDark} 
            onToggleTheme={toggleTheme}
            onUpdateUser={updateUser}
          />
        );
      default:
        return (
          <HomeTab 
            onCreatePost={() => handleNavigate('create-post')}
            onCreateStory={() => handleNavigate('create-story')}
            onNotifications={() => handleNavigate('notifications')}
            stories={stories}
            posts={posts}
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
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
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
