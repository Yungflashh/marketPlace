import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gold text-canvas hover:bg-gold-strong active:brightness-95 disabled:bg-gold/40 disabled:text-canvas/60 font-bold',
  secondary:
    'bg-surface text-ink border border-hairline-strong hover:bg-surface-hover hover:border-ink-faint disabled:text-ink-faint disabled:border-hairline',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface hover:text-ink disabled:text-ink-faint',
  destructive: 'bg-danger text-canvas hover:brightness-110 active:brightness-95 disabled:bg-danger/40 font-bold',
  success: 'bg-success text-canvas hover:brightness-110 active:brightness-95 disabled:bg-success/40 font-bold',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg [&_svg]:w-3.5 [&_svg]:h-3.5',
  md: 'h-11 px-4 text-sm gap-2 rounded-lg [&_svg]:w-4 [&_svg]:h-4',
  lg: 'h-[52px] px-6 text-[15px] gap-2 rounded-lg [&_svg]:w-[18px] [&_svg]:h-[18px]',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, icon, disabled, className = '', children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
