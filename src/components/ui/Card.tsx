import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  elevated?: boolean;
}

const Card: React.FC<Props> = ({ padded = true, elevated = false, className = '', children, ...rest }) => (
  <div
    className={`bg-surface border border-border rounded-[var(--radius-lg)] ${elevated ? 'shadow-[var(--shadow-vault-md)]' : ''} ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
