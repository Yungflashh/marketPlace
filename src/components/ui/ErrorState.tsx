import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  className = '',
}) => (
  <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
    <div className="w-14 h-14 rounded-full bg-danger-soft flex items-center justify-center text-danger mb-4">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-[15px] font-semibold text-ink mb-1">{title}</h3>
    <p className="text-sm text-ink-faint max-w-sm mb-6">{description}</p>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
