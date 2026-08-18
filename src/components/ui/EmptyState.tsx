import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<Props> = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
    <div className="animate-scale-in w-14 h-14 rounded-[var(--radius-lg)] bg-primary-soft text-primary flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="animate-fade-up [animation-delay:60ms] font-display text-[16px] font-semibold text-ink mb-1.5">{title}</h3>
    {description && (
      <p className="animate-fade-up [animation-delay:120ms] text-[13.5px] text-ink-muted max-w-sm leading-relaxed mb-5">{description}</p>
    )}
    {action && <div className="animate-fade-up [animation-delay:180ms]">{action}</div>}
  </div>
);

export default EmptyState;
