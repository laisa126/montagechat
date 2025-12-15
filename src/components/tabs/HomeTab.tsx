import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Story {
  id: string;
  name: string;
  isOwn?: boolean;
  hasNewStory?: boolean;
}

interface Post {
  id: string;
  username: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

export const HomeTab = () => {
  const [stories] = useState<Story[]>([
    { id: '1', name: 'Your Story', isOwn: true },
  ]);

  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
      </header>

      <ScrollArea className="flex-1">
        {/* Stories */}
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-1 min-w-[64px]">
                <div className={`p-0.5 rounded-full ${story.isOwn ? 'bg-muted' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
                  <div className="p-0.5 bg-background rounded-full">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                        {story.isOwn ? '+' : story.name[0]}
                      </AvatarFallback>
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
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
              <p className="text-muted-foreground text-sm">
                Start following people to see their posts here
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="border-b border-border/30">
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {post.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{post.username}</span>
                  </div>
                  <button className="p-1">
                    <MoreHorizontal className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Post Image Placeholder */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Image</span>
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleLike(post.id)} className="active:scale-90 transition-transform">
                        <Heart 
                          className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
                        />
                      </button>
                      <button className="active:scale-90 transition-transform">
                        <MessageCircle className="w-6 h-6 text-foreground" />
                      </button>
                      <button className="active:scale-90 transition-transform">
                        <Send className="w-6 h-6 text-foreground" />
                      </button>
                    </div>
                    <button onClick={() => handleSave(post.id)} className="active:scale-90 transition-transform">
                      <Bookmark 
                        className={`w-6 h-6 ${post.isSaved ? 'fill-foreground text-foreground' : 'text-foreground'}`} 
                      />
                    </button>
                  </div>
                  <p className="font-semibold text-sm mb-1">{post.likes.toLocaleString()} likes</p>
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
