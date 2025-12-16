import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useHaptic } from '@/hooks/useHaptic';
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

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryViewed?: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export const StoryViewer = ({ stories, initialIndex, onClose, onStoryViewed }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { trigger } = useHaptic();

  const currentStory = stories[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      trigger('light');
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      onStoryViewed?.(currentStory.id);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, trigger, onClose, onStoryViewed, currentStory?.id]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      trigger('light');
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex, trigger]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const screenWidth = window.innerWidth;
    
    if (clientX < screenWidth / 3) {
      goToPrev();
    } else if (clientX > (screenWidth * 2) / 3) {
      goToNext();
    } else {
      setIsPaused(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 animate-fade-in">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-50 px-2 pt-2 safe-area-top">
        <div className="flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-50 ease-linear"
                style={{
                  width: index < currentIndex 
                    ? '100%' 
                    : index === currentIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-4 left-0 right-0 z-50 px-4 pt-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 ring-2 ring-white/50">
              {currentStory.image ? (
                <img src={currentStory.image} alt={currentStory.name} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-muted text-xs">
                  {currentStory.name[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">{currentStory.name}</span>
              <span className="text-white/60 text-xs">{currentStory.timestamp || 'Just now'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                trigger('light');
                setIsPaused(!isPaused);
              }}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-white" fill="white" />
              ) : (
                <Pause className="w-4 h-4 text-white" fill="white" />
              )}
            </button>
            
            {currentStory.music && (
              <button
                onClick={() => {
                  trigger('light');
                  setIsMuted(!isMuted);
                }}
                className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
            )}
            
            <button
              onClick={() => {
                trigger('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentStory.storyImage ? (
          <img
            src={currentStory.storyImage}
            alt="Story"
            className="w-full h-full object-cover animate-scale-in"
          />
        ) : currentStory.image ? (
          <img
            src={currentStory.image}
            alt="Story"
            className="w-full h-full object-cover animate-scale-in"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <span className="text-white text-6xl font-bold">{currentStory.name[0]}</span>
          </div>
        )}

        {/* Text Overlay */}
        {currentStory.text && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-3xl font-bold text-center text-white drop-shadow-lg">
              {currentStory.text}
            </p>
          </div>
        )}
      </div>

      {/* Music indicator */}
      {currentStory.music && (
        <div className="absolute bottom-20 left-4 right-4 safe-area-bottom">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 animate-fade-in">
            <div className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center",
              !isPaused && !isMuted && "animate-pulse"
            )}>
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentStory.music.name}</p>
              <p className="text-white/60 text-xs truncate">{currentStory.music.artist}</p>
            </div>
            {/* Audio visualizer bars */}
            {!isPaused && !isMuted && (
              <div className="flex items-end gap-0.5 h-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: `${300 + i * 100}ms`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation hints */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-8 h-8 text-white/50" />
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <ChevronRight className="w-8 h-8 text-white/50" />
      </div>
    </div>
  );
};