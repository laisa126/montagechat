import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReelViewerScreen } from '@/navigation/screens/ReelViewerScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

const ReelPage = () => {
  const { reelId } = useParams<{ reelId: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkReel = async () => {
      if (!reelId) return;

      const { data, error } = await supabase
        .from('reels')
        .select('id')
        .eq('id', reelId)
        .single();

      if (error) {
        console.error('Error checking reel:', error);
        setExists(false);
      } else {
        setExists(true);
      }
      setLoading(false);
    };

    checkReel();
  }, [reelId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Reel not found</h1>
          <p className="text-muted-foreground">This reel may have been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <div className="h-screen w-full bg-black overflow-hidden">
        <ReelViewerScreen
          reelId={reelId}
          initialIndex={0}
        />
      </div>
    </NavigationProvider>
  );
};

export default ReelPage;
