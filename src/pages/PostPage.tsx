import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostDetailScreen } from '@/navigation/screens/PostDetailScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

interface PostData {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  username: string;
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_url,
          caption,
          profiles!posts_user_id_fkey (username)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        setLoading(false);
        return;
      }

      const profiles = data.profiles as { username: string } | null;
      setPostData({
        id: data.id,
        user_id: data.user_id,
        image_url: data.image_url,
        caption: data.caption,
        username: profiles?.username || 'user'
      });
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

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

  if (!postData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground">This post may have been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <PostDetailScreen
            postId={postData.id}
            imageUrl={postData.image_url || undefined}
            username={postData.username}
            userId={postData.user_id}
          />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </NavigationProvider>
  );
};

export default PostPage;
