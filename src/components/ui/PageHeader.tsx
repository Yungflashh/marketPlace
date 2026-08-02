import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
    <div className="min-w-0">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold mb-2">{eyebrow}</p>}
      <h1 className="font-display text-[28px] sm:text-[34px] font-medium text-ink tracking-tight leading-none">
        {title}
      </h1>
      {description && <p className="text-[15px] text-ink-faint mt-2.5">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
  </div>
);

export default PageHeader;
