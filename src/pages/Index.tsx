import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Chat, Message } from '@/types/chat';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const [chats, setChats] = useLocalStorage<Chat[]>('telegram-chats', []);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

  const handleNewChat = (name: string) => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      name,
      messages: [],
      isOnline: Math.random() > 0.5,
    };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    toast.success(`Chat with ${name} created`);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      isOutgoing: true,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: content,
            lastMessageTime: new Date(),
          };
        }
        return chat;
      })
    );
  };

  return (
    <>
      <div className="h-screen w-full flex overflow-hidden">
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          onNewChat={() => setIsNewChatOpen(true)}
        />
        <ChatArea chat={selectedChat} onSendMessage={handleSendMessage} />
      </div>

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onCreateChat={handleNewChat}
      />

      <Toaster position="top-center" />
    </>
  );
};

export default Index;
