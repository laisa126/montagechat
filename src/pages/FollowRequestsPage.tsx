 import { useNavigate } from 'react-router-dom';
 import { FollowRequestsScreen } from '@/navigation/screens/FollowRequestsScreen';
 import { NavigationProvider } from '@/navigation/NavigationContext';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { Loader2 } from 'lucide-react';
 
 const FollowRequestsPage = () => {
   const navigate = useNavigate();
   const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!isAuthenticated) {
     navigate('/');
     return null;
   }
 
   return (
     <NavigationProvider>
       <div className="h-screen w-full bg-background overflow-hidden">
         <FollowRequestsScreen
           currentUserId={currentUserProfile?.user_id}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default FollowRequestsPage;