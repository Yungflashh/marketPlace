import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = '', id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-medium text-ink-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'w-full h-11 rounded-lg border bg-surface text-[15px] text-ink pl-3.5 pr-10 appearance-none outline-none transition-colors duration-150 disabled:opacity-50',
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/30'
                : 'border-hairline-strong focus:border-gold focus:ring-2 focus:ring-gold/25',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-faint absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error ? (
          <p className="mt-1.5 text-[13px] text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Select;
