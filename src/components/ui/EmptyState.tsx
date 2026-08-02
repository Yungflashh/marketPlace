import React from 'react';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
    <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-ink-faint mb-4 [&>svg]:w-6 [&>svg]:h-6">
      {icon}
    </div>
    <h3 className="text-[15px] font-semibold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-faint max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
