import { useState, useRef, useCallback, TouchEvent } from 'react';

type TabType = 'home' | 'chat' | 'reels' | 'account';

const TAB_ORDER: TabType[] = ['home', 'chat', 'reels', 'account'];
const SWIPE_THRESHOLD = 50;

export const useSwipeNavigation = (
  activeTab: TabType,
  onTabChange: (tab: TabType) => void
) => {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    
    // Only horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeOffset(deltaX * 0.3);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    
    if (swipeOffset < -SWIPE_THRESHOLD && currentIndex < TAB_ORDER.length - 1) {
      // Swipe left - next tab
      onTabChange(TAB_ORDER[currentIndex + 1]);
    } else if (swipeOffset > SWIPE_THRESHOLD && currentIndex > 0) {
      // Swipe right - previous tab
      onTabChange(TAB_ORDER[currentIndex - 1]);
    }
    
    setSwipeOffset(0);
    setIsSwiping(false);
  }, [activeTab, swipeOffset, onTabChange, isSwiping]);

  return {
    swipeOffset,
    isSwiping,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
