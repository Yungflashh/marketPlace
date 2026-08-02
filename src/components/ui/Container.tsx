import React from 'react';
import { cn } from '../../utils/cn';

const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={cn('max-w-6xl mx-auto px-4 sm:px-6 lg:px-10', className)} {...props} />
);

export default Container;
