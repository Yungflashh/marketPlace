import React from 'react';

interface Candle {
  x: number;
  wickTop: number;
  wickBottom: number;
  bodyTop: number;
  bodyBottom: number;
}

const VIEW_W = 1040;
const VIEW_H = 180;
const COUNT = 26;
const SPACING = VIEW_W / COUNT;

/** Deterministic hash-based pseudo-random — stable across renders, no seeded-RNG dependency. */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** A single wandering, mean-reverting price series — reads as a real chart, not a repeating texture. */
const buildSeries = (seedOffset: number): Candle[] => {
  const candles: Candle[] = [];
  let price = VIEW_H / 2;
  for (let i = 0; i < COUNT; i++) {
    const r1 = seededRandom(i + seedOffset);
    const r2 = seededRandom(i + seedOffset + 71);
    const r3 = seededRandom(i + seedOffset + 137);
    const drift = (r1 - 0.5) * 34;
    const meanReversion = (VIEW_H / 2 - price) * 0.1;
    const open = price;
    const close = Math.max(20, Math.min(VIEW_H - 20, price + drift + meanReversion));
    const high = Math.max(open, close) + r2 * 12 + 3;
    const low = Math.min(open, close) - r3 * 12 - 3;
    candles.push({
      x: i * SPACING + SPACING / 2,
      wickTop: Math.max(2, high),
      wickBottom: Math.min(VIEW_H - 2, low),
      bodyTop: Math.min(open, close),
      bodyBottom: Math.max(open, close),
    });
    price = close;
  }
  return candles;
};

const SERIES = { a: buildSeries(3), b: buildSeries(97) };

/** Renders a <g> per candle at an optional x-shift, for building a seamless doubled strip. */
const renderCandles = (candles: Candle[], shift = 0) =>
  candles.map((c, i) => (
    <g key={`${shift}-${i}`}>
      <line x1={c.x + shift} y1={c.wickTop} x2={c.x + shift} y2={c.wickBottom} stroke="currentColor" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      <rect
        x={c.x + shift - SPACING * 0.24}
        y={c.bodyTop}
        width={SPACING * 0.48}
        height={Math.max(2.5, c.bodyBottom - c.bodyTop)}
        fill="currentColor"
        fillOpacity="0.8"
      />
    </g>
  ));

interface Props {
  variant?: 'a' | 'b';
  className?: string;
  style?: React.CSSProperties;
  /** Scroll the chart sideways like a live ticker. Default true. */
  animate?: boolean;
  /** Seconds per full loop — lower is faster. */
  speed?: number;
}

/**
 * A restrained candlestick-chart texture — the marketplace is wallet/crypto funded,
 * so a price-chart motif reads far more "on brand" than an abstract grid or dots.
 * When `animate` is true it drifts sideways like a live ticker: the series is drawn
 * twice back-to-back and the whole strip is translated exactly one copy-width in a
 * linear infinite loop, so the seam is invisible and the scroll never "jumps".
 * Colored via `currentColor` so it inherits whatever text-color utility is applied.
 */
// Fixed, responsive band height — independent of section height. Hidden below `sm`:
// mobile sections run long due to stacked content, so a horizontally-stretched chart
// reads badly there; mobile gets a different static pattern instead (see MobilePattern).
const BAND_CLASS = 'hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 sm:h-[190px] lg:h-[240px] xl:h-[680px]';

const CandlePattern: React.FC<Props> = ({ variant = 'a', className = '', style, animate = true, speed = 34 }) => {
  const candles = SERIES[variant];

  if (!animate) {
    return (
      <svg className={`${BAND_CLASS} ${className}`} style={style} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" aria-hidden="true">
        {renderCandles(candles)}
      </svg>
    );
  }

  return (
    <div className={`${BAND_CLASS} overflow-hidden ${className}`} style={style} aria-hidden="true">
      <svg
        className="ticker-track h-full"
        style={{ width: '200%', animationDuration: `${speed}s` }}
        viewBox={`0 0 ${VIEW_W * 2} ${VIEW_H}`}
        preserveAspectRatio="none"
      >
        {renderCandles(candles)}
        {renderCandles(candles, VIEW_W)}
      </svg>
    </div>
  );
};

export default CandlePattern;
