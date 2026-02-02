import React, { useState, useEffect } from 'react';
import { Play, Images, Loader2 } from 'lucide-react';
import { useNavigation } from '@/navigation/NavigationContext';
import { useHaptic } from '@/hooks/useHaptic';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ExplorePost {
  id: string;
  imageUrl: string;
  type: 'post' | 'reel';
  likesCount: number;
  commentsCount: number;
  isMultiple?: boolean;
}

interface ExploreGridProps {
  onPostTap?: (post: ExplorePost) => void;
}

export const ExploreGrid: React.FC<ExploreGridProps> = ({ onPostTap }) => {
  const { navigate } = useNavigation();
  const { trigger } = useHaptic();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        // Fetch recent posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, image_url, created_at')
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30);

        if (postsError) throw postsError;

        // Fetch recent reels
        const { data: reelsData, error: reelsError } = await supabase
          .from('reels')
          .select('id, video_url, likes_count, comments_count, created_at')
          .order('created_at', { ascending: false })
          .limit(15);

        if (reelsError) throw reelsError;

        const explorePosts: ExplorePost[] = [];

        // Add posts
        postsData?.forEach(post => {
          if (post.image_url) {
            explorePosts.push({
              id: post.id,
              imageUrl: post.image_url,
              type: 'post',
              likesCount: 0,
              commentsCount: 0
            });
          }
        });

        // Add reels (using video thumbnail or placeholder)
        reelsData?.forEach(reel => {
          explorePosts.push({
            id: reel.id,
            imageUrl: reel.video_url, // In real app, this would be a thumbnail
            type: 'reel',
            likesCount: reel.likes_count || 0,
            commentsCount: reel.comments_count || 0
          });
        });

        // Shuffle for variety
        const shuffled = explorePosts.sort(() => Math.random() - 0.5);
        setPosts(shuffled);
      } catch (error) {
        console.error('Error fetching explore posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  const handlePostTap = (post: ExplorePost, index: number) => {
    trigger('light');
    
    if (onPostTap) {
      onPostTap(post);
      return;
    }

    if (post.type === 'reel') {
      navigate('reel-viewer', { reelId: post.id });
    } else {
      navigate('post-detail', { postId: post.id, imageUrl: post.imageUrl });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Images className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Nothing to explore yet</h3>
        <p className="text-muted-foreground text-sm">
          Posts and reels will appear here
        </p>
      </div>
    );
  }

  // Instagram-style grid layout: alternating large and small tiles
  const renderGrid = () => {
    const rows: React.ReactNode[] = [];
    let index = 0;

    while (index < posts.length) {
      const rowType = Math.floor(index / 5) % 2;
      
      if (rowType === 0) {
        // Row pattern: 3 equal squares
        const rowPosts = posts.slice(index, index + 3);
        rows.push(
          <div key={`row-${index}`} className="grid grid-cols-3 gap-0.5">
            {rowPosts.map((post, i) => (
              <PostTile
                key={post.id}
                post={post}
                onClick={() => handlePostTap(post, index + i)}
                size="small"
              />
            ))}
          </div>
        );
        index += 3;
      } else {
        // Row pattern: 1 large + 2 small stacked, or 2 small stacked + 1 large
        const isRightLarge = (index / 5) % 2 === 1;
        const rowPosts = posts.slice(index, index + 3);
        
        if (rowPosts.length >= 3) {
          rows.push(
            <div key={`row-${index}`} className="grid grid-cols-3 gap-0.5">
              {isRightLarge ? (
                <>
                  <div className="col-span-1 grid grid-rows-2 gap-0.5">
                    {rowPosts.slice(0, 2).map((post, i) => (
                      <PostTile
                        key={post.id}
                        post={post}
                        onClick={() => handlePostTap(post, index + i)}
                        size="small"
                      />
                    ))}
                  </div>
                  <div className="col-span-2 row-span-2">
                    <PostTile
                      post={rowPosts[2]}
                      onClick={() => handlePostTap(rowPosts[2], index + 2)}
                      size="large"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 row-span-2">
                    <PostTile
                      post={rowPosts[0]}
                      onClick={() => handlePostTap(rowPosts[0], index)}
                      size="large"
                    />
                  </div>
                  <div className="col-span-1 grid grid-rows-2 gap-0.5">
                    {rowPosts.slice(1, 3).map((post, i) => (
                      <PostTile
                        key={post.id}
                        post={post}
                        onClick={() => handlePostTap(post, index + 1 + i)}
                        size="small"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        } else {
          // Not enough posts for the pattern, just show remaining
          rows.push(
            <div key={`row-${index}`} className="grid grid-cols-3 gap-0.5">
              {rowPosts.map((post, i) => (
                <PostTile
                  key={post.id}
                  post={post}
                  onClick={() => handlePostTap(post, index + i)}
                  size="small"
                />
              ))}
            </div>
          );
        }
        index += 3;
      }
    }

    return rows;
  };

  return <div className="gap-0.5">{renderGrid()}</div>;
};

interface PostTileProps {
  post: ExplorePost;
  onClick: () => void;
  size: 'small' | 'large';
}

const PostTile: React.FC<PostTileProps> = ({ post, onClick, size }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative bg-muted overflow-hidden active:opacity-80 transition-opacity",
        size === 'large' ? 'aspect-square' : 'aspect-square'
      )}
    >
      {post.type === 'reel' ? (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <Play className="w-8 h-8 text-white fill-white opacity-80" />
        </div>
      ) : (
        <img
          src={post.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      
      {/* Reel indicator */}
      {post.type === 'reel' && (
        <div className="absolute top-2 right-2">
          <Play className="w-4 h-4 fill-white text-white drop-shadow-lg" />
        </div>
      )}
      
      {/* Multiple images indicator */}
      {post.isMultiple && (
        <div className="absolute top-2 right-2">
          <Images className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      )}
    </button>
  );
};
