import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useNavigation } from '../NavigationContext';
import { NavigableAvatar, NavigableUsername, NavigableComment, NavigableLikeCount } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface PostDetailScreenProps {
  postId: string;
  imageUrl?: string;
  username?: string;
  userId?: string;
  showLikes?: boolean;
}

interface Post {
  id: string;
  username: string;
  userId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  postId,
  imageUrl,
  username,
  userId,
  showLikes
}) => {
  const { goBack, navigate } = useNavigation();
  const { trigger } = useHaptic();
  
  const [posts, setPosts] = useLocalStorage<Post[]>('app-posts', []);
  const post = posts.find(p => p.id === postId);
  const [commentText, setCommentText] = useState('');

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleLike = () => {
    trigger('medium');
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handleSave = () => {
    trigger('light');
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, isSaved: !p.isSaved }
        : p
    ));
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    trigger('light');
    // Add comment logic here
    setCommentText('');
  };

  if (!post) {
    return (
      <div className="flex flex-col h-full bg-background animate-slide-in-right">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 -ml-1 active:scale-90 transition-transform">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 -ml-1 active:scale-90 transition-transform">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
          <button className="p-1 active:scale-90 transition-transform">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <article className="pb-20">
          {/* Post Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <NavigableAvatar
                userId={post.userId}
                username={post.username}
                displayName={post.username}
                size="sm"
              />
              <NavigableUsername
                userId={post.userId}
                username={post.username}
              />
            </div>
          </div>

          {/* Post Image */}
          <div className="aspect-square bg-muted">
            {post.image ? (
              <img src={post.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLike}
                  className="active:scale-75 transition-transform duration-200"
                >
                  <Heart 
                    className={cn(
                      "w-7 h-7 transition-all duration-200",
                      post.isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                    )} 
                  />
                </button>
                <button 
                  onClick={() => navigate('comment-thread', { postId })}
                  className="active:scale-90 transition-transform duration-200"
                >
                  <MessageCircle className="w-7 h-7 text-foreground" />
                </button>
                <button className="active:scale-90 transition-transform duration-200">
                  <Send className="w-7 h-7 text-foreground" />
                </button>
              </div>
              <button 
                onClick={handleSave}
                className="active:scale-90 transition-transform duration-200"
              >
                <Bookmark 
                  className={cn(
                    "w-7 h-7 transition-all duration-200",
                    post.isSaved ? 'fill-foreground text-foreground' : 'text-foreground'
                  )} 
                />
              </button>
            </div>

            <NavigableLikeCount postId={postId} count={post.likes} />
            
            <p className="text-sm mt-2">
              <NavigableUsername
                userId={post.userId}
                username={post.username}
                className="mr-1"
              />
              {post.content}
            </p>

            {post.comments > 0 && (
              <NavigableComment postId={postId} commentCount={post.comments} className="mt-2 block" />
            )}
            
            <p className="text-xs text-muted-foreground mt-2">{post.timeAgo}</p>
          </div>
        </article>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t border-border/50 px-4 py-3 bg-background">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-muted border-0"
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className={cn(
              "text-primary font-semibold text-sm",
              !commentText.trim() && "opacity-50"
            )}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
