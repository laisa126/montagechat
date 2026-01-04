import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/lib/utils';
import type { Profile } from '@/hooks/useSupabaseAuth';

interface AdminPanelProps {
  onBack: () => void;
  onVerifyUser: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  getAllProfiles: () => Promise<{ data: Profile[] | null; error: string | null }>;
}

export const AdminPanel = ({ onBack, onVerifyUser, getAllProfiles }: AdminPanelProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await getAllProfiles();
    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const handleVerify = async (userId: string, currentlyVerified: boolean) => {
    setVerifyingUser(userId);
    const { error } = await onVerifyUser(userId, !currentlyVerified);
    if (!error) {
      // Update local state
      setProfiles(prev => 
        prev.map(p => 
          p.user_id === userId ? { ...p, is_verified: !currentlyVerified } : p
        )
      );
    }
    setVerifyingUser(null);
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
          <div className="px-4 space-y-2 pb-4">
            <h3 className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-3">
              User Verification Management
            </h3>
            
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl"
              >
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