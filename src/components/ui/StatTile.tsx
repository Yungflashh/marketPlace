import React from 'react';

interface Props {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error';
  hint?: string;
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  neutral: 'bg-surface-hover text-ink-soft',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
};

const StatTile: React.FC<Props> = ({ label, value, icon, tone = 'neutral', hint }) => (
  <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 sm:p-5">
    <div className="flex items-start justify-between mb-3">
      <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {icon && (
        <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center ${toneClasses[tone]}`}>
          {icon}
        </div>
      )}
    </div>
    <div className="font-display text-[24px] font-bold text-ink leading-none">{value}</div>
    {hint && <p className="text-[12px] text-ink-muted mt-2">{hint}</p>}
  </div>
);

export default StatTile;
