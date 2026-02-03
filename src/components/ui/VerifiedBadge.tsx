import { cn } from '@/lib/utils';
import React, { memo } from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Memoized for faster re-renders
export const VerifiedBadge = memo(({ className, size = 'md' }: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(sizeClasses[size], 'flex-shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified"
    >
      {/* Serrated/star-burst badge shape */}
      <path
        d="M12 2L14.09 4.26L17 3.29L17.63 6.37L20.71 7L19.74 9.91L22 12L19.74 14.09L20.71 17L17.63 17.63L17 20.71L14.09 19.74L12 22L9.91 19.74L7 20.71L6.37 17.63L3.29 17L4.26 14.09L2 12L4.26 9.91L3.29 7L6.37 6.37L7 3.29L9.91 4.26L12 2Z"
        className="fill-verified"
      />
      {/* White checkmark */}
      <path
        d="M9.5 12.5L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

VerifiedBadge.displayName = 'VerifiedBadge';
