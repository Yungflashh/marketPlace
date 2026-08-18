import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

const Select: React.FC<Props> = ({ invalid = false, className = '', children, ...rest }) => (
  <div className="relative">
    <select
      className={`w-full h-11 appearance-none bg-elevated border rounded-[var(--radius-md)] pl-3.5 pr-9 text-[13.5px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 ${invalid ? 'border-error' : 'border-border'} ${className}`}
      {...rest}
    >
      {children}
    </select>
    <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

export default Select;
