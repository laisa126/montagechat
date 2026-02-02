import React, { useState } from 'react';
import { ArrowLeft, Heart, Send, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useNavigation } from '../NavigationContext';
import { NavigableAvatar, NavigableUsername } from '../NavigableElements';
import { useHaptic } from '@/hooks/useHaptic';
import { useComments, Comment } from '@/hooks/useComments';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentThreadScreenProps {
  postId: string;
  currentUserId?: string;
}

export const CommentThreadScreen: React.FC<CommentThreadScreenProps> = ({ postId, currentUserId }) => {
  const { goBack } = useNavigation();
  const { trigger } = useHaptic();
  const { comments, loading, addComment, deleteComment, likeComment } = useComments(postId, currentUserId);
  
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleLikeComment = (commentId: string) => {
    trigger('light');
    likeComment(commentId);
  };

  const handleDeleteComment = async (commentId: string) => {
    trigger('medium');
    const { error } = await deleteComment(commentId);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Comment deleted');
    }
  };

  const handleReply = (comment: Comment) => {
    trigger('light');
    setReplyingTo({ id: comment.id, username: comment.username });
    setCommentText(`@${comment.username} `);
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || submitting) return;
    trigger('medium');
    
    setSubmitting(true);
    const { error } = await addComment(commentText, replyingTo?.id);
    setSubmitting(false);
    
    if (error) {
      toast.error(error);
    } else {
      setCommentText('');
      setReplyingTo(null);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id} 
      className={cn(
        "px-4 py-3 flex gap-3 animate-fade-in",
        isReply && "pl-12"
      )}
    >
      <NavigableAvatar
        userId={comment.userId}
        username={comment.username}
        displayName={comment.displayName}
        avatarUrl={comment.avatarUrl}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="inline-flex items-center gap-1 mr-1">
            <NavigableUsername
              userId={comment.userId}
              username={comment.username}
            />
            {comment.isVerified && <VerifiedBadge size="sm" />}
          </span>
          {comment.text}
        </p>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
          {comment.likes > 0 && (
            <button className="text-xs text-muted-foreground font-semibold">
              {comment.likes} {comment.likes === 1 ? 'like' : 'likes'}
            </button>
          )}
          <button 
            onClick={() => handleReply(comment)}
            className="text-xs text-muted-foreground font-semibold active:opacity-70"
          >
            Reply
          </button>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-1">
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
        
        {comment.userId === currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 active:scale-90 transition-transform">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleDeleteComment(comment.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-muted-foreground">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t border-border/50 bg-background">
        {replyingTo && (
          <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Replying to <span className="font-semibold">@{replyingTo.username}</span>
            </span>
            <button 
              onClick={cancelReply}
              className="text-sm text-primary font-medium"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="px-4 py-3 flex items-center gap-3">
          <Input
            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-muted border-0"
            onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
            disabled={submitting}
          />
          <button
            onClick={handlePostComment}
            disabled={!commentText.trim() || submitting}
            className={cn(
              "p-2 active:scale-90 transition-transform",
              (!commentText.trim() || submitting) && "opacity-50"
            )}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Send className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
