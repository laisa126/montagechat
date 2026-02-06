import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface InstagramLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InstagramLoader = ({ size = 'md', className }: InstagramLoaderProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "relative",
        sizeClasses[size]
      )}>
        {/* Instagram-style gradient spinner */}
        <svg
          className={cn("animate-instagram-spin", sizeClasses[size])}
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#instagram-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80 100"
          />
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--primary) / 0.6)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// Skeleton loaders with shimmer effect
interface SkeletonLoaderProps {
  className?: string;
}

export const AvatarSkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn("rounded-full bg-muted animate-shimmer", className)} />
);

export const TextSkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn("h-4 rounded-md bg-muted animate-shimmer", className)} />
);

export const PostSkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex items-center gap-3 px-4">
      <AvatarSkeleton className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <TextSkeleton className="w-24" />
        <TextSkeleton className="w-16 h-3" />
      </div>
    </div>
    {/* Image */}
    <div className="aspect-square bg-muted animate-shimmer" />
    {/* Actions */}
    <div className="px-4 space-y-2">
      <div className="flex gap-4">
        <AvatarSkeleton className="w-6 h-6 rounded-none" />
        <AvatarSkeleton className="w-6 h-6 rounded-none" />
        <AvatarSkeleton className="w-6 h-6 rounded-none" />
      </div>
      <TextSkeleton className="w-20" />
      <TextSkeleton className="w-3/4" />
    </div>
  </div>
);

export const ProfileSkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn("space-y-4 p-4", className)}>
    {/* Header */}
    <div className="flex items-center gap-6">
      <AvatarSkeleton className="w-20 h-20" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-around">
          <div className="text-center space-y-1">
            <TextSkeleton className="w-8 h-5 mx-auto" />
            <TextSkeleton className="w-12 h-3" />
          </div>
          <div className="text-center space-y-1">
            <TextSkeleton className="w-8 h-5 mx-auto" />
            <TextSkeleton className="w-12 h-3" />
          </div>
          <div className="text-center space-y-1">
            <TextSkeleton className="w-8 h-5 mx-auto" />
            <TextSkeleton className="w-12 h-3" />
          </div>
        </div>
      </div>
    </div>
    {/* Bio */}
    <div className="space-y-2">
      <TextSkeleton className="w-32" />
      <TextSkeleton className="w-48" />
    </div>
    {/* Button */}
    <TextSkeleton className="w-full h-9 rounded-lg" />
  </div>
);

export const StorySkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn("flex flex-col items-center gap-1", className)}>
    <AvatarSkeleton className="w-16 h-16 ring-2 ring-muted" />
    <TextSkeleton className="w-12 h-3" />
  </div>
);

export const SuggestedUserSkeleton = ({ className }: SkeletonLoaderProps) => (
  <div className={cn(
    "flex flex-col items-center bg-card border border-border rounded-xl p-4 min-w-[150px] w-[150px]",
    className
  )}>
    <AvatarSkeleton className="w-16 h-16 mb-2" />
    <TextSkeleton className="w-20 mb-1" />
    <TextSkeleton className="w-16 h-3 mb-3" />
    <TextSkeleton className="w-full h-8 rounded-xl" />
  </div>
);

// Full page loader
export const PageLoader = ({ className }: SkeletonLoaderProps) => (
  <div className={cn(
    "min-h-screen bg-background flex items-center justify-center",
    className
  )}>
    <InstagramLoader size="lg" />
  </div>
);

// Inline loading text
export const LoadingText = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm">{text}</span>
  </div>
);
