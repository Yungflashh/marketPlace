import React from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'gold';

const toneClasses: Record<Tone, string> = {
  neutral: 'text-ink-muted',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
  gold: 'text-gold',
};

export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  trend?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, tone = 'neutral', trend, className = '' }) => (
  <div className={cn('rounded-xl border border-hairline bg-surface p-5', className)}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-[13px] font-medium text-ink-faint">{label}</p>
      {icon && <span className={cn('[&>svg]:w-4 [&>svg]:h-4', toneClasses[tone])}>{icon}</span>}
    </div>
    <p className="font-display text-[28px] font-medium text-ink leading-none truncate">{value}</p>
    {trend && <p className={cn('text-xs font-medium mt-2', toneClasses[tone])}>{trend}</p>}
  </div>
);

export default StatCard;
