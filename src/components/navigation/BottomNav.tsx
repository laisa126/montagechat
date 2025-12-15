import { Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'home' | 'chat' | 'reels' | 'account';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

// Smooth rounded play button icon for Reels
const ReelsIcon = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      "w-7 h-7 rounded-[10px] flex items-center justify-center transition-all duration-200",
      isActive 
        ? "bg-foreground" 
        : "border-2 border-muted-foreground"
    )}
  >
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "w-3.5 h-3.5 ml-0.5",
        isActive ? "fill-background" : "fill-muted-foreground"
      )}
    >
      <path d="M8 5.14v14l11-7-11-7z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </div>
);

// Smooth paper plane icon like Instagram DMs
const MessagesIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn(
      "w-6 h-6 transition-all duration-200",
      isActive ? "stroke-foreground" : "stroke-muted-foreground"
    )}
    fill={isActive ? "currentColor" : "none"}
    strokeWidth={isActive ? 0 : 1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const navItems: { id: TabType; icon: typeof Home | null }[] = [
  { id: 'home', icon: Home },
  { id: 'chat', icon: null },
  { id: 'reels', icon: null },
  { id: 'account', icon: User },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center justify-center w-14 h-full transition-all duration-200",
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
