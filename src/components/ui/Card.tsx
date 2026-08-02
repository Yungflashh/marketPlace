import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  tone?: 'surface' | 'raised';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hoverable, tone = 'surface', className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-hairline',
        tone === 'surface' ? 'bg-surface' : 'bg-canvas-raised',
        hoverable && 'transition-colors duration-150 hover:border-hairline-strong hover:bg-surface-hover',
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export default Card;
