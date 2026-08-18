import React from 'react';

interface Props {
  className?: string;
}

export const Skeleton: React.FC<Props> = ({ className = '' }) => (
  <div className={`skeleton rounded-[var(--radius-sm)] ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="border border-border rounded-[var(--radius-lg)] p-4 space-y-3">
    <Skeleton className="h-32 w-full rounded-[var(--radius-md)]" />
    <Skeleton className="h-3.5 w-3/4" />
    <Skeleton className="h-3.5 w-1/2" />
    <div className="flex items-center justify-between pt-1">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  </div>
);

export default Skeleton;
