import { useMemo } from 'react';

interface Post {
  id: string;
  user_id: string;
  username?: string;
  avatar_url?: string | null;
  caption?: string | null;
  image_url?: string | null;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  is_verified?: boolean;
}

interface AlgorithmFactors {
  // User interaction history
  likedUserIds: string[];
  commentedUserIds: string[];
  followingIds: string[];
  currentUserId: string;
}

// Algorithm weights
const WEIGHTS = {
  RECENCY: 0.3,           // How recent the post is
  ENGAGEMENT: 0.25,       // Likes and comments
  RELATIONSHIP: 0.25,     // Following status and past interactions
  DIVERSITY: 0.1,         // Variety of content creators
  VERIFIED: 0.1,          // Verified account boost
};

// Time decay constants (in hours)
const TIME_DECAY_HALF_LIFE = 24; // Posts lose half their recency score after 24 hours

export const useFeedAlgorithm = (
  posts: Post[],
  factors: AlgorithmFactors
) => {
  return useMemo(() => {
    if (!posts.length) return [];

    const now = new Date().getTime();
    const seenCreators = new Set<string>();
    
    // Calculate scores for each post
    const scoredPosts = posts.map(post => {
      let score = 0;
      
      // 1. Recency Score (exponential decay)
      const postAge = (now - new Date(post.created_at).getTime()) / (1000 * 60 * 60); // hours
      const recencyScore = Math.pow(0.5, postAge / TIME_DECAY_HALF_LIFE);
      score += recencyScore * WEIGHTS.RECENCY * 100;
      
      // 2. Engagement Score (normalized)
      const likes = post.likes_count || 0;
      const comments = post.comments_count || 0;
      const engagementScore = Math.log10(likes + comments * 2 + 1) / 5; // Log scale, normalized
      score += Math.min(engagementScore, 1) * WEIGHTS.ENGAGEMENT * 100;
      
      // 3. Relationship Score
      let relationshipScore = 0;
      
      // Boost if following
      if (factors.followingIds.includes(post.user_id)) {
        relationshipScore += 0.4;
      }
      
      // Boost if user has liked this creator's posts before
      if (factors.likedUserIds.includes(post.user_id)) {
        relationshipScore += 0.3;
      }
      
      // Boost if user has commented on this creator's posts
      if (factors.commentedUserIds.includes(post.user_id)) {
        relationshipScore += 0.3;
      }
      
      // Own posts get a slight boost
      if (post.user_id === factors.currentUserId) {
        relationshipScore += 0.2;
      }
      
      score += Math.min(relationshipScore, 1) * WEIGHTS.RELATIONSHIP * 100;
      
      // 4. Diversity Score (penalize seeing same creator too often)
      let diversityScore = 1;
      if (seenCreators.has(post.user_id)) {
        diversityScore = 0.5; // Reduce score for repeated creators
      }
      score += diversityScore * WEIGHTS.DIVERSITY * 100;
      seenCreators.add(post.user_id);
      
      // 5. Verified Account Boost
      if (post.is_verified) {
        score += WEIGHTS.VERIFIED * 100;
      }
      
      // Add some randomness (±5%) to prevent exact same order
      const randomFactor = 0.95 + Math.random() * 0.1;
      score *= randomFactor;
      
      return { post, score };
    });
    
    // Sort by score (highest first) and extract posts
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post);
  }, [posts, factors.currentUserId, factors.followingIds, factors.likedUserIds, factors.commentedUserIds]);
};

// Helper hook to track user interactions for the algorithm
export const useInteractionHistory = (currentUserId: string) => {
  // In a real app, this would fetch from the database
  // For now, we'll use localStorage to track interactions
  const getStoredArray = (key: string): string[] => {
    try {
      const stored = localStorage.getItem(`${key}-${currentUserId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addToArray = (key: string, userId: string) => {
    const current = getStoredArray(key);
    if (!current.includes(userId)) {
      const updated = [...current, userId].slice(-50); // Keep last 50
      localStorage.setItem(`${key}-${currentUserId}`, JSON.stringify(updated));
    }
  };

  return {
    likedUserIds: getStoredArray('liked-users'),
    commentedUserIds: getStoredArray('commented-users'),
    recordLike: (postUserId: string) => addToArray('liked-users', postUserId),
    recordComment: (postUserId: string) => addToArray('commented-users', postUserId),
  };
};
