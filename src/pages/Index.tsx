import { useState } from 'react';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { AccountTab } from '@/components/tabs/AccountTab';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { NotificationsScreen } from '@/components/notifications/NotificationsScreen';
import { PostCreationScreen } from '@/components/create/PostCreationScreen';
import { StoryCreationScreen } from '@/components/create/StoryCreationScreen';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

type Screen = 'main' | 'notifications' | 'create-post' | 'create-story';

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
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const { user, signUp, updateUser, signOut, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { swipeOffset, isSwiping, swipeHandlers } = useSwipeNavigation(activeTab, setActiveTab);
  
  const [stories, setStories] = useLocalStorage<Story[]>('app-stories', []);
  const [posts, setPosts] = useLocalStorage<Post[]>('app-posts', []);

  if (!isAuthenticated) {
    return <SignUpScreen onSignUp={signUp} />;
  }

  const handleCreatePost = (post: { image?: string; caption: string }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      username: user?.username || 'user',
      content: post.caption,
      image: post.image,
      likes: 0,
      comments: 0,
      timeAgo: 'Just now',
      isLiked: false,
      isSaved: false
    };
    setPosts(prev => [newPost, ...prev]);
    setCurrentScreen('main');
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
    setCurrentScreen('main');
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

  // Render independent screens
  if (currentScreen === 'notifications') {
    return <NotificationsScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'create-post') {
    return <PostCreationScreen onBack={() => setCurrentScreen('main')} onPost={handleCreatePost} />;
  }

  if (currentScreen === 'create-story') {
    return <StoryCreationScreen onBack={() => setCurrentScreen('main')} onPost={handleCreateStory} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            onCreatePost={() => setCurrentScreen('create-post')}
            onCreateStory={() => setCurrentScreen('create-story')}
            onNotifications={() => setCurrentScreen('notifications')}
            stories={stories}
            posts={posts}
            onLike={handleLike}
            onSave={handleSave}
            onStoryViewed={handleStoryViewed}
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
            onCreatePost={() => setCurrentScreen('create-post')}
            onCreateStory={() => setCurrentScreen('create-story')}
            onNotifications={() => setCurrentScreen('notifications')}
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
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
