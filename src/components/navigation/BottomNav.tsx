import { Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'home' | 'search' | 'reels' | 'chat' | 'account';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

// Reels icon - rounded square with play button
const ReelsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6"
    fill="none"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      className={cn(
        isActive ? "stroke-foreground fill-foreground" : "stroke-muted-foreground"
      )}
      strokeWidth={isActive ? 0 : 1.5}
    />
    <path
      d="M10 8.5L16 12L10 15.5V8.5Z"
      className={cn(
        isActive ? "fill-background" : "fill-muted-foreground"
      )}
    />
  </svg>
);

// Messages icon - envelope style
const MessagesIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6"
    fill="none"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="3"
      className={cn(
        isActive ? "stroke-foreground fill-foreground" : "stroke-muted-foreground"
      )}
      strokeWidth={isActive ? 0 : 1.5}
    />
    <path
      d="M2 7L12 13L22 7"
      className={cn(
        isActive ? "stroke-background" : "stroke-muted-foreground"
      )}
      strokeWidth={isActive ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const navItems: { id: TabType; icon: typeof Home | null; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'reels', icon: null, label: 'Reels' },
  { id: 'chat', icon: null, label: 'Chat' },
  { id: 'account', icon: User, label: 'Account' },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center justify-center w-12 h-full transition-all duration-200",
                "active:scale-90"
              )}
            >
              {item.id === 'reels' ? (
                <ReelsIcon isActive={isActive} />
              ) : item.id === 'chat' ? (
                <MessagesIcon isActive={isActive} />
              ) : Icon ? (
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? "text-foreground stroke-[2.5px]" 
                      : "text-muted-foreground stroke-[1.5px]"
                  )}
                  fill={isActive ? "currentColor" : "none"}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
