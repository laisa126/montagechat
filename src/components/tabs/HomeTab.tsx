import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Bell, Plus, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { NavigableAvatar, NavigableUsername, NavigableLikeCount, NavigableComment } from '@/navigation/NavigableElements';
import { useNavigation } from '@/navigation/NavigationContext';
import { SuggestedUsers } from '@/components/profile/SuggestedUsers';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  name: string;
  image?: string;
  isOwn?: boolean;
  hasNewStory?: boolean;
  storyImage?: string;
  text?: string;
  music?: { name: string; artist: string };
  timestamp?: string;
}

interface Post {
  id: string;
  username: string;
  userId?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface HomeTabProps {
  onCreatePost: () => void;
  onCreateStory: () => void;
  onNotifications: () => void;
  stories: Story[];
  posts: Post[];
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onStoryViewed?: (storyId: string) => void;
  currentUserId?: string;
}

export const HomeTab = ({ 
  onCreatePost, 
  onCreateStory, 
  onNotifications,
  stories,
  posts,
  onLike,
  onSave,
  onStoryViewed,
  currentUserId
}: HomeTabProps) => {
  const [hasNotification] = useState(true);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const { trigger } = useHaptic();
  const { t } = useLanguage();
  const { navigate } = useNavigation();

  const handleSearch = () => {
    trigger('light');
    navigate('search');
  };

  const handleLike = (postId: string) => {
    trigger('light');
    onLike(postId);
  };

  const handleSave = (postId: string) => {
    trigger('light');
    onSave(postId);
  };

  const handleViewStory = (index: number) => {
    trigger('medium');
    setViewingStoryIndex(index);
  };

  const viewableStories = stories.filter(s => !s.isOwn && s.hasNewStory);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Story Viewer */}
      {viewingStoryIndex !== null && viewableStories.length > 0 && (
        <StoryViewer
          stories={viewableStories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          onStoryViewed={onStoryViewed}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Create Post Icon - Left - Bold modern plus */}
          <button 
            onClick={() => {
              trigger('light');
              onCreatePost();
            }}
            className="p-2 -ml-2 active:scale-90 transition-transform duration-200"
          >
            <Plus 
              className="w-7 h-7 text-foreground transition-transform duration-200 hover:scale-110" 
              strokeWidth={2.5}
            />
          </button>

          <h1 className="text-xl font-bold tracking-tight">{t('feed')}</h1>

          <div className="flex items-center gap-1">
            {/* Search Icon */}
            <button 
              onClick={handleSearch}
              className="p-2 active:scale-90 transition-transform duration-200"
            >
              <Search 
                className="w-6 h-6 text-foreground transition-transform duration-200 hover:scale-110" 
                strokeWidth={1.5}
              />
            </button>

            {/* Notification Icon */}
            <button 
              onClick={() => {
                trigger('light');
                onNotifications();
              }}
              className="relative p-2 -mr-2 active:scale-90 transition-transform duration-200"
            >
              <Bell 
                className="w-6 h-6 text-foreground transition-transform duration-200 hover:scale-110" 
                strokeWidth={1.5}
              />
              {hasNotification && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        {/* Stories */}
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {/* Add Story Button */}
            <button
              onClick={() => {
                trigger('light');
                onCreateStory();
              }}
              className="flex flex-col items-center gap-1 min-w-[64px] animate-scale-in"
            >
              <div className="relative">
                <div className="p-0.5 rounded-full bg-muted">
                  <div className="p-0.5 bg-background rounded-full">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <Plus className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <Plus className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                {t('yourStory')}
              </span>
            </button>

            {stories.filter(s => !s.isOwn).map((story, index) => (
              <button 
                key={story.id} 
                onClick={() => story.hasNewStory && handleViewStory(stories.filter(s => !s.isOwn && s.hasNewStory).findIndex(s => s.id === story.id))}
                className="flex flex-col items-center gap-1 min-w-[64px] animate-scale-in"
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                <div className={cn(
                  "p-0.5 rounded-full transition-transform duration-200 hover:scale-105 active:scale-95",
                  story.hasNewStory ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-muted'
                )}>
                  <div className="p-0.5 bg-background rounded-full">
                    <Avatar className="w-14 h-14">
                      {story.image ? (
                        <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                          {story.name[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                  {story.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Users */}
        <SuggestedUsers 
          currentUserId={currentUserId} 
          className="border-b border-border/30"
        />

        {/* Posts */}
        <div className="pb-20">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t('noPostsYet')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('startFollowing')}
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <article 
                key={post.id} 
                className="border-b border-border/30 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <NavigableAvatar
                      userId={post.userId || post.id}
                      username={post.username}
                      displayName={post.username}
                      size="sm"
                    />
                    <NavigableUsername
                      userId={post.userId || post.id}
                      username={post.username}
                    />
                  </div>
                  <button className="p-1 active:scale-90 transition-transform">
                    <MoreHorizontal className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Post Image */}
                <div className="aspect-square bg-muted flex items-center justify-center transition-opacity duration-300 overflow-hidden">
                  {post.image ? (
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground">Image</span>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)} 
                        className="active:scale-75 transition-transform duration-200"
                      >
                        <Heart 
                          className={cn(
                            "w-6 h-6 transition-all duration-200",
                            post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-foreground'
                          )} 
                        />
                      </button>
                      <NavigableComment postId={post.id}>
                        <MessageCircle className="w-6 h-6 text-foreground" />
                      </NavigableComment>
                      <button className="active:scale-90 transition-transform duration-200">
                        <Send className="w-6 h-6 text-foreground" />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleSave(post.id)} 
                      className="active:scale-90 transition-transform duration-200"
                    >
                      <Bookmark 
                        className={cn(
                          "w-6 h-6 transition-all duration-200",
                          post.isSaved ? 'fill-foreground text-foreground' : 'text-foreground'
                        )} 
                      />
                    </button>
                  </div>
                  <NavigableLikeCount postId={post.id} count={post.likes} />
                  <p className="text-sm mt-1">
                    <NavigableUsername
                      userId={post.userId || post.id}
                      username={post.username}
                      className="mr-1"
                    />
                    {post.content}
                  </p>
                  {post.comments > 0 && (
                    <NavigableComment postId={post.id} commentCount={post.comments} className="mt-1 block" />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{post.timeAgo}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
