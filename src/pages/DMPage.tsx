import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DMThreadScreen } from '@/navigation/screens/DMThreadScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

interface UserData {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

const DMPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
        return;
      }

      setUserData(data);
      setLoading(false);
    };

    fetchUser();
  }, [username]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">@{username} doesn't exist</p>
        </div>
      </div>
    );
  }

  if (!currentUserProfile) {
    return null;
  }

  return (
    <NavigationProvider>
      <div className="h-screen w-full bg-background overflow-hidden">
        <DMThreadScreen
          userId={userData.user_id}
          username={userData.username}
          displayName={userData.display_name}
          avatarUrl={userData.avatar_url || undefined}
          isVerified={userData.is_verified}
          currentUserId={currentUserProfile.user_id}
        />
      </div>
    </NavigationProvider>
  );
};

export default DMPage;
