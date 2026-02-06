import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/ui/InstagramLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load route pages for better performance
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const StoryPage = lazy(() => import("./pages/StoryPage"));
const ReelPage = lazy(() => import("./pages/ReelPage"));
const DMPage = lazy(() => import("./pages/DMPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const ReelsPage = lazy(() => import("./pages/ReelsPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const CommentsPage = lazy(() => import("./pages/CommentsPage"));
const FollowersPage = lazy(() => import("./pages/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/FollowingPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const FollowRequestsPage = lazy(() => import("./pages/FollowRequestsPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/accounts/edit" element={<EditProfilePage />} />
            <Route path="/accounts/settings" element={<SettingsPage />} />
            <Route path="/accounts/follow_requests" element={<FollowRequestsPage />} />
            <Route path="/p/:postId" element={<PostPage />} />
            <Route path="/p/:postId/comments" element={<CommentsPage />} />
            <Route path="/reel/:reelId" element={<ReelPage />} />
            <Route path="/stories/:storyId" element={<StoryPage />} />
            <Route path="/direct/:username" element={<DMPage />} />
            <Route path="/:username/followers" element={<FollowersPage />} />
            <Route path="/:username/following" element={<FollowingPage />} />
            <Route path="/:username" element={<ProfilePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
