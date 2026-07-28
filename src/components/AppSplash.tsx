import React from 'react';

interface AppSplashProps {
  exiting: boolean;
  onExited: () => void;
}

const AppSplash: React.FC<AppSplashProps> = ({ exiting, onExited }) => (
  <div
    onAnimationEnd={(e) => {
      if (e.animationName === 'splash-out') onExited();
    }}
    className={`fixed inset-0 z-[100] flex items-center justify-center bg-canvas bg-spotlight ${
      exiting ? 'animate-splash-out pointer-events-none' : ''
    }`}
  >
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            animationDuration: '1.1s',
            background: 'conic-gradient(from 0deg, transparent 0%, var(--color-gold) 80%, transparent 100%)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
          }}
        />
        <div className="w-11 h-11 rounded-lg bg-gold flex items-center justify-center font-display font-semibold text-canvas text-xl animate-logo-pulse">
          S
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <span className="font-display text-base text-ink tracking-tight">ShopLogs</span>
        <div className="relative w-32 h-[2px] rounded-full bg-hairline overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gold animate-progress-loop" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Initializing catalog</span>
      </div>
    </div>
  </div>
);

export default AppSplash;
