import { ChevronLeft, Heart, MessageCircle, UserPlus, AtSign, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigation } from '@/navigation/NavigationContext';
import { useFollows } from '@/hooks/useFollows';
import { cn } from '@/lib/utils';

interface NotificationsScreenProps {
  onBack: () => void;
  currentUserId?: string;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'follow_request';
  userId: string;
  username: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

export const NotificationsScreen = ({ onBack, currentUserId }: NotificationsScreenProps) => {
  const { trigger } = useHaptic();
  const { t } = useLanguage();
  const { navigate } = useNavigation();
  const { getFollowRequestCount } = useFollows(currentUserId);
  
  const followRequestCount = getFollowRequestCount();
  
  // Empty state - no demo data
  const notifications: Notification[] = [];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-primary" />;
    }
  };

  const handleBack = () => {
    trigger('light');
    onBack();
  };

  const handleNotificationTap = (notification: Notification) => {
    trigger('light');
    
    if (notification.type === 'follow' || notification.type === 'follow_request') {
      navigate('profile', {
        userId: notification.userId,
        username: notification.username,
        displayName: notification.username
      });
    }
  };

  const handleFollowRequestsTap = () => {
    trigger('light');
    navigate('follow-list', {
      userId: currentUserId,
      username: 'me',
      initialTab: 'followers'
    });
  };

  const handleMessageTap = (userId: string, username: string) => {
    trigger('light');
    navigate('dm-thread', {
      userId,
      username,
      displayName: username
    });
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
        {/* Follow Requests Section */}
        {followRequestCount > 0 && (
          <button
            onClick={handleFollowRequestsTap}
            className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/50 active:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Follow Requests</p>
              <p className="text-xs text-muted-foreground">{followRequestCount} pending</p>
            </div>
          </button>
        )}

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
                onClick={() => handleNotificationTap(notification)}
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
                {notification.type === 'follow' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessageTap(notification.userId, notification.username);
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
