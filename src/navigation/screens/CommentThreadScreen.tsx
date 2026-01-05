import React, { useState } from 'react';
import { ArrowLeft, Heart, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useNavigation } from '../NavigationContext';
import { NavigableAvatar, NavigableUsername } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
  replies?: Comment[];
}

interface CommentThreadScreenProps {
  postId: string;
}

export const CommentThreadScreen: React.FC<CommentThreadScreenProps> = ({ postId }) => {
  const { goBack, navigate } = useNavigation();
  const { trigger } = useHaptic();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleLikeComment = (commentId: string) => {
    trigger('light');
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    trigger('medium');
    
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'current_user',
      username: 'you',
      text: commentText,
      likes: 0,
      isLiked: false,
      timeAgo: 'Just now'
    };
    
    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1 -ml-1 active:scale-90 transition-transform">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Comments</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="pb-20">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-muted-foreground">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="px-4 py-3 flex gap-3 animate-fade-in">
                <NavigableAvatar
                  userId={comment.userId}
                  username={comment.username}
                  displayName={comment.username}
                  avatarUrl={comment.avatarUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <NavigableUsername
                      userId={comment.userId}
                      username={comment.username}
                      className="mr-1"
                    />
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                    <button className="text-xs text-muted-foreground font-semibold">
                      {comment.likes} likes
                    </button>
                    <button className="text-xs text-muted-foreground font-semibold">
                      Reply
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => handleLikeComment(comment.id)}
                  className="p-1 active:scale-90 transition-transform"
                >
                  <Heart 
                    className={cn(
                      "w-4 h-4 transition-all",
                      comment.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                    )} 
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t border-border/50 px-4 py-3 bg-background">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-muted border-0"
            onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
          />
          <button
            onClick={handlePostComment}
            disabled={!commentText.trim()}
            className={cn(
              "p-2 active:scale-90 transition-transform",
              !commentText.trim() && "opacity-50"
            )}
          >
            <Send className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};
