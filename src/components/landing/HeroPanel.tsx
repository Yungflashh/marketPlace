import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, CircleDot, Loader2, Wallet, Zap } from 'lucide-react';

const CHECKS = [
  { label: 'Ownership verified', sub: 'Matched against source records' },
  { label: 'Balance confirmed', sub: 'Snapshot refreshed under 24h ago' },
  { label: 'Freshness passed', sub: 'No prior resale on this log' },
  { label: 'Queued for delivery', sub: 'Encrypted and wallet-ready' },
];

const STEP_MS = 1700;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The landing page's central visual: a live "verification engine" panel cycling
 * through the real checks ShopLogs performs before a log is listed, plus a
 * secondary wallet/delivery panel — both drift gently and tilt slightly toward
 * the pointer to feel alive without being distracting.
 */
const HeroPanel: React.FC = () => {
  const [step, setStep] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(CHECKS.length - 1);
      return;
    }
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (CHECKS.length + 1));
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const wrap = wrapRef.current;
    if (!wrap || !window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (mainRef.current) mainRef.current.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
      if (sideRef.current) sideRef.current.style.transform = `translate(${x * 14}px, ${y * 14}px) rotate(-4deg)`;
    };
    const onLeave = () => {
      if (mainRef.current) mainRef.current.style.transform = '';
      if (sideRef.current) sideRef.current.style.transform = 'rotate(-4deg)';
    };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const complete = step >= CHECKS.length;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-[440px] select-none mb-24 sm:mb-28 lg:mb-0"
      style={{ perspective: '1200px' }}
    >
      {/* ambient glow anchored behind the panel, not washing the page */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-40 dark:opacity-30"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--vault-primary) 35%, transparent), transparent)' }}
        aria-hidden="true"
      />

      {/* Secondary panel — wallet / instant delivery */}
      <div
        ref={sideRef}
        className="animate-panel-float absolute z-10 -right-6 -bottom-8 sm:-right-10 sm:-bottom-10 w-[190px] bg-elevated border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-vault-lg)] p-4 transition-transform duration-200 ease-out"
        style={{ '--panel-rot': '-4deg', transform: 'rotate(-4deg)' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Wallet className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">Wallet</span>
        </div>
        <p className="font-display text-[19px] font-bold text-ink leading-none mb-3">$2,480.00</p>
        <div className="flex items-center gap-1.5 text-[10.5px] text-success font-medium">
          <Zap className="w-3 h-3" />
          Instant delivery ready
        </div>
      </div>

      {/* Main panel — verification engine */}
      <div
        ref={mainRef}
        className="relative bg-elevated border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-vault-lg)] overflow-hidden transition-transform duration-200 ease-out"
      >
        {/* scan sweep */}
        <div className="absolute inset-x-0 top-0 h-16 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="animate-scan-y absolute inset-x-0 h-16"
            style={{ background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--vault-primary) 12%, transparent), transparent)' }}
          />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border">
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-ink truncate">Chase Business &bull;&bull;&bull;&bull; 4821</p>
            <p className="text-[10.5px] text-ink-muted font-mono">REF · 8F2A-4821-C9</p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider transition-colors duration-300 ${
              complete ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'
            }`}
          >
            {complete ? <ShieldCheck className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
            {complete ? 'Verified' : 'Scanning'}
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {CHECKS.map((check, i) => {
            const state = i < step || complete ? 'done' : i === step ? 'active' : 'pending';
            return (
              <div key={check.label} className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    state === 'done'
                      ? 'bg-success text-white animate-check-in'
                      : state === 'active'
                      ? 'bg-primary-soft text-primary animate-node-pulse'
                      : 'bg-surface-hover text-ink-muted'
                  }`}
                >
                  {state === 'done' ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <CircleDot className="w-2.5 h-2.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-[12px] font-medium transition-colors duration-300 ${state === 'pending' ? 'text-ink-muted' : 'text-ink'}`}>
                    {check.label}
                  </p>
                  <p className="text-[10.5px] text-ink-muted truncate">{check.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 sm:px-5 py-3 bg-surface-hover border-t border-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">system.verify()</span>
          <span className="text-[10px] font-mono text-ink-muted">{complete ? '4/4' : `${step}/4`}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroPanel;
