import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Bell, PlusSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  name: string;
  image?: string;
  isOwn?: boolean;
  hasNewStory?: boolean;
}

interface Post {
  id: string;
  username: string;
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
}

export const HomeTab = ({ 
  onCreatePost, 
  onCreateStory, 
  onNotifications,
  stories,
  posts,
  onLike,
  onSave
}: HomeTabProps) => {
  const [hasNotification] = useState(true);
  const { trigger } = useHaptic();
  const { t } = useLanguage();

  const handleLike = (postId: string) => {
    trigger('light');
    onLike(postId);
  };

  const handleSave = (postId: string) => {
    trigger('light');
    onSave(postId);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Create Post Icon - Left */}
          <button 
            onClick={() => {
              trigger('light');
              onCreatePost();
            }}
            className="p-2 -ml-2 active:scale-90 transition-transform duration-200"
          >
            <PlusSquare 
              className="w-6 h-6 text-foreground transition-transform duration-200 hover:scale-110" 
              strokeWidth={1.5}
            />
          </button>

          <h1 className="text-xl font-bold tracking-tight">{t('feed')}</h1>

          {/* Notification Icon - Right */}
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
              <div 
                key={story.id} 
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
              </div>
            ))}
          </div>
        </div>

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
                    <Avatar className="w-8 h-8 transition-transform duration-200 hover:scale-110">
                      <AvatarFallback className="bg-muted text-xs">
                        {post.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{post.username}</span>
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
                      <button className="active:scale-90 transition-transform duration-200">
                        <MessageCircle className="w-6 h-6 text-foreground" />
                      </button>
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
                  <p className="font-semibold text-sm mb-1">{post.likes.toLocaleString()} {t('likes')}</p>
                  <p className="text-sm">
                    <span className="font-semibold">{post.username}</span>{' '}
                    {post.content}
                  </p>
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
