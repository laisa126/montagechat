import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChatTab } from '@/components/tabs/ChatTab';
import { NavigationProvider, useNavigation } from '@/navigation/NavigationContext';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { ScreenRouter } from '@/navigation/ScreenRouter';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

const MessagesContent = () => {
  const navigate = useNavigate();
  const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const { currentNode, clearHistory, hideBottomNav } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    clearHistory();
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'search':
        navigate('/explore');
        break;
      case 'reels':
        navigate('/reels');
        break;
      case 'chat':
        navigate('/messages');
        break;
      case 'account':
        if (currentUserProfile) {
          navigate(`/${currentUserProfile.username}`);
        }
        break;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUserProfile) return null;

  if (currentNode) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScreenRouter
            onBack={() => clearHistory()}
            user={{
              id: currentUserProfile.user_id,
              displayName: currentUserProfile.display_name,
              username: currentUserProfile.username,
              email: ''
            }}
          />
        </div>
        {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatTab currentUserId={currentUserProfile.user_id} />
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

const MessagesPage = () => {
  return (
    <NavigationProvider>
      <MessagesContent />
    </NavigationProvider>
  );
};

export default MessagesPage;
