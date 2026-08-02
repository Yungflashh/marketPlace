import React from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'gold' | 'success' | 'warning' | 'error' | 'info';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-hover text-ink-muted',
  gold: 'bg-gold-soft text-gold',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', icon, className = '', children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide [&>svg]:w-3 [&>svg]:h-3',
      toneClasses[tone],
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </span>
);

export default Badge;
