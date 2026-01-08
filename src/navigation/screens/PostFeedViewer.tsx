import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { NavigableAvatar, NavigableUsername, NavigableLikeCount, NavigableComment } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  imageUrl: string;
  type?: 'image' | 'reel';
  likes?: number;
  comments?: number;
  caption?: string;
}

interface PostFeedViewerProps {
  posts: Post[];
  initialIndex: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export const PostFeedViewer: React.FC<PostFeedViewerProps> = ({
  posts,
  initialIndex,
  userId,
  username,
  displayName,
  avatarUrl,
  isVerified
}) => {
  const { goBack } = useNavigation();
  const { trigger } = useHaptic();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  // Scroll to initial post on mount
  useEffect(() => {
    if (scrollRef.current && initialIndex > 0) {
      const postElement = scrollRef.current.querySelector(`[data-post-index="${initialIndex}"]`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  }, [initialIndex]);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleLike = (postId: string) => {
    trigger('light');
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleSave = (postId: string) => {
    trigger('light');
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleDoubleTap = (postId: string) => {
    trigger('medium');
    if (!likedPosts.has(postId)) {
      setLikedPosts(prev => new Set([...prev, postId]));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Posts</h1>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="pb-20">
          {posts.map((post, index) => (
            <article 
              key={post.id}
              data-post-index={index}
              className="border-b border-border/30"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <NavigableAvatar
                    userId={userId}
                    username={username}
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                    size="sm"
                  />
                  <div className="flex items-center gap-1">
                    <NavigableUsername
                      userId={userId}
                      username={username}
                      displayName={displayName}
                      isVerified={isVerified}
                    />
                  </div>
                </div>
                <button className="p-1 active:scale-90 transition-transform">
                  <MoreHorizontal className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Post Image - Double tap to like */}
              <div 
                className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative"
                onDoubleClick={() => handleDoubleTap(post.id)}
              >
                <img 
                  src={post.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                {/* Heart animation on double tap */}
                {likedPosts.has(post.id) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Heart className="w-20 h-20 fill-white text-white animate-scale-in opacity-0" />
                  </div>
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
                          likedPosts.has(post.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-foreground'
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
                        savedPosts.has(post.id) ? 'fill-foreground text-foreground' : 'text-foreground'
                      )} 
                    />
                  </button>
                </div>
                
                <NavigableLikeCount 
                  postId={post.id} 
                  count={(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)} 
                />
                
                {post.caption && (
                  <p className="text-sm mt-1">
                    <NavigableUsername
                      userId={userId}
                      username={username}
                      className="mr-1"
                    />
                    {post.caption}
                  </p>
                )}
                
                {(post.comments || 0) > 0 && (
                  <NavigableComment 
                    postId={post.id} 
                    commentCount={post.comments} 
                    className="mt-1 block" 
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
