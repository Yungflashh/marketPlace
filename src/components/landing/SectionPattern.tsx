import React from 'react';
import CandlePattern from './CandlePattern';

const FADE_X: React.CSSProperties = {
  maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
};

interface Props {
  variant?: 'a' | 'b';
  speed?: number;
}

/**
 * A section's background texture: bold static diagonal hatching on mobile (cheap,
 * clearly visible, doesn't stretch badly on tall narrow sections), the animated
 * candlestick ticker from `sm` up — never competes with content, edge-faded either way.
 * Shared across the landing and store pages for a consistent brand identity.
 */
const SectionPattern: React.FC<Props> = ({ variant = 'a', speed = 34 }) => (
  <>
    <div
      className="sm:hidden pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[120px] -z-10 pattern-mobile-lines opacity-[0.8] dark:opacity-[0.55]"
      style={FADE_X}
      aria-hidden="true"
    />
    <CandlePattern
      variant={variant}
      speed={speed}
      className="pointer-events-none -z-10 text-ink-muted opacity-[0.5] dark:opacity-[0.32]"
      style={FADE_X}
    />
  </>
);

export default SectionPattern;
