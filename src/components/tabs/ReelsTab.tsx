import { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music2, MoreVertical, Search, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigation } from '@/navigation/NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useReels } from '@/hooks/useReels';
import { cn } from '@/lib/utils';

interface ReelsTabProps {
  currentUserId?: string;
  onCreateReel?: () => void;
}

export const ReelsTab = ({ currentUserId, onCreateReel }: ReelsTabProps) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { reels, toggleLike, toggleSave } = useReels(currentUserId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenReel = (index: number) => {
    trigger('medium');
    navigate('reel-viewer', { initialIndex: index });
  };

  const handleSearch = () => {
    trigger('light');
    navigate('search');
  };

  const handleCreateReel = () => {
    trigger('light');
    onCreateReel?.();
  };

  if (reels.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleCreateReel}
              className="p-2 -ml-2 active:scale-90 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
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
          <button 
            onClick={handleCreateReel}
            className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <Plus className="w-10 h-10 text-muted-foreground" />
          </button>
          <h3 className="text-xl font-semibold mb-2">Create your first reel</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Share short videos with your followers
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
        <button 
          onClick={() => toggleLike(currentReel.id)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <Heart
            className={cn(
              "w-7 h-7",
              currentReel.is_liked ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
          <span className="text-white text-xs font-medium">
            {(currentReel.likes_count || 0).toLocaleString()}
          </span>
        </button>
        
        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">
            {(currentReel.comments_count || 0).toLocaleString()}
          </span>
        </button>
        
        <button className="active:scale-90 transition-transform">
          <Send className="w-7 h-7 text-white" />
        </button>
        
        <button 
          onClick={() => toggleSave(currentReel.id)}
          className="active:scale-90 transition-transform"
        >
          <Bookmark
            className={cn(
              "w-7 h-7",
              currentReel.is_saved ? "fill-white text-white" : "text-white"
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
            {currentReel.avatar_url && <AvatarImage src={currentReel.avatar_url} />}
            <AvatarFallback className="bg-white/20 text-white text-xs">
              {(currentReel.username || 'U')[0].toUpperCase()}
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
          <p className="text-white text-xs truncate">{currentReel.audio_name || 'Original Audio'}</p>
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
