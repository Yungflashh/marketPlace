import React from 'react';
import { cn } from '../../utils/cn';

const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={cn('relative overflow-hidden rounded-lg bg-surface', className)} {...props}>
    <span className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_1.6s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
  </div>
);

export default Skeleton;
