 import { useParams, useNavigate } from 'react-router-dom';
 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { CommentThreadScreen } from '@/navigation/screens/CommentThreadScreen';
 import { NavigationProvider } from '@/navigation/NavigationContext';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { Loader2 } from 'lucide-react';
 
 const CommentsPage = () => {
   const { postId } = useParams<{ postId: string }>();
   const navigate = useNavigate();
   const { profile: currentUserProfile, loading: authLoading } = useSupabaseAuth();
   const [exists, setExists] = useState<boolean | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const checkPost = async () => {
       if (!postId) return;
 
       const { data, error } = await supabase
         .from('posts')
         .select('id')
         .eq('id', postId)
         .maybeSingle();
 
       setExists(!error && !!data);
       setLoading(false);
     };
 
     checkPost();
   }, [postId]);
 
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
           <h1 className="text-2xl font-bold mb-2">Post not found</h1>
           <p className="text-muted-foreground">This post may have been deleted</p>
         </div>
       </div>
     );
   }
 
   return (
     <NavigationProvider>
       <div className="h-screen w-full bg-background overflow-hidden">
         <CommentThreadScreen
           postId={postId!}
           currentUserId={currentUserProfile?.user_id}
         />
       </div>
     </NavigationProvider>
   );
 };
 
 export default CommentsPage;