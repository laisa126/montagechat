import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FollowListScreen } from '@/navigation/screens/FollowListScreen';
import { NavigationProvider } from '@/navigation/NavigationContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { PageLoader } from '@/components/ui/InstagramLoader';
 
 interface ProfileData {
   user_id: string;
   username: string;
 }
 
 const FollowersPage = () => {
   const { username } = useParams<{ username: string }>();
   const navigate = useNavigate();
   const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
   const [profileData, setProfileData] = useState<ProfileData | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchProfile = async () => {
       if (!username) return;
 
       const { data, error } = await supabase
         .from('profiles')
         .select('user_id, username')
         .eq('username', username)
         .maybeSingle();
 
       if (error || !data) {
         console.error('Error fetching profile:', error);
         setLoading(false);
         return;
       }
 
       setProfileData(data);
       setLoading(false);
     };
 
     fetchProfile();
   }, [username]);
 
  if (authLoading || loading) {
    return <PageLoader />;
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
       <div className="h-screen w-full bg-background overflow-hidden">
         <FollowListScreen
           userId={profileData.user_id}
           username={profileData.username}
           initialTab="followers"
           currentUserId={currentUserProfile?.user_id}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default FollowersPage;