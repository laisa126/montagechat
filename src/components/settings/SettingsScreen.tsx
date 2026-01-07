import { ChevronLeft, ChevronRight, Search, User, Bell, Lock, Eye, Heart, MessageCircle, Users, Star, Clock, Wifi, HelpCircle, Info, LogOut, Sun, Moon, Shield, Smartphone, Key, Globe, Palette, Volume2, Zap, Database, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminPanel } from './AdminPanel';
import type { Profile } from '@/hooks/useSupabaseAuth';

type SettingsView = 
  | 'main'
  | 'edit-profile'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'account'
  | 'help'
  | 'about'
  | 'theme'
  | 'language'
  | 'data-usage'
  | 'storage'
  | 'blocked'
  | 'close-friends'
  | 'favorites'
  | 'muted'
  | 'activity-status'
  | 'messages'
  | 'story-settings'
  | 'comments'
  | 'likes'
  | 'mentions'
  | 'accessibility'
  | 'sounds'
  | 'admin';

interface SettingsScreenProps {
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  user: {
    displayName: string;
    username: string;
    email: string;
    bio?: string;
  };
  onUpdateUser: (updates: { displayName?: string; username?: string; bio?: string }) => void;
  isAdmin?: boolean;
  onVerifyUser?: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  onSetSimulatedFollowers?: (userId: string, count: number) => Promise<{ error: string | null }>;
  getAllProfiles?: () => Promise<{ data: Profile[] | null; error: string | null }>;
}

interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  hasChevron?: boolean;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

const SettingsItem = ({ icon, label, value, hasChevron = true, onClick, toggle, toggleValue, onToggle, danger }: SettingsItemProps) => (
  <button
    onClick={toggle ? undefined : onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/50 transition-colors",
      danger && "text-destructive"
    )}
  >
    <div className="flex items-center gap-4">
      {icon && <span className="text-foreground">{icon}</span>}
      <span className={cn("text-base", danger && "text-destructive")}>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-muted-foreground text-sm">{value}</span>}
      {toggle ? (
        <Switch checked={toggleValue} onCheckedChange={onToggle} />
      ) : hasChevron ? (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      ) : null}
    </div>
  </button>
);

const SettingsSection = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mb-6">
    {title && <h3 className="px-4 py-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">{title}</h3>}
    <div className="bg-card rounded-xl mx-4 overflow-hidden divide-y divide-border">
      {children}
    </div>
  </div>
);

