import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const Input: React.FC<Props> = ({ invalid = false, leftIcon, rightSlot, className = '', ...rest }) => (
  <div className="relative">
    {leftIcon && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
        {leftIcon}
      </span>
    )}
    <input
      className={`w-full h-11 bg-elevated border rounded-[var(--radius-md)] text-[13.5px] text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 ${leftIcon ? 'pl-10' : 'pl-3.5'} ${rightSlot ? 'pr-10' : 'pr-3.5'} ${invalid ? 'border-error' : 'border-border'} ${className}`}
      {...rest}
    />
    {rightSlot && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
        {rightSlot}
      </span>
    )}
  </div>
);

export default Input;
