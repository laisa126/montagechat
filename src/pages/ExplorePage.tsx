import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SearchScreen } from '@/navigation/screens/SearchScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

const ExplorePage = () => {
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<TabType>('search');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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

  return (
    <NavigationProvider>
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <SearchScreen currentUserId={currentUserProfile?.user_id} />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </NavigationProvider>
  );
};

export default ExplorePage;
