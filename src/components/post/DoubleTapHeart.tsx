import { useState, useCallback, useRef } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoubleTapHeartProps {
  children: React.ReactNode;
  onDoubleTap: () => void;
  isLiked?: boolean;
}

export const DoubleTapHeart = ({ children, onDoubleTap, isLiked }: DoubleTapHeartProps) => {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        onDoubleTap();
      }
      
      // Show heart animation
      setShowHeart(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowHeart(false);
      }, 1000);
    }

    lastTapRef.current = now;
  }, [onDoubleTap, isLiked]);

  return (
    <div className="relative" onClick={handleTap}>
      {children}
      
      {/* Heart Animation Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none",
          showHeart ? "opacity-100" : "opacity-0"
        )}
      >
        <Heart 
          className={cn(
            "w-24 h-24 text-white fill-white drop-shadow-lg transition-all duration-300",
            showHeart ? "scale-100 animate-heart-pop" : "scale-0"
          )}
        />
      </div>
    </div>
  );
};