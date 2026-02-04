import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
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

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

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
            <Route path="/p/:postId" element={<PostPage />} />
            <Route path="/reel/:reelId" element={<ReelPage />} />
            <Route path="/stories/:storyId" element={<StoryPage />} />
            <Route path="/direct/:username" element={<DMPage />} />
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
