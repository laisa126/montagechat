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

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, signUp, signOut, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (!isAuthenticated) {
    return <SignUpScreen onSignUp={signUp} />;
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'reels' && <ReelsTab />}
        {activeTab === 'account' && (
          <AccountTab 
            user={user!} 
            onSignOut={signOut} 
            isDark={isDark} 
            onToggleTheme={toggleTheme} 
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