export const SettingsScreen = ({ onBack, isDark, onToggleTheme, onSignOut, user, onUpdateUser, isAdmin, onVerifyUser, onSetSimulatedFollowers, getAllProfiles }: SettingsScreenProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit profile state
  const [editName, setEditName] = useState(user.displayName);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio || '');
  
  // Settings toggles
  const [activityStatus, setActivityStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [likesNotifications, setLikesNotifications] = useState(true);
  const [commentsNotifications, setCommentsNotifications] = useState(true);
  const [mentionsNotifications, setMentionsNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationsEnabled, setVibrationsEnabled] = useState(true);
  const [saveOriginal, setSaveOriginal] = useState(true);
  const [highQualityUploads, setHighQualityUploads] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleSaveProfile = () => {
    onUpdateUser({
      displayName: editName,
      username: editUsername,
      bio: editBio
    });
    setCurrentView('main');
  };

  const renderHeader = (title: string, showBack: boolean = true) => (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={() => currentView === 'main' ? onBack() : setCurrentView('main')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );

  // Admin Panel Screen
  if (currentView === 'admin' && isAdmin && onVerifyUser && getAllProfiles) {
    return (
      <AdminPanel
        onBack={() => setCurrentView('main')}
        onVerifyUser={onVerifyUser}
        onSetSimulatedFollowers={onSetSimulatedFollowers}
        getAllProfiles={getAllProfiles}
      />
    );
  }

  // Edit Profile Screen
  if (currentView === 'edit-profile') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Edit Profile')}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
                {editName[0]?.toUpperCase() || 'U'}
              </div>
              <button className="text-primary font-semibold">Change Photo</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Username</label>
                <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
                <Input value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Add a bio..." className="rounded-xl" />
              </div>
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full rounded-xl">Save Changes</Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Notifications Screen
  if (currentView === 'notifications') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Notifications')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Push Notifications">
              <SettingsItem icon={<Bell className="w-5 h-5" />} label="Pause All" toggle toggleValue={!notificationsEnabled} onToggle={(v) => setNotificationsEnabled(!v)} hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Interactions">
              <SettingsItem icon={<Heart className="w-5 h-5" />} label="Likes" toggle toggleValue={likesNotifications} onToggle={setLikesNotifications} hasChevron={false} />
              <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Comments" toggle toggleValue={commentsNotifications} onToggle={setCommentsNotifications} hasChevron={false} />
              <SettingsItem icon={<User className="w-5 h-5" />} label="Mentions" toggle toggleValue={mentionsNotifications} onToggle={setMentionsNotifications} hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Messages">
              <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Message Requests" toggle toggleValue={messageNotifications} onToggle={setMessageNotifications} hasChevron={false} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Privacy Screen
  if (currentView === 'privacy') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Privacy')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Account Privacy">
              <SettingsItem icon={<Lock className="w-5 h-5" />} label="Private Account" toggle toggleValue={privateAccount} onToggle={setPrivateAccount} hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Interactions">
              <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Comments" onClick={() => setCurrentView('comments')} />
              <SettingsItem icon={<Heart className="w-5 h-5" />} label="Likes" onClick={() => setCurrentView('likes')} />
              <SettingsItem icon={<User className="w-5 h-5" />} label="Mentions" onClick={() => setCurrentView('mentions')} />
            </SettingsSection>
            <SettingsSection title="Connections">
              <SettingsItem icon={<Users className="w-5 h-5" />} label="Blocked Accounts" onClick={() => setCurrentView('blocked')} />
              <SettingsItem icon={<Star className="w-5 h-5" />} label="Close Friends" onClick={() => setCurrentView('close-friends')} />
              <SettingsItem icon={<Heart className="w-5 h-5" />} label="Favorites" onClick={() => setCurrentView('favorites')} />
              <SettingsItem icon={<Volume2 className="w-5 h-5" />} label="Muted Accounts" onClick={() => setCurrentView('muted')} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Security Screen
  if (currentView === 'security') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Security')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Login Security">
              <SettingsItem icon={<Shield className="w-5 h-5" />} label="Two-Factor Authentication" toggle toggleValue={twoFactorEnabled} onToggle={setTwoFactorEnabled} hasChevron={false} />
              <SettingsItem icon={<Bell className="w-5 h-5" />} label="Login Alerts" toggle toggleValue={loginAlerts} onToggle={setLoginAlerts} hasChevron={false} />
              <SettingsItem icon={<Key className="w-5 h-5" />} label="Change Password" onClick={() => {}} />
            </SettingsSection>
            <SettingsSection title="Devices">
              <SettingsItem icon={<Smartphone className="w-5 h-5" />} label="Active Sessions" value="1 device" onClick={() => {}} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Account Screen
  if (currentView === 'account') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Account')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Account Information">
              <SettingsItem icon={<User className="w-5 h-5" />} label="Personal Information" onClick={() => setCurrentView('edit-profile')} />
              <SettingsItem icon={<Clock className="w-5 h-5" />} label="Account Status" value="Active" hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Data">
              <SettingsItem icon={<Database className="w-5 h-5" />} label="Data Usage" onClick={() => setCurrentView('data-usage')} />
              <SettingsItem icon={<Trash2 className="w-5 h-5" />} label="Storage" onClick={() => setCurrentView('storage')} />
            </SettingsSection>
            <SettingsSection>
              <SettingsItem icon={<Trash2 className="w-5 h-5" />} label="Delete Account" danger onClick={() => {}} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Theme Screen
  if (currentView === 'theme') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Theme')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Appearance">
              <SettingsItem 
                icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} 
                label="Dark Mode" 
                toggle 
                toggleValue={isDark} 
                onToggle={onToggleTheme} 
                hasChevron={false} 
              />
            </SettingsSection>
            <p className="px-4 text-sm text-muted-foreground mt-2">
              Choose your preferred theme. Dark mode is easier on the eyes in low-light conditions.
            </p>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Activity Status Screen
  if (currentView === 'activity-status') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Activity Status')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection>
              <SettingsItem icon={<Eye className="w-5 h-5" />} label="Show Activity Status" toggle toggleValue={activityStatus} onToggle={setActivityStatus} hasChevron={false} />
            </SettingsSection>
            <p className="px-4 text-sm text-muted-foreground">
              When this is on, people you follow and message can see when you were last active.
            </p>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Messages Settings Screen
  if (currentView === 'messages') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Messages')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Message Controls">
              <SettingsItem icon={<Eye className="w-5 h-5" />} label="Read Receipts" toggle toggleValue={readReceipts} onToggle={setReadReceipts} hasChevron={false} />
              <SettingsItem icon={<Clock className="w-5 h-5" />} label="Activity Status" onClick={() => setCurrentView('activity-status')} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Data Usage Screen
  if (currentView === 'data-usage') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Data Usage')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Data Saver">
              <SettingsItem icon={<Wifi className="w-5 h-5" />} label="Use Less Data" toggle toggleValue={dataSaver} onToggle={setDataSaver} hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Media Quality">
              <SettingsItem icon={<Zap className="w-5 h-5" />} label="High Quality Uploads" toggle toggleValue={highQualityUploads} onToggle={setHighQualityUploads} hasChevron={false} />
              <SettingsItem icon={<Database className="w-5 h-5" />} label="Save Original Photos" toggle toggleValue={saveOriginal} onToggle={setSaveOriginal} hasChevron={false} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Storage Screen
  if (currentView === 'storage') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Storage')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Cache">
              <SettingsItem icon={<Trash2 className="w-5 h-5" />} label="Clear Cache" value="0 MB" onClick={() => {}} />
              <SettingsItem icon={<Database className="w-5 h-5" />} label="Clear Search History" onClick={() => {}} />
            </SettingsSection>
            <p className="px-4 text-sm text-muted-foreground mt-2">
              Clearing cache will free up space but may slow down loading temporarily.
            </p>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Sounds Screen
  if (currentView === 'sounds') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Sounds')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection>
              <SettingsItem icon={<Volume2 className="w-5 h-5" />} label="App Sounds" toggle toggleValue={soundsEnabled} onToggle={setSoundsEnabled} hasChevron={false} />
              <SettingsItem icon={<Smartphone className="w-5 h-5" />} label="Vibrations" toggle toggleValue={vibrationsEnabled} onToggle={setVibrationsEnabled} hasChevron={false} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Language Screen
  if (currentView === 'language') {
    const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('app-language') || 'en');
    
    const handleLanguageChange = (lang: string) => {
      setSelectedLang(lang);
      localStorage.setItem('app-language', lang);
      window.location.reload();
    };

    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Language')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection>
              <SettingsItem icon={<Globe className="w-5 h-5" />} label="English" value={selectedLang === 'en' ? '✓' : ''} hasChevron={false} onClick={() => handleLanguageChange('en')} />
              <SettingsItem label="Kiswahili" value={selectedLang === 'sw' ? '✓' : ''} hasChevron={false} onClick={() => handleLanguageChange('sw')} />
              <SettingsItem label="Spanish" hasChevron={false} />
              <SettingsItem label="French" hasChevron={false} />
              <SettingsItem label="German" hasChevron={false} />
              <SettingsItem label="Portuguese" hasChevron={false} />
              <SettingsItem label="Chinese" hasChevron={false} />
              <SettingsItem label="Japanese" hasChevron={false} />
              <SettingsItem label="Korean" hasChevron={false} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Accessibility Screen
  if (currentView === 'accessibility') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Accessibility')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Display">
              <SettingsItem icon={<Eye className="w-5 h-5" />} label="Larger Text" toggle toggleValue={false} onToggle={() => {}} hasChevron={false} />
              <SettingsItem icon={<Palette className="w-5 h-5" />} label="Reduce Motion" toggle toggleValue={false} onToggle={() => {}} hasChevron={false} />
            </SettingsSection>
            <SettingsSection title="Media">
              <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Captions" toggle toggleValue={false} onToggle={() => {}} hasChevron={false} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Help Screen
  if (currentView === 'help') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('Help')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection title="Support">
              <SettingsItem icon={<HelpCircle className="w-5 h-5" />} label="Help Center" onClick={() => {}} />
              <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Report a Problem" onClick={() => {}} />
            </SettingsSection>
            <SettingsSection title="Resources">
              <SettingsItem icon={<Info className="w-5 h-5" />} label="Privacy Policy" onClick={() => {}} />
              <SettingsItem icon={<Info className="w-5 h-5" />} label="Terms of Use" onClick={() => {}} />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // About Screen
  if (currentView === 'about') {
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader('About')}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <SettingsSection>
              <SettingsItem label="Version" value="1.0.0" hasChevron={false} />
              <SettingsItem label="Build" value="2024.1" hasChevron={false} />
            </SettingsSection>
            <div className="px-4 py-8 text-center">
              <p className="text-muted-foreground text-sm">Made with ❤️</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Empty list screens
  if (['blocked', 'close-friends', 'favorites', 'muted', 'comments', 'likes', 'mentions', 'story-settings'].includes(currentView)) {
    const titles: Record<string, string> = {
      'blocked': 'Blocked Accounts',
      'close-friends': 'Close Friends',
      'favorites': 'Favorites',
      'muted': 'Muted Accounts',
      'comments': 'Comments',
      'likes': 'Likes',
      'mentions': 'Mentions',
      'story-settings': 'Story Settings'
    };
    
    return (
      <div className="flex flex-col h-full bg-background">
        {renderHeader(titles[currentView] || 'Settings')}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No items yet</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Settings Screen
  return (
    <div className="flex flex-col h-full bg-background">
      {renderHeader('Settings')}
      
      <ScrollArea className="flex-1">
        <div className="py-4">
          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search settings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-muted border-0"
              />
            </div>
          </div>

          <SettingsSection title="Account">
            <SettingsItem icon={<User className="w-5 h-5" />} label="Edit Profile" onClick={() => setCurrentView('edit-profile')} />
            <SettingsItem icon={<Bell className="w-5 h-5" />} label="Notifications" onClick={() => setCurrentView('notifications')} />
            <SettingsItem icon={<Lock className="w-5 h-5" />} label="Privacy" onClick={() => setCurrentView('privacy')} />
            <SettingsItem icon={<Shield className="w-5 h-5" />} label="Security" onClick={() => setCurrentView('security')} />
            <SettingsItem icon={<User className="w-5 h-5" />} label="Account" onClick={() => setCurrentView('account')} />
          </SettingsSection>

          {isAdmin && (
            <SettingsSection title="Administration">
              <SettingsItem icon={<Shield className="w-5 h-5 text-verified" />} label="Admin Panel" onClick={() => setCurrentView('admin')} />
            </SettingsSection>
          )}

          <SettingsSection title="Preferences">
            <SettingsItem icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} label="Theme" value={isDark ? 'Dark' : 'Light'} onClick={() => setCurrentView('theme')} />
            <SettingsItem icon={<Globe className="w-5 h-5" />} label="Language" value="English" onClick={() => setCurrentView('language')} />
            <SettingsItem icon={<Volume2 className="w-5 h-5" />} label="Sounds" onClick={() => setCurrentView('sounds')} />
            <SettingsItem icon={<Eye className="w-5 h-5" />} label="Accessibility" onClick={() => setCurrentView('accessibility')} />
          </SettingsSection>

          <SettingsSection title="Content">
            <SettingsItem icon={<MessageCircle className="w-5 h-5" />} label="Messages" onClick={() => setCurrentView('messages')} />
            <SettingsItem icon={<Eye className="w-5 h-5" />} label="Activity Status" onClick={() => setCurrentView('activity-status')} />
            <SettingsItem icon={<Wifi className="w-5 h-5" />} label="Data Usage" onClick={() => setCurrentView('data-usage')} />
            <SettingsItem icon={<Database className="w-5 h-5" />} label="Storage" onClick={() => setCurrentView('storage')} />
          </SettingsSection>

          <SettingsSection title="Support">
            <SettingsItem icon={<HelpCircle className="w-5 h-5" />} label="Help" onClick={() => setCurrentView('help')} />
            <SettingsItem icon={<Info className="w-5 h-5" />} label="About" onClick={() => setCurrentView('about')} />
          </SettingsSection>

          <SettingsSection>
            <SettingsItem icon={<LogOut className="w-5 h-5" />} label="Log Out" danger onClick={onSignOut} hasChevron={false} />
          </SettingsSection>
        </div>
      </ScrollArea>
    </div>
  );
};