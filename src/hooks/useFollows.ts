import { useState, useCallback, useEffect } from 'react';

interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  timestamp: number;
}

interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

const FOLLOWS_KEY = 'app-follows';
const USERS_KEY = 'app-known-users';

export const useFollows = (currentUserId?: string) => {
  const [follows, setFollows] = useState<Follow[]>(() => {
    const saved = localStorage.getItem(FOLLOWS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [knownUsers, setKnownUsers] = useState<FollowUser[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever follows change
  useEffect(() => {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
  }, [follows]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(knownUsers));
  }, [knownUsers]);

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

  return {
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    registerUser
  };
};
