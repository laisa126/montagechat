import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileScreen } from '@/navigation/screens/ProfileScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

interface ProfileData {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  simulated_followers: number;
  bio: string | null;
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('account');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified, simulated_followers, bio')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      setProfileData(data);
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">@{username} doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ProfileScreen
            userId={profileData.user_id}
            username={profileData.username}
            displayName={profileData.display_name}
            avatarUrl={profileData.avatar_url || undefined}
            isVerified={profileData.is_verified}
            currentUserId={currentUserProfile?.user_id}
          />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </NavigationProvider>
  );
};

export default ProfilePage;
