import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div>
        {label && (
          <label htmlFor={textareaId} className="block text-[13px] font-medium text-ink-muted mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-lg border bg-surface text-[15px] text-ink placeholder:text-ink-faint px-3.5 py-2.5 transition-colors duration-150 outline-none resize-none disabled:opacity-50',
            error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/30'
              : 'border-hairline-strong focus:border-gold focus:ring-2 focus:ring-gold/25',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-[13px] text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;
