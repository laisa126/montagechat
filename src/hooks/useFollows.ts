import { useState, useCallback, useEffect } from 'react';

interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  timestamp: number;
}

interface FollowRequest {
  id: string;
  requesterId: string;
  targetId: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'denied';
}

interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface SuggestedUser extends FollowUser {
  mutualCount?: number;
  mutualNames?: string[];
  reason?: string;
}

interface PrivacySettings {
  [userId: string]: {
    isPrivate: boolean;
  };
}

const FOLLOWS_KEY = 'app-follows';
const USERS_KEY = 'app-known-users';
const REQUESTS_KEY = 'app-follow-requests';
const PRIVACY_KEY = 'app-privacy-settings';
const DISMISSED_SUGGESTIONS_KEY = 'app-dismissed-suggestions';

// No mock data - use real profiles from database

export const useFollows = (currentUserId?: string) => {
  const [follows, setFollows] = useState<Follow[]>(() => {
    const saved = localStorage.getItem(FOLLOWS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [knownUsers, setKnownUsers] = useState<FollowUser[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [followRequests, setFollowRequests] = useState<FollowRequest[]>(() => {
    const saved = localStorage.getItem(REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem(PRIVACY_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>(() => {
    const saved = localStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
  }, [follows]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(knownUsers));
  }, [knownUsers]);

  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(followRequests));
  }, [followRequests]);

  useEffect(() => {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem(DISMISSED_SUGGESTIONS_KEY, JSON.stringify(dismissedSuggestions));
  }, [dismissedSuggestions]);

  // Register a user (for tracking display info)
  const registerUser = useCallback((user: FollowUser) => {
    setKnownUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.map(u => u.id === user.id ? { ...u, ...user } : u);
      }
      return [...prev, user];
    });
  }, []);

  // Check if current user is following someone
  const isFollowing = useCallback((targetUserId: string): boolean => {
    if (!currentUserId) return false;
    return follows.some(f => f.followerId === currentUserId && f.followingId === targetUserId);
  }, [currentUserId, follows]);

  // Follow a user
  const followUser = useCallback((targetUserId: string, targetUser?: FollowUser) => {
    if (!currentUserId || isFollowing(targetUserId)) return;
    
    const newFollow: Follow = {
      id: `${currentUserId}-${targetUserId}`,
      followerId: currentUserId,
      followingId: targetUserId,
      timestamp: Date.now()
    };
    
    setFollows(prev => [...prev, newFollow]);
    
    // Register the target user if provided
    if (targetUser) {
      registerUser(targetUser);
    }
  }, [currentUserId, isFollowing, registerUser]);

  // Unfollow a user
  const unfollowUser = useCallback((targetUserId: string) => {
    if (!currentUserId) return;
    setFollows(prev => prev.filter(
      f => !(f.followerId === currentUserId && f.followingId === targetUserId)
    ));
  }, [currentUserId]);

  // Toggle follow status
  const toggleFollow = useCallback((targetUserId: string, targetUser?: FollowUser) => {
    if (isFollowing(targetUserId)) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId, targetUser);
    }
  }, [isFollowing, followUser, unfollowUser]);

  // Get followers of a user
  const getFollowers = useCallback((userId: string): FollowUser[] => {
    const followerIds = follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    
    return knownUsers.filter(u => followerIds.includes(u.id));
  }, [follows, knownUsers]);

  // Get users that a user is following
  const getFollowing = useCallback((userId: string): FollowUser[] => {
    const followingIds = follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    
    return knownUsers.filter(u => followingIds.includes(u.id));
  }, [follows, knownUsers]);

  // Get follower count
  const getFollowerCount = useCallback((userId: string): number => {
    return follows.filter(f => f.followingId === userId).length;
  }, [follows]);

  // Get following count
  const getFollowingCount = useCallback((userId: string): number => {
    return follows.filter(f => f.followerId === userId).length;
  }, [follows]);

  // Get IDs of users that a user is following
  const getFollowingUserIds = useCallback((userId: string): string[] => {
    return follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
  }, [follows]);

  // Privacy settings
  const isPrivateAccount = useCallback((userId: string): boolean => {
    return privacySettings[userId]?.isPrivate || false;
  }, [privacySettings]);

  const setPrivateAccount = useCallback((userId: string, isPrivate: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [userId]: { isPrivate }
    }));
  }, []);

  // Follow requests for private accounts
  const sendFollowRequest = useCallback((targetUserId: string, targetUser?: FollowUser) => {
    if (!currentUserId) return;
    
    const existingRequest = followRequests.find(
      r => r.requesterId === currentUserId && r.targetId === targetUserId && r.status === 'pending'
    );
    
    if (existingRequest) return;

    const newRequest: FollowRequest = {
      id: `req-${currentUserId}-${targetUserId}`,
      requesterId: currentUserId,
      targetId: targetUserId,
      timestamp: Date.now(),
      status: 'pending'
    };

    setFollowRequests(prev => [...prev, newRequest]);
    
    if (targetUser) {
      registerUser(targetUser);
    }
  }, [currentUserId, followRequests, registerUser]);

  const hasPendingRequest = useCallback((targetUserId: string): boolean => {
    if (!currentUserId) return false;
    return followRequests.some(
      r => r.requesterId === currentUserId && r.targetId === targetUserId && r.status === 'pending'
    );
  }, [currentUserId, followRequests]);

  const getFollowRequests = useCallback((): FollowUser[] => {
    if (!currentUserId) return [];
    
    const pendingRequests = followRequests.filter(
      r => r.targetId === currentUserId && r.status === 'pending'
    );
    
    return pendingRequests
      .map(r => knownUsers.find(u => u.id === r.requesterId))
      .filter((u): u is FollowUser => u !== undefined);
  }, [currentUserId, followRequests, knownUsers]);

  const getFollowRequestCount = useCallback((): number => {
    if (!currentUserId) return 0;
    return followRequests.filter(
      r => r.targetId === currentUserId && r.status === 'pending'
    ).length;
  }, [currentUserId, followRequests]);

  const approveFollowRequest = useCallback((requesterId: string) => {
    if (!currentUserId) return;
    
    setFollowRequests(prev => prev.map(r => 
      r.requesterId === requesterId && r.targetId === currentUserId && r.status === 'pending'
        ? { ...r, status: 'approved' as const }
        : r
    ));

    // Create the follow relationship
    const newFollow: Follow = {
      id: `${requesterId}-${currentUserId}`,
      followerId: requesterId,
      followingId: currentUserId,
      timestamp: Date.now()
    };
    
    setFollows(prev => [...prev, newFollow]);
  }, [currentUserId]);

  const denyFollowRequest = useCallback((requesterId: string) => {
    if (!currentUserId) return;
    
    setFollowRequests(prev => prev.map(r => 
      r.requesterId === requesterId && r.targetId === currentUserId && r.status === 'pending'
        ? { ...r, status: 'denied' as const }
        : r
    ));
  }, [currentUserId]);

  const cancelFollowRequest = useCallback((targetUserId: string) => {
    if (!currentUserId) return;
    
    setFollowRequests(prev => prev.filter(
      r => !(r.requesterId === currentUserId && r.targetId === targetUserId && r.status === 'pending')
    ));
  }, [currentUserId]);

  // Suggested users - returns empty array, will be populated from real profiles
  const getSuggestedUsers = useCallback((): SuggestedUser[] => {
    if (!currentUserId) return [];
    // Return empty - suggested users will be fetched from real profiles
    return [];
  }, [currentUserId]);

  const dismissSuggestedUser = useCallback((userId: string) => {
    setDismissedSuggestions(prev => [...prev, userId]);
  }, []);

  // Enhanced toggle follow that handles private accounts
  const toggleFollowWithPrivacy = useCallback((targetUserId: string, targetUser?: FollowUser) => {
    if (isFollowing(targetUserId)) {
      unfollowUser(targetUserId);
    } else if (hasPendingRequest(targetUserId)) {
      cancelFollowRequest(targetUserId);
    } else if (isPrivateAccount(targetUserId)) {
      sendFollowRequest(targetUserId, targetUser);
    } else {
      followUser(targetUserId, targetUser);
    }
  }, [isFollowing, hasPendingRequest, isPrivateAccount, unfollowUser, cancelFollowRequest, sendFollowRequest, followUser]);

  return {
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    toggleFollowWithPrivacy,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    getFollowingUserIds,
    registerUser,
    // Privacy
    isPrivateAccount,
    setPrivateAccount,
    // Follow requests
    sendFollowRequest,
    hasPendingRequest,
    getFollowRequests,
    getFollowRequestCount,
    approveFollowRequest,
    denyFollowRequest,
    cancelFollowRequest,
    // Suggested users
    getSuggestedUsers,
    dismissSuggestedUser
  };
};
