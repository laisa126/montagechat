import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Copy, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onShareToDM?: (userId: string, postId: string) => void;
  users?: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  }>;
}

export const ShareSheet = ({ 
  open, 
  onOpenChange, 
  postId, 
  onShareToDM,
  users = []
}: ShareSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success('Link copied to clipboard');
    onOpenChange(false);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = () => {
    selectedUsers.forEach(userId => {
      onShareToDM?.(userId, postId);
    });
    toast.success(`Shared with ${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'}`);
    setSelectedUsers([]);
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Share</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl bg-muted border-0 pl-4"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-4 pb-4 border-b border-border">
          <button 
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 min-w-[64px]"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Link className="w-6 h-6" />
            </div>
            <span className="text-xs text-muted-foreground">Copy link</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 min-w-[64px]">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs text-muted-foreground">Add to story</span>
          </button>
        </div>

        {/* Users List */}
        <ScrollArea className="h-[calc(100%-220px)]">
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                    selectedUsers.includes(user.id) 
                      ? "bg-primary/10" 
                      : "hover:bg-muted"
                  )}
                >
                  <Avatar className="w-12 h-12">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                    <AvatarFallback className="bg-muted">
                      {user.displayName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.displayName}</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedUsers.includes(user.id)
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedUsers.includes(user.id) && (
                      <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Send Button */}
        {selectedUsers.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-xl"
              />
              <Button 
                onClick={handleSend}
                className="rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};