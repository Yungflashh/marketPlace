import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const AdminPageHeader: React.FC<Props> = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-[var(--radius-md)] bg-primary-soft text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h1 className="font-display text-[19px] sm:text-[21px] font-bold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default AdminPageHeader;
