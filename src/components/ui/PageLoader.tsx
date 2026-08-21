import React from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '../Logo';

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-canvas">
    <div className="relative">
      <Logo size={40} />
      <Loader2 className="w-14 h-14 text-primary/30 animate-spin absolute -inset-2" />
    </div>
    <p className="text-[13px] text-ink-muted font-medium">Loading&hellip;</p>
  </div>
);

export default PageLoader;
