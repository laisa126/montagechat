 import { useNavigate } from 'react-router-dom';
 import { NotificationsScreen } from '@/components/notifications/NotificationsScreen';
 import { NavigationProvider } from '@/navigation/NavigationContext';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { Loader2 } from 'lucide-react';
 
 const NotificationsPage = () => {
   const navigate = useNavigate();
   const { profile: currentUserProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
 
   const handleBack = () => {
     navigate(-1);
   };
 
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
         <NotificationsScreen
           onBack={handleBack}
           currentUserId={currentUserProfile?.user_id}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default NotificationsPage;