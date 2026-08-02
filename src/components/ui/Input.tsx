import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightElement, className = '', wrapperClassName = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ink-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full h-11 rounded-lg border bg-surface text-[15px] text-ink placeholder:text-ink-faint transition-colors duration-150 outline-none disabled:opacity-50',
              icon ? 'pl-10' : 'pl-3.5',
              rightElement ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/30'
                : 'border-hairline-strong focus:border-gold focus:ring-2 focus:ring-gold/25',
              className
            )}
            {...props}
          />
          {rightElement && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-[13px] text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-ink-faint">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
