import { useState, useEffect } from 'react';
import { ChevronLeft, Search, Shield, CheckCircle, XCircle, Loader2, Users, AlertTriangle, Ban, Clock, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useVerificationRequests, VerificationRequest } from '@/hooks/useVerificationRequests';
import { useReports, Report, UserBan } from '@/hooks/useReports';
import { cn } from '@/lib/utils';
import type { Profile } from '@/hooks/useSupabaseAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface EnhancedAdminPanelProps {
  onBack: () => void;
  onVerifyUser: (userId: string, verified: boolean) => Promise<{ error: string | null }>;
  onSetSimulatedFollowers?: (userId: string, count: number) => Promise<{ error: string | null }>;
  getAllProfiles: () => Promise<{ data: Profile[] | null; error: string | null }>;
  currentUserId: string;
}

export const EnhancedAdminPanel = ({ 
  onBack, 
  onVerifyUser, 
  onSetSimulatedFollowers, 
  getAllProfiles,
  currentUserId
}: EnhancedAdminPanelProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null);
  const [settingFollowers, setSettingFollowers] = useState<string | null>(null);
  const [followerInputs, setFollowerInputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('users');

  // Ban dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('temporary');
  const [banDuration, setBanDuration] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  const { 
    requests: verificationRequests, 
    updateRequestStatus, 
    loading: requestsLoading 
  } = useVerificationRequests(currentUserId, true);
  
  const { 
    reports, 
    bans, 
    updateReportStatus, 
    banUser, 
    unbanUser, 
    isUserBanned,
    loading: reportsLoading 
  } = useReports(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await getAllProfiles();
    if (!error && data) {
      setProfiles(data);
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

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;
    
    setBanning(true);
    await banUser(
      selectedUser.user_id,
      currentUserId,
      banReason,
      banType,
      banType === 'temporary' ? parseInt(banDuration) : undefined
    );
    setBanning(false);
    setBanDialogOpen(false);
    setSelectedUser(null);
    setBanReason('');
  };

  const handleVerificationAction = async (request: VerificationRequest, action: 'approved' | 'rejected') => {
    await updateRequestStatus(request.id, action, currentUserId);
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

  const pendingRequests = verificationRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

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

      {/* Stats Bar */}
      <div className="px-4 py-3 border-b border-border/50 flex gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 min-w-fit">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{profiles.length} Users</span>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 min-w-fit">
          <CheckCircle className="w-4 h-4 text-verified" />
          <span className="text-sm font-medium">{pendingRequests.length} Pending Verifications</span>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 min-w-fit">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{pendingReports.length} Reports</span>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 min-w-fit">
          <Ban className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium">{bans.length} Bans</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          <TabsTrigger value="verifications" className="flex-1 relative">
            Verifications
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 relative">
            Reports
            {pendingReports.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {pendingReports.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="flex-1 flex flex-col mt-0">
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
                    className={cn(
                      "p-4 bg-card rounded-xl space-y-3",
                      isUserBanned(profile.user_id) && "border border-destructive/50"
                    )}
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
                            {isUserBanned(profile.user_id) && (
                              <Ban className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">@{profile.username}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
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
                            'Unverify'
                          ) : (
                            'Verify'
                          )}
                        </Button>

                        {!isUserBanned(profile.user_id) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(profile);
                              setBanDialogOpen(true);
                            }}
                            disabled={profile.username.toLowerCase() === 'montage'}
                            className="rounded-lg text-xs"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const ban = bans.find(b => b.user_id === profile.user_id);
                              if (ban) await unbanUser(ban.id);
                            }}
                            className="rounded-lg text-xs text-destructive"
                          >
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>

                    {onSetSimulatedFollowers && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Followers:</span>
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
        </TabsContent>

        <TabsContent value="verifications" className="flex-1">
          <ScrollArea className="h-full">
            <div className="px-4 py-3 space-y-4">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending verification requests
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="p-4 bg-card rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{request.full_name}</div>
                        <div className="text-sm text-muted-foreground">@{request.username}</div>
                        <div className="text-xs text-muted-foreground capitalize mt-1">
                          {request.category.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleVerificationAction(request, 'approved')}
                          className="rounded-lg bg-verified hover:bg-verified/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerificationAction(request, 'rejected')}
                          className="rounded-lg"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    {request.additional_info && (
                      <p className="text-sm text-muted-foreground border-t border-border/50 pt-2">
                        {request.additional_info}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reports" className="flex-1">
          <ScrollArea className="h-full">
            <div className="px-4 py-3 space-y-4">
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending reports
                </div>
              ) : (
                pendingReports.map(report => (
                  <div key={report.id} className="p-4 bg-card rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{report.reported_display_name}</div>
                        <div className="text-sm text-muted-foreground">@{report.reported_username}</div>
                        <div className="text-xs text-destructive capitalize mt-1">
                          {report.reason}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'reviewed', currentUserId)}
                          className="rounded-lg"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateReportStatus(report.id, 'dismissed', currentUserId)}
                          className="rounded-lg"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground border-t border-border/50 pt-2">
                        {report.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Reported by @{report.reporter_username}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban @{selectedUser?.username} from the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ban Type</label>
              <Select value={banType} onValueChange={(v: 'permanent' | 'temporary') => setBanType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banType === 'temporary' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (days)</label>
                <Select value={banDuration} onValueChange={setBanDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for ban..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBanUser}
              disabled={banning || !banReason}
            >
              {banning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
