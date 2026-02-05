 import { useNavigate } from 'react-router-dom';
 import { EditProfileScreen } from '@/components/profile/EditProfileScreen';
 import { NavigationProvider } from '@/navigation/NavigationContext';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { Loader2 } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 
 const EditProfilePage = () => {
   const navigate = useNavigate();
   const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
 
   const handleBack = () => {
     navigate(-1);
   };
 
   const handleSave = async (updates: { displayName?: string; username?: string; bio?: string; avatarUrl?: string }) => {
     if (!currentUserProfile?.user_id) return { error: 'Not authenticated' };
     
     const { error } = await supabase
       .from('profiles')
       .update({
         display_name: updates.displayName,
         username: updates.username,
         bio: updates.bio,
         avatar_url: updates.avatarUrl
       })
       .eq('user_id', currentUserProfile.user_id);
 
     return { error: error?.message || null };
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!isAuthenticated || !currentUserProfile) {
     navigate('/');
     return null;
   }
 
   return (
     <NavigationProvider>
       <div className="h-screen w-full bg-background overflow-hidden">
         <EditProfileScreen
           user={{
             id: currentUserProfile.user_id,
             username: currentUserProfile.username,
             displayName: currentUserProfile.display_name,
             bio: currentUserProfile.bio || undefined,
             avatarUrl: currentUserProfile.avatar_url || undefined,
             isVerified: currentUserProfile.is_verified || false
           }}
           onBack={handleBack}
           onSave={handleSave}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default EditProfilePage;