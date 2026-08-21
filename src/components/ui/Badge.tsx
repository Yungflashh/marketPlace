import React from 'react';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

interface Props {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-hover text-ink-soft border border-border',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
};

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-ink-muted',
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const Badge: React.FC<Props> = ({ tone = 'neutral', className = '', children, dot = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${toneClasses[tone]} ${className}`}
  >
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[tone]}`} />}
    {children}
  </span>
);

export default Badge;
