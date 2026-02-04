import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

interface StoryData {
  id: string;
  user_id: string;
  image_url: string | null;
  text_content: string | null;
  music_name: string | null;
  music_artist: string | null;
  background_color: string | null;
  created_at: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

const StoryPage = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) return;

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          image_url,
          text_content,
          music_name,
          music_artist,
          background_color,
          created_at
        `)
        .eq('id', storyId)
        .single();

      if (error) {
        console.error('Error fetching story:', error);
        setLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('user_id', data.user_id)
        .single();

      setStoryData({
        ...data,
        username: profileData?.username || 'user',
        display_name: profileData?.display_name || 'User',
        avatar_url: profileData?.avatar_url
      });
      setLoading(false);
    };

    fetchStory();
  }, [storyId]);

  const handleClose = () => {
    navigate(-1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Story not found</h1>
          <p className="text-muted-foreground">This story may have expired or been deleted</p>
        </div>
      </div>
    );
  }

  const story = {
    id: storyData.id,
    name: storyData.display_name,
    image: storyData.avatar_url || undefined,
    storyImage: storyData.image_url || undefined,
    text: storyData.text_content || undefined,
    music: storyData.music_name && storyData.music_artist ? {
      name: storyData.music_name,
      artist: storyData.music_artist
    } : undefined,
    timestamp: new Date(storyData.created_at).toLocaleString(),
    isOwn: storyData.user_id === currentUserProfile?.user_id
  };

  return (
    <StoryViewer
      stories={[story]}
      initialIndex={0}
      onClose={handleClose}
    />
  );
};

export default StoryPage;
