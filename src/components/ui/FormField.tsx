import React from 'react';

interface Props {
  label?: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<Props> = ({ label, htmlFor, description, error, required, className = '', children }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-soft">
        {label} {required && <span className="text-error">*</span>}
      </label>
    )}
    {children}
    {description && !error && <p className="text-[12px] text-ink-muted">{description}</p>}
    {error && <p className="text-[12px] text-error font-medium">{error}</p>}
  </div>
);

export default FormField;
