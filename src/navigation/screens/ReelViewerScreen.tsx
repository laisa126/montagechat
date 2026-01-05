import { useState, useCallback, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music2, MoreVertical, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface Reel {
  id: string;
  username: string;
  userId: string;
  caption: string;
  audioName: string;
  audioId?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  hashtags?: string[];
}

interface ReelViewerScreenProps {
  reelId?: string;
  initialIndex?: number;
}

export const ReelViewerScreen = ({ reelId, initialIndex = 0 }: ReelViewerScreenProps) => {
  const { navigate, goBack } = useNavigation();
  const { trigger } = useHaptic();
  
  // Empty reels - would come from database in production
  const [reels, setReels] = useState<Reel[]>([]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const currentReel = reels[currentIndex];

  const handleSwipeUp = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      trigger('light');
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, reels.length, trigger]);

  const handleSwipeDown = useCallback(() => {
    if (currentIndex > 0) {
      trigger('light');
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, trigger]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY.current;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleSwipeUp();
      } else {
        handleSwipeDown();
      }
    }
  };

  const handleLike = () => {
    trigger('medium');
    setReels(prev => prev.map((reel, i) => 
      i === currentIndex 
        ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
        : reel
    ));
  };

  const handleSave = () => {
    trigger('light');
    setReels(prev => prev.map((reel, i) => 
      i === currentIndex 
        ? { ...reel, isSaved: !reel.isSaved }
        : reel
    ));
  };

  const handleProfileTap = () => {
    trigger('light');
    navigate('profile', {
      userId: currentReel.userId,
      username: currentReel.username,
      displayName: currentReel.username
    });
  };

  const handleCommentsTap = () => {
    trigger('light');
    navigate('comment-thread', { postId: currentReel.id });
  };

  const handleHashtagTap = (hashtag: string) => {
    trigger('light');
    navigate('search-results', { query: `#${hashtag}`, type: 'hashtag' });
  };

  const handleAudioTap = () => {
    if (currentReel.audioId) {
      trigger('light');
      navigate('search-results', { query: currentReel.audioName, type: 'audio' });
    }
  };

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  if (!currentReel) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-white">No reels available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reel Content Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted/20 to-muted/40">
        <span className="text-white/50">Reel Video</span>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <span className="text-white font-semibold">Reels</span>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 -mr-2 active:scale-90 transition-transform"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Swipe indicators */}
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col gap-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 rounded-full transition-all",
              index === currentIndex ? "h-4 bg-white" : "h-2 bg-white/40"
            )}
          />
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Profile Avatar */}
        <button 
          onClick={handleProfileTap}
          className="relative active:scale-90 transition-transform"
        >
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarFallback className="bg-muted text-foreground text-sm">
              {currentReel.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
            <span className="text-primary-foreground text-xs">+</span>
          </div>
        </button>

        {/* Like */}
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <Heart
            className={cn(
              "w-7 h-7 transition-all",
              currentReel.isLiked ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
          <span className="text-white text-xs font-medium">
            {currentReel.likes.toLocaleString()}
          </span>
        </button>
        
        {/* Comments */}
        <button 
          onClick={handleCommentsTap}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">
            {currentReel.comments.toLocaleString()}
          </span>
        </button>
        
        {/* Share */}
        <button className="active:scale-90 transition-transform">
          <Send className="w-7 h-7 text-white" />
        </button>
        
        {/* Save */}
        <button 
          onClick={handleSave}
          className="active:scale-90 transition-transform"
        >
          <Bookmark
            className={cn(
              "w-7 h-7 transition-all",
              currentReel.isSaved ? "fill-white text-white" : "text-white"
            )}
          />
        </button>
        
        {/* More */}
        <button className="active:scale-90 transition-transform">
          <MoreVertical className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-0 right-16 bottom-20 px-4 pb-4 z-10">
        {/* Username */}
        <button 
          onClick={handleProfileTap}
          className="flex items-center gap-2 mb-3 active:opacity-80"
        >
          <span className="text-white font-semibold text-sm">
            @{currentReel.username}
          </span>
          <button className="px-3 py-1 border border-white rounded-lg text-white text-xs font-semibold active:bg-white/20 transition-colors">
            Follow
          </button>
        </button>

        {/* Caption with hashtags */}
        <p className="text-white text-sm mb-3">
          {currentReel.caption.split(' ').map((word, i) => {
            if (word.startsWith('#')) {
              const hashtag = word.substring(1).replace(/[^a-zA-Z0-9]/g, '');
              return (
                <button
                  key={i}
                  onClick={() => handleHashtagTap(hashtag)}
                  className="text-white/80 font-semibold active:underline"
                >
                  {word}{' '}
                </button>
              );
            }
            return <span key={i}>{word} </span>;
          })}
        </p>

        {/* Audio */}
        <button 
          onClick={handleAudioTap}
          className="flex items-center gap-2 active:opacity-80"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-xs truncate flex-1">{currentReel.audioName}</p>
        </button>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs animate-pulse">
        Swipe up for next
      </div>
    </div>
  );
};
