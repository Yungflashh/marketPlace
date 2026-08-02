import React from 'react';
import { cn } from '../../utils/cn';

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[3px]',
};

export interface SpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn('rounded-full border-hairline-strong border-t-gold animate-spin', sizeMap[size], className)}
  />
);

export default Spinner;
