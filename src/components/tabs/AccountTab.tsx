import { Settings, Grid3X3, Bookmark, Heart, LogOut, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/types/user';

type ContentTab = 'posts' | 'saved' | 'liked';

interface AccountTabProps {
  user: User;
  onSignOut: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AccountTab = ({ user, onSignOut, isDark, onToggleTheme }: AccountTabProps) => {
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('posts');

  const stats = [
    { label: 'Posts', value: 0 },
    { label: 'Followers', value: 0 },
    { label: 'Following', value: 0 },
  ];

  const contentTabs: { id: ContentTab; icon: typeof Grid3X3 }[] = [
    { id: 'posts', icon: Grid3X3 },
    { id: 'saved', icon: Bookmark },
    { id: 'liked', icon: Heart },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{user.username}</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="pb-20">
          {/* Profile Info */}
          <div className="px-4 py-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {user.displayName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Stats */}
              <div className="flex-1 flex justify-around pt-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-bold text-lg">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mt-4">
              <h2 className="font-semibold">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user.bio || 'Add a bio to tell people more about yourself'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1 rounded-xl h-9">
                Edit Profile
              </Button>
              <Button variant="secondary" className="flex-1 rounded-xl h-9">
                Share Profile
              </Button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch checked={isDark} onCheckedChange={onToggleTheme} />
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-t border-border">
            <div className="flex">
              {contentTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeContentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveContentTab(tab.id)}
                    className={cn(
                      "flex-1 py-3 flex items-center justify-center transition-colors",
                      isActive
                        ? "border-b-2 border-foreground"
                        : "border-b border-transparent text-muted-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-1">
            {activeContentTab === 'posts' && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                  <Grid3X3 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Share Photos</h3>
                <p className="text-muted-foreground text-sm">
                  When you share photos, they will appear on your profile.
                </p>
              </div>
            )}

            {activeContentTab === 'saved' && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Save</h3>
                <p className="text-muted-foreground text-sm">
                  Save photos and videos that you want to see again.
                </p>
              </div>
            )}

            {activeContentTab === 'liked' && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Liked Posts</h3>
                <p className="text-muted-foreground text-sm">
                  Posts you've liked will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
