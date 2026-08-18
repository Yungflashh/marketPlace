import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'accent';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover shadow-[var(--shadow-vault-sm)] hover:shadow-[var(--shadow-vault-glow)]',
  secondary:
    'bg-surface text-ink border border-border hover:bg-surface-hover hover:border-border-strong',
  tertiary:
    'bg-primary-soft text-primary hover:brightness-95 dark:hover:brightness-110',
  ghost:
    'bg-transparent text-ink-soft hover:bg-surface-hover hover:text-ink',
  destructive:
    'bg-error text-white hover:brightness-95',
  accent:
    'bg-accent text-[var(--vault-canvas)] hover:brightness-95 shadow-[var(--shadow-vault-sm)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-[14.5px] gap-2 rounded-[var(--radius-md)]',
  icon: 'h-10 w-10 rounded-[var(--radius-md)] p-0 justify-center',
};

const Button: React.FC<Props> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium tracking-tight transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
      {size !== 'icon' && children}
    </button>
  );
};

export default Button;
