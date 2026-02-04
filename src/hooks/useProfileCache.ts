import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CachedProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
  simulated_followers: number;
  bio?: string;
  fetchedAt: number;
}

// Global cache for profiles - persists across component mounts
const profileCache = new Map<string, CachedProfile>();
const usernameToUserIdMap = new Map<string, string>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pre-populate cache from any existing profiles
export const warmupProfileCache = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, avatar_url, is_verified, simulated_followers, bio')
    .limit(100);

  if (data) {
    const now = Date.now();
    data.forEach(profile => {
      const cached: CachedProfile = {
        ...profile,
        is_verified: profile.is_verified || false,
        simulated_followers: profile.simulated_followers || 0,
        fetchedAt: now
      };
      profileCache.set(profile.user_id, cached);
      usernameToUserIdMap.set(profile.username.toLowerCase(), profile.user_id);
    });
  }
};

export const useProfileCache = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pendingRequests = useRef<Map<string, Promise<CachedProfile | null>>>(new Map());

  const getProfile = useCallback(async (userId: string): Promise<CachedProfile | null> => {
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      return cached;
    }

    // Check if there's already a pending request for this user
    const pending = pendingRequests.current.get(userId);
    if (pending) {
      return pending;
    }

    // Create new request
    const request = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, is_verified, simulated_followers, bio')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        const profile: CachedProfile = {
          ...data,
          is_verified: data.is_verified || false,
          simulated_followers: data.simulated_followers || 0,
          fetchedAt: Date.now()
        };

        profileCache.set(userId, profile);
        usernameToUserIdMap.set(data.username.toLowerCase(), userId);
        return profile;
      } catch (err) {
        console.error('Error fetching profile:', err);
        return null;
      } finally {
        pendingRequests.current.delete(userId);
      }
    })();

    pendingRequests.current.set(userId, request);
    return request;
  }, []);

  const getProfileByUsername = useCallback(async (username: string): Promise<CachedProfile | null> => {
    const lowerUsername = username.toLowerCase();
    const userId = usernameToUserIdMap.get(lowerUsername);
    
    if (userId) {
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified, simulated_followers, bio')
        .ilike('username', username)
        .single();

      if (error) throw error;

      const profile: CachedProfile = {
        ...data,
        is_verified: data.is_verified || false,
        simulated_followers: data.simulated_followers || 0,
        fetchedAt: Date.now()
      };

      profileCache.set(data.user_id, profile);
      usernameToUserIdMap.set(data.username.toLowerCase(), data.user_id);
      return profile;
    } catch (err) {
      console.error('Error fetching profile by username:', err);
      return null;
    }
  }, []);

  const getProfiles = useCallback(async (userIds: string[]): Promise<Map<string, CachedProfile>> => {
    const result = new Map<string, CachedProfile>();
    const toFetch: string[] = [];

    // Check cache first
    for (const userId of userIds) {
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
        result.set(userId, cached);
      } else {
        toFetch.push(userId);
      }
    }

    if (toFetch.length === 0) {
      return result;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, is_verified, simulated_followers, bio')
        .in('user_id', toFetch);

      if (error) throw error;

      const now = Date.now();
      for (const profile of data || []) {
        const cached: CachedProfile = {
          ...profile,
          is_verified: profile.is_verified || false,
          simulated_followers: profile.simulated_followers || 0,
          fetchedAt: now
        };
        profileCache.set(profile.user_id, cached);
        result.set(profile.user_id, cached);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setIsLoading(false);
    }

    return result;
  }, []);

  const invalidateProfile = useCallback((userId: string) => {
    profileCache.delete(userId);
  }, []);

  const prefetchProfiles = useCallback(async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)].filter(id => !profileCache.has(id));
    if (uniqueIds.length > 0) {
      await getProfiles(uniqueIds);
    }
  }, [getProfiles]);

  return { 
    getProfile, 
    getProfileByUsername,
    getProfiles, 
    invalidateProfile, 
    prefetchProfiles,
    getCachedProfile: (userId: string) => profileCache.get(userId),
    isLoading 
  };
};

// Hook to get a single profile with caching
export const useCachedProfile = (userId?: string) => {
  const [profile, setProfile] = useState<CachedProfile | null>(() => {
    // Initialize from cache immediately for instant display
    if (userId) {
      return profileCache.get(userId) || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!profileCache.has(userId || ''));
  const { getProfile } = useProfileCache();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    getProfile(userId).then(p => {
      if (mounted) {
        setProfile(p);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [userId, getProfile]);

  return { profile, isLoading };
};
