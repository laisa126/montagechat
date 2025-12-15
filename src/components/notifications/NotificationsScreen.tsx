import { ChevronLeft, Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface NotificationsScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  username: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

export const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const { trigger } = useHaptic();
  const { t } = useLanguage();
  
  // Empty state - no demo data
  const notifications: Notification[] = [];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-primary" />;
    }
  };

  const handleBack = () => {
    trigger('light');
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{t('notifications')}</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('noNotifications')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('notificationsDesc')}
            </p>
          </div>
        ) : (
          <div className="py-2">
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{t('today')}</h3>
            </div>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => trigger('light')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors",
                  !notification.isRead && "bg-muted/30"
                )}
              >
                <div className="relative">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-muted text-sm">
                      {notification.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.username}</span>{' '}
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{notification.timeAgo}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
