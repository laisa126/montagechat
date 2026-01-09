import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined data
  reporter_username?: string;
  reported_username?: string;
  reported_display_name?: string;
  reported_avatar_url?: string | null;
}

export interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  ban_type: 'permanent' | 'temporary';
  expires_at: string | null;
  created_at: string;
  // Joined data
  username?: string;
  display_name?: string;
}

export const useReports = (isAdmin?: boolean) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
      fetchBans();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reported_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch usernames for reports
      const reporterIds = [...new Set(data.map(r => r.reporter_id))];
      const reportedIds = [...new Set(data.map(r => r.reported_user_id))];
      const allIds = [...new Set([...reporterIds, ...reportedIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', allIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const mappedReports = data.map(report => ({
        ...report,
        reporter_username: profileMap.get(report.reporter_id)?.username,
        reported_username: profileMap.get(report.reported_user_id)?.username,
        reported_display_name: profileMap.get(report.reported_user_id)?.display_name,
        reported_avatar_url: profileMap.get(report.reported_user_id)?.avatar_url
      }));

      setReports(mappedReports as Report[]);
    }
    setLoading(false);
  };

  const fetchBans = async () => {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const userIds = [...new Set(data.map(b => b.user_id))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const mappedBans = data.map(ban => ({
        ...ban,
        username: profileMap.get(ban.user_id)?.username,
        display_name: profileMap.get(ban.user_id)?.display_name
      }));

      setBans(mappedBans as UserBan[]);
    }
  };

  const reportUser = async (
    reporterId: string,
    reportedUserId: string,
    reason: string,
    description?: string
  ) => {
    const { error } = await supabase.from('reported_users').insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      description: description || null
    });

    return { error: error?.message || null };
  };

  const updateReportStatus = async (
    reportId: string,
    status: 'reviewed' | 'dismissed',
    reviewerId: string
  ) => {
    const { error } = await supabase
      .from('reported_users')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (!error) {
      await fetchReports();
    }

    return { error: error?.message || null };
  };

  const banUser = async (
    userId: string,
    bannedBy: string,
    reason: string,
    banType: 'permanent' | 'temporary' = 'permanent',
    durationDays?: number
  ) => {
    const expiresAt = banType === 'temporary' && durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase.from('user_bans').insert({
      user_id: userId,
      banned_by: bannedBy,
      reason,
      ban_type: banType,
      expires_at: expiresAt
    });

    if (!error) {
      await fetchBans();
    }

    return { error: error?.message || null };
  };

  const unbanUser = async (banId: string) => {
    const { error } = await supabase
      .from('user_bans')
      .delete()
      .eq('id', banId);

    if (!error) {
      await fetchBans();
    }

    return { error: error?.message || null };
  };

  const isUserBanned = (userId: string): boolean => {
    const ban = bans.find(b => b.user_id === userId);
    if (!ban) return false;
    
    if (ban.ban_type === 'permanent') return true;
    if (ban.expires_at && new Date(ban.expires_at) > new Date()) return true;
    
    return false;
  };

  const getUserBan = (userId: string): UserBan | null => {
    return bans.find(b => b.user_id === userId) || null;
  };

  return {
    reports,
    bans,
    loading,
    reportUser,
    updateReportStatus,
    banUser,
    unbanUser,
    isUserBanned,
    getUserBan,
    refetch: () => {
      fetchReports();
      fetchBans();
    }
  };
};
