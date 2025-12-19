import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigation } from '../NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useFollows } from '@/hooks/useFollows';
import { cn } from '@/lib/utils';

interface FollowRequestsScreenProps {
  currentUserId?: string;
}

export const FollowRequestsScreen: React.FC<FollowRequestsScreenProps> = ({
  currentUserId
}) => {
  const { goBack, navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { 
    getFollowRequests, 
    approveFollowRequest, 
    denyFollowRequest 
  } = useFollows(currentUserId);

  const requests = getFollowRequests();

  const handleBack = () => {
    trigger('light');
    goBack();
  };

  const handleProfileTap = (user: { id: string; username: string; displayName: string; avatarUrl?: string }) => {
    trigger('light');
    navigate('profile', {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  };

  const handleApprove = (userId: string) => {
    trigger('medium');
    approveFollowRequest(userId);
  };

  const handleDeny = (userId: string) => {
    trigger('light');
    denyFollowRequest(userId);
  };

  return (
    <div className="flex flex-col h-full bg-background animate-slide-in-right">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Follow Requests</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No Follow Requests</h3>
              <p className="text-muted-foreground text-sm">
                When someone requests to follow you, you'll see it here.
              </p>
            </div>
          ) : (
            requests.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <button
                  onClick={() => handleProfileTap(user)}
                  className="active:opacity-70 transition-opacity"
                >
                  <Avatar className="w-12 h-12">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    ) : null}
                    <AvatarFallback className="bg-muted">
                      {user.displayName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                <button
                  onClick={() => handleProfileTap(user)}
                  className="flex-1 text-left active:opacity-70 transition-opacity"
                >
                  <p className="font-semibold text-sm">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.displayName}</p>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl h-8 px-4"
                    onClick={() => handleApprove(user.id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-8 w-8"
                    onClick={() => handleDeny(user.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};