import { useState } from 'react';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { AccountTab } from '@/components/tabs/AccountTab';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, signUp, updateUser, signOut, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { swipeOffset, isSwiping, swipeHandlers } = useSwipeNavigation(activeTab, setActiveTab);

  if (!isAuthenticated) {
    return <SignUpScreen onSignUp={signUp} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'chat':
        return <ChatTab />;
      case 'reels':
        return <ReelsTab />;
      case 'account':
        return (
          <AccountTab 
            user={user!} 
            onSignOut={signOut} 
            isDark={isDark} 
            onToggleTheme={toggleTheme}
            onUpdateUser={updateUser}
          />
        );
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div 
        className={cn(
          "flex-1 overflow-hidden transition-transform duration-200 ease-out",
          !isSwiping && "transition-transform duration-300"
        )}
        style={{ 
          transform: isSwiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
        }}
        {...swipeHandlers}
      >
        {renderTab()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
