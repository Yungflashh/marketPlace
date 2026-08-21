import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea: React.FC<Props> = ({ invalid = false, className = '', ...rest }) => (
  <textarea
    className={`w-full bg-elevated border rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 ${invalid ? 'border-error' : 'border-border'} ${className}`}
    {...rest}
  />
);

export default Textarea;
