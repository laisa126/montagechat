import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Shield, CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/lib/utils';
import type { Profile } from '@/hooks/useSupabaseAuth';

interface AdminPanelProps {
  onBack: () => void;
  onVerifyUser: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  onSetSimulatedFollowers?: (userId: string, count: number) => Promise<{ error: string | null }>;
  getAllProfiles: () => Promise<{ data: Profile[] | null; error: string | null }>;
}

export const AdminPanel = ({ onBack, onVerifyUser, onSetSimulatedFollowers, getAllProfiles }: AdminPanelProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null);
  const [settingFollowers, setSettingFollowers] = useState<string | null>(null);
  const [followerInputs, setFollowerInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await getAllProfiles();
    if (!error && data) {
      setProfiles(data);
      // Initialize follower inputs
      const inputs: Record<string, string> = {};
      data.forEach(p => {
        inputs[p.user_id] = (p.simulated_followers || 0).toString();
      });
      setFollowerInputs(inputs);
    }
    setLoading(false);
  };

  const handleVerify = async (userId: string, currentlyVerified: boolean) => {
    setVerifyingUser(userId);
    const { error } = await onVerifyUser(userId, !currentlyVerified);
    if (!error) {
      setProfiles(prev => 
        prev.map(p => 
          p.user_id === userId ? { ...p, is_verified: !currentlyVerified } : p
        )
      );
    }
    setVerifyingUser(null);
  };

  const handleSetFollowers = async (userId: string) => {
    if (!onSetSimulatedFollowers) return;
    
    const count = parseInt(followerInputs[userId] || '0', 10);
    if (isNaN(count) || count < 0) return;
    
    setSettingFollowers(userId);
    const { error } = await onSetSimulatedFollowers(userId, count);
    if (!error) {
      setProfiles(prev => 
        prev.map(p => 
          p.user_id === userId ? { ...p, simulated_followers: count } : p
        )
      );
    }
    setSettingFollowers(null);
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const filteredProfiles = profiles.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-verified" />
            <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-muted border-0"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="px-4 space-y-4 pb-4">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 bg-card rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                      {profile.display_name[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{profile.display_name}</span>
                        {profile.is_verified && <VerifiedBadge size="sm" />}
                      </div>
                      <span className="text-sm text-muted-foreground">@{profile.username}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={profile.is_verified ? "destructive" : "default"}
                    onClick={() => handleVerify(profile.user_id, profile.is_verified)}
                    disabled={verifyingUser === profile.user_id || profile.username.toLowerCase() === 'montage'}
                    className={cn(
                      "rounded-lg text-xs",
                      !profile.is_verified && "bg-verified hover:bg-verified/90"
                    )}
                  >
                    {verifyingUser === profile.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profile.is_verified ? (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Unverify
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                {/* Simulated Followers Section */}
                {onSetSimulatedFollowers && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Simulated Followers:</span>
                    <Input
                      type="number"
                      min="0"
                      value={followerInputs[profile.user_id] || '0'}
                      onChange={(e) => setFollowerInputs(prev => ({
                        ...prev,
                        [profile.user_id]: e.target.value
                      }))}
                      className="w-24 h-8 text-sm"
                      placeholder="0"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetFollowers(profile.user_id)}
                      disabled={settingFollowers === profile.user_id}
                      className="h-8 text-xs"
                    >
                      {settingFollowers === profile.user_id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Set'
                      )}
                    </Button>
                    {(profile.simulated_followers || 0) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({formatFollowerCount(profile.simulated_followers || 0)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};