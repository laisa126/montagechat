import { Settings, Grid3X3, Bookmark, Heart, Plus, Camera, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/types/user';
import { useNavigation } from '@/navigation/NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useFollows } from '@/hooks/useFollows';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { AccountSwitcherDialog } from '@/components/settings/AccountSwitcherDialog';
import type { Profile } from '@/hooks/useSupabaseAuth';

// Instagram default avatar
const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png';

type ContentTab = 'posts' | 'saved' | 'liked';

interface Post {
  id: string;
  imageUrl: string;
  createdAt: Date;
}

interface AccountTabProps {
  user: User & { email?: string };
  onSignOut: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onUpdateUser: (updates: { displayName?: string; username?: string; bio?: string; avatarUrl?: string }) => Promise<{ error: string | null }>;
  isAdmin?: boolean;
  onVerifyUser?: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  getAllProfiles?: () => Promise<{ data: Profile[] | null; error: string | null }>;
}

export const AccountTab = ({ user, onSignOut, isDark, onToggleTheme, onUpdateUser, isAdmin, onVerifyUser, getAllProfiles }: AccountTabProps) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const { getFollowerCount, getFollowingCount, registerUser } = useFollows(user.id);
  
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('posts');
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('user_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedPosts] = useState<Post[]>([]);
  const [likedPosts] = useState<Post[]>([]);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const realFollowerCount = getFollowerCount(user.id);
  const followerCount = realFollowerCount + (user.simulatedFollowers || 0);
  const followingCount = getFollowingCount(user.id);

  // Register current user for follow system
  useEffect(() => {
    registerUser({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  }, [user, registerUser]);

  const handleFollowersTap = () => {
    trigger('light');
    navigate('follow-list', { 
      userId: user.id, 
      username: user.username, 
      initialTab: 'followers',
      currentUserId: user.id
    });
  };

  const handleFollowingTap = () => {
    trigger('light');
    navigate('follow-list', { 
      userId: user.id, 
      username: user.username, 
      initialTab: 'following',
      currentUserId: user.id
    });
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  };

  const stats = [
    { label: 'Posts', value: posts.length, displayValue: posts.length.toString(), onTap: undefined },
    { label: 'Followers', value: followerCount, displayValue: formatCount(followerCount), onTap: handleFollowersTap },
    { label: 'Following', value: followingCount, displayValue: formatCount(followingCount), onTap: handleFollowingTap },
  ];

  const contentTabs: { id: ContentTab; icon: typeof Grid3X3 }[] = [
    { id: 'posts', icon: Grid3X3 },
    { id: 'saved', icon: Bookmark },
    { id: 'liked', icon: Heart },
  ];

  const handleUploadPost = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPost: Post = {
          id: Date.now().toString(),
          imageUrl: reader.result as string,
          createdAt: new Date()
        };
        const updatedPosts = [newPost, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem('user_posts', JSON.stringify(updatedPosts));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenSettings = () => {
    trigger('light');
    navigate('settings');
  };

  const handleOpenEditProfile = () => {
    trigger('light');
    navigate('edit-profile');
  };

  const getCurrentPosts = () => {
    switch (activeContentTab) {
      case 'posts': return posts;
      case 'saved': return savedPosts;
      case 'liked': return likedPosts;
      default: return [];
    }
  };

  const handlePostTap = (index: number) => {
    trigger('light');
    const currentPosts = getCurrentPosts();
    navigate('post-feed-viewer', { 
      posts: currentPosts, 
      initialIndex: index,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadPost}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleUploadAvatar}
        accept="image/*"
        className="hidden"
      />

      {/* Account Switcher Dialog */}
      <AccountSwitcherDialog
        open={showAccountSwitcher}
        onOpenChange={setShowAccountSwitcher}
        currentUserId={user.id}
        currentUsername={user.username}
        currentDisplayName={user.displayName}
        currentAvatarUrl={user.avatarUrl}
        currentEmail={user.email || ''}
        onSwitchSuccess={() => window.location.reload()}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              trigger('light');
              setShowAccountSwitcher(true);
            }}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <h1 className="text-xl font-bold tracking-tight">{user.username}</h1>
            {user.isVerified && <VerifiedBadge size="md" />}
            <ChevronDown className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-6 h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={handleOpenSettings}
            >
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
              {/* Avatar with upload */}
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="relative group"
              >
                <Avatar className="w-20 h-20 border-2 border-border">
                  <AvatarImage src={user.avatarUrl || DEFAULT_AVATAR} alt={user.displayName} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {user.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>

              {/* Stats */}
              <div className="flex-1 flex justify-around pt-2">
                {stats.map((stat) => (
                  <button 
                    key={stat.label} 
                    onClick={stat.onTap}
                    disabled={!stat.onTap}
                    className={cn(
                      "text-center transition-transform",
                      stat.onTap && "active:scale-95"
                    )}
                  >
                    <p className="font-bold text-lg">{stat.displayValue}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold">{user.displayName}</h2>
                {user.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.bio || 'Add a bio to tell people more about yourself'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-xl h-9"
                onClick={handleOpenEditProfile}
              >
                Edit Profile
              </Button>
              <Button variant="secondary" className="flex-1 rounded-xl h-9">
                Share Profile
              </Button>
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
          <div className="p-0.5">
            {getCurrentPosts().length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {getCurrentPosts().map((post, index) => (
                  <button 
                    key={post.id} 
                    onClick={() => handlePostTap(index)}
                    className="aspect-square bg-muted overflow-hidden active:opacity-80 transition-opacity"
                  >
                    <img 
                      src={post.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <>
                {activeContentTab === 'posts' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4 active:scale-95 transition-transform"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                    <h3 className="text-2xl font-bold mb-2">Share Photos</h3>
                    <p className="text-muted-foreground text-sm">
                      When you share photos, they will appear on your profile.
                    </p>
                    <Button 
                      variant="link" 
                      className="mt-4 text-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload your first photo
                    </Button>
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
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
