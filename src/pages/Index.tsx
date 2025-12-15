import { useState } from 'react';
import { BottomNav, TabType } from '@/components/navigation/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { ReelsTab } from '@/components/tabs/ReelsTab';
import { AccountTab } from '@/components/tabs/AccountTab';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'chat':
        return <ChatTab />;
      case 'reels':
        return <ReelsTab />;
      case 'account':
        return <AccountTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        {renderTab()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
