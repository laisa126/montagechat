import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music2, MoreVertical, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigation } from '@/navigation/NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface Reel {
  id: string;
  username: string;
  userId: string;
  caption: string;
  audioName: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

export const ReelsTab = () => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const [reels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenReel = (index: number) => {
    trigger('medium');
    navigate('reel-viewer', { initialIndex: index });
  };

  const handleSearch = () => {
    trigger('light');
    navigate('search');
  };

  if (reels.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Reels</h1>
            <button 
              onClick={handleSearch}
              className="p-2 -mr-2 active:scale-90 transition-transform"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
          {/* Smooth rounded cube with centered play button */}
          <button 
            onClick={() => handleOpenReel(0)}
            className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 fill-muted-foreground"
            >
              <path d="M6 4.75a.75.75 0 0 1 1.142-.638l11.5 7.25a.75.75 0 0 1 0 1.276l-11.5 7.25A.75.75 0 0 1 6 19.25V4.75z" />
            </svg>
          </button>
          <h3 className="text-xl font-semibold mb-2">No reels yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Reels from people you follow will appear here
          </p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="relative h-full bg-black overflow-hidden">
      {/* Reel Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <span className="text-muted-foreground">Reel Video</span>
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex">
        {/* Left side - tap to go back */}
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          className="w-1/3 h-full"
        />
        
        {/* Center - pause/play */}
        <div className="w-1/3 h-full" />
        
        {/* Right side - tap to go forward */}
        <button
          onClick={() => setCurrentIndex(Math.min(reels.length - 1, currentIndex + 1))}
          className="w-1/3 h-full"
        />
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <Heart
            className={cn(
              "w-7 h-7",
              currentReel.isLiked ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
          <span className="text-white text-xs font-medium">
            {currentReel.likes.toLocaleString()}
          </span>
        </button>
        
        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">
            {currentReel.comments.toLocaleString()}
          </span>
        </button>
        
        <button className="active:scale-90 transition-transform">
          <Send className="w-7 h-7 text-white" />
        </button>
        
        <button className="active:scale-90 transition-transform">
          <Bookmark
            className={cn(
              "w-7 h-7",
              currentReel.isSaved ? "fill-white text-white" : "text-white"
            )}
          />
        </button>
        
        <button className="active:scale-90 transition-transform">
          <MoreVertical className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-0 right-16 bottom-20 px-4 pb-4">
        {/* Username */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarFallback className="bg-white/20 text-white text-xs">
              {currentReel.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm">
            {currentReel.username}
          </span>
          <button className="px-3 py-1 border border-white rounded-lg text-white text-xs font-semibold">
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className="text-white text-sm mb-3 line-clamp-2">
          {currentReel.caption}
        </p>

        {/* Audio */}
        <div className="flex items-center gap-2">
          <Music2 className="w-3 h-3 text-white" />
          <p className="text-white text-xs truncate">{currentReel.audioName}</p>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 pt-12">
        {reels.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-all",
              index <= currentIndex ? "bg-white" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};
