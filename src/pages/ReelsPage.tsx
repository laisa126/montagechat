import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { NavigationProvider, useNavigation } from '@/navigation/NavigationContext';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { ScreenRouter } from '@/navigation/ScreenRouter';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

const ReelsContent = () => {
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
  const { currentNode, navigate: navNavigate, clearHistory } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('reels');

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

  if (currentNode) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScreenRouter
            onBack={() => clearHistory()}
            user={currentUserProfile ? {
              id: currentUserProfile.user_id,
              displayName: currentUserProfile.display_name,
              username: currentUserProfile.username,
              email: ''
            } : undefined}
          />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ReelsTab
          currentUserId={currentUserProfile?.user_id}
          onCreateReel={() => navNavigate('create-reel')}
        />
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

const ReelsPage = () => {
  return (
    <NavigationProvider>
      <ReelsContent />
    </NavigationProvider>
  );
};

export default ReelsPage;
