 import { useNavigate } from 'react-router-dom';
 import { SettingsScreen } from '@/components/settings/SettingsScreen';
 import { NavigationProvider } from '@/navigation/NavigationContext';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { useTheme } from '@/hooks/useTheme';
 import { Loader2 } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 
 const SettingsPage = () => {
   const navigate = useNavigate();
   const { profile: currentUserProfile, isAuthenticated, loading: authLoading, isAdmin } = useSupabaseAuth();
   const { isDark, toggleTheme } = useTheme();
 
   const handleBack = () => {
     navigate(-1);
   };
 
   const handleSignOut = async () => {
     await supabase.auth.signOut();
     navigate('/');
   };
 
   const handleUpdateUser = async (updates: { displayName?: string; username?: string; bio?: string; avatarUrl?: string }) => {
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
 
   const handleVerifyUser = async (userId: string, verified: boolean) => {
     const { error } = await supabase.rpc('verify_user', { target_user_id: userId, verified });
     return { error: error?.message || null };
   };
 
   const handleSetSimulatedFollowers = async (userId: string, count: number) => {
     const { error } = await supabase.rpc('set_simulated_followers', { target_user_id: userId, follower_count: count });
     return { error: error?.message || null };
   };
 
   const getAllProfiles = async () => {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .order('created_at', { ascending: false });
     return { data, error: error?.message || null };
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
         <SettingsScreen
           onBack={handleBack}
           isDark={isDark}
           onToggleTheme={toggleTheme}
           onSignOut={handleSignOut}
           user={{
             id: currentUserProfile.user_id,
             displayName: currentUserProfile.display_name,
             username: currentUserProfile.username,
             email: '',
             bio: currentUserProfile.bio || undefined,
             isVerified: currentUserProfile.is_verified || false
           }}
           onUpdateUser={handleUpdateUser}
           isAdmin={isAdmin}
           onVerifyUser={handleVerifyUser}
           onSetSimulatedFollowers={handleSetSimulatedFollowers}
           getAllProfiles={getAllProfiles}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default SettingsPage;