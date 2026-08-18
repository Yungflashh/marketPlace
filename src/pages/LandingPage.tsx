import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  X as XIcon,
  ChevronDown,
  Globe,
  Wallet as WalletIcon,
  Lock,
  Coins,
  Zap,
} from 'lucide-react';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import HeroPanel from '../components/landing/HeroPanel';
import ProcessTimeline from '../components/landing/ProcessTimeline';
import ProductPreview from '../components/landing/ProductPreview';
import SectionPattern from '../components/landing/SectionPattern';
import { useReveal } from '../hooks/useReveal';

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up in under a minute. No credit card required — just an email and password.' },
  { n: '02', title: 'Fund your wallet', desc: "Top up using USDT, BTC, or Ethereum. Your balance is ready to spend the moment it's confirmed." },
  { n: '03', title: 'Pick your log & checkout', desc: 'Browse bank logs, PayPal logs, and more by country, balance, and type — then checkout instantly.' },
];

const OLD_WAY = [
  'Hunting random forums and Telegram groups',
  'No verification before you pay',
  'Slow, inconsistent delivery',
  'Payment methods with zero recourse',
];

const NEW_WAY = [
  'Every log screened before it lists',
  'Balance and freshness checked, not guessed',
  'Delivered the instant your wallet clears',
  'Pay with crypto — stay in control',
];

const SystemLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`inline-flex items-center gap-2 text-[11px] font-semibold text-primary uppercase tracking-[0.14em] font-mono mb-4 ${className}`}>
    <span className="w-1.5 h-1.5 bg-primary rounded-[2px]" />
    {children}
  </p>
);

const LiveDot: React.FC = () => (
  <span className="relative flex h-1.5 w-1.5">
    <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
  </span>
);

const LandingPage: React.FC = () => {
  const diffRef = useReveal<HTMLDivElement>();
  const previewRef = useReveal<HTMLDivElement>();
  const featuresRef = useReveal<HTMLDivElement>();
  const trustRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="bg-canvas">
      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden">
        <SectionPattern variant="a" speed={48} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-10 items-center">
            <div className="text-center lg:text-left">
              <span className="animate-fade-up animate-badge-glow inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-[11.5px] font-semibold font-mono mb-7">
                <LiveDot />
                STATUS: MARKETPLACE ONLINE
              </span>

              <h1 className="animate-fade-up [animation-delay:80ms] font-display text-ink leading-[1.04] tracking-tight text-[38px] min-[480px]:text-[44px] sm:text-[56px] lg:text-[58px] font-extrabold">
                Every log,
                <br />
                <span className="text-gradient-shimmer">verified before it's yours.</span>
              </h1>

              <p className="animate-fade-up [animation-delay:160ms] mt-6 text-ink-muted text-[14.5px] sm:text-[16px] leading-relaxed max-w-lg mx-auto lg:mx-0">
                ShopLogs screens every bank log, PayPal log, and crypto account before it's listed —
                then delivers it the instant your wallet clears. No dead accounts. No guesswork.
              </p>

              <div className="animate-fade-up [animation-delay:240ms] mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link to="/store">
                  <Button size="lg" className="hover:scale-[1.03] active:scale-[0.98]">Browse the store</Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="ghost" className="hover:scale-[1.03] active:scale-[0.98]">
                    Create free account <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="animate-fade-up [animation-delay:320ms] mt-10 flex flex-col sm:flex-row sm:flex-wrap items-center lg:items-start justify-center lg:justify-start gap-x-6 gap-y-2.5">
                {['Screened before listing', 'Instant wallet delivery', 'Crypto-only checkout'].map((fact) => (
                  <div key={fact} className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:200ms]">
              <HeroPanel />
            </div>
          </div>
        </div>

        <div className="hidden sm:flex justify-center pb-8">
          <div className="flex flex-col items-center gap-1.5 text-ink-muted/60 animate-fade-in [animation-delay:800ms]">
            <ChevronDown className="w-4 h-4" />
            <span className="text-[9.5px] font-mono tracking-widest uppercase">Scroll</span>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM -> SOLUTION ============ */}
      <section className="relative isolate py-20 sm:py-28 border-t border-border">
        <SectionPattern variant="a" speed={30} />
        <div ref={diffRef} className="reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center mb-14">
            <SystemLabel className="justify-center">The difference</SystemLabel>
            <h2 className="font-display text-[26px] sm:text-[34px] font-bold text-ink tracking-tight leading-snug">
              Buying logs shouldn't feel like a gamble.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-center">
            <div className="animate-card-float bg-surface-hover/60 border border-border rounded-[var(--radius-xl)] p-6 sm:p-7 opacity-80">
              <p className="text-[10.5px] font-mono font-semibold text-ink-muted uppercase tracking-widest mb-5">The old way</p>
              <div className="space-y-3.5">
                {OLD_WAY.map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <XIcon className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                    <p className="text-[13px] text-ink-muted leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:px-6">
              <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent to-border" />
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 rotate-90 md:rotate-0">
                <ArrowRight className="w-4 h-4 md:hidden" />
                <ArrowDown className="w-4 h-4 hidden md:block" />
              </div>
              <div className="hidden md:block w-px h-10 bg-gradient-to-t from-transparent to-border" />
            </div>

            <div
              className="animate-card-float relative bg-surface border border-primary/30 rounded-[var(--radius-xl)] p-6 sm:p-7 shadow-[var(--shadow-vault-md)]"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Logo size={16} />
                <p className="text-[10.5px] font-mono font-semibold text-primary uppercase tracking-widest">The ShopLogs way</p>
              </div>
              <div className="space-y-3.5">
                {NEW_WAY.map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <p className="text-[13px] text-ink-soft leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative isolate py-20 sm:py-28 bg-surface-hover/50 border-t border-border">
        <SectionPattern variant="b" speed={26} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SystemLabel className="justify-center">How it works</SystemLabel>
            <h2 className="font-display text-[26px] sm:text-[34px] font-bold text-ink tracking-tight">
              From sign-up to delivery in minutes.
            </h2>
          </div>

          <ProcessTimeline steps={steps} />
        </div>
      </section>

      {/* ============ PRODUCT EXPERIENCE ============ */}
      <section className="relative isolate py-20 sm:py-28 border-t border-border">
        <SectionPattern variant="a" speed={38} />
        <div ref={previewRef} className="reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <SystemLabel className="justify-center lg:justify-start">Inside the vault</SystemLabel>
              <h2 className="font-display text-[26px] sm:text-[34px] font-bold text-ink tracking-tight leading-snug mb-5">
                See what you'll actually use.
              </h2>
              <p className="text-ink-muted text-[14px] leading-relaxed max-w-md mx-auto lg:mx-0 mb-6">
                No surprises. Browse verified logs, fund your wallet with crypto, and track every order —
                the same panels you'll land in the moment you sign up.
              </p>
              <Link to="/store" className="inline-block">
                <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>Explore the store</Button>
              </Link>
            </div>

            <ProductPreview />
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative isolate py-20 sm:py-28 bg-surface-hover/50 border-t border-border">
        <SectionPattern variant="b" speed={22} />
        <div ref={featuresRef} className="reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <SystemLabel>Capabilities</SystemLabel>
            <h2 className="font-display text-[26px] sm:text-[34px] font-bold text-ink tracking-tight leading-snug">
              Built around one job: verified delivery.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-surface border border-border rounded-[var(--radius-xl)] p-7 sm:p-9">
              <div className="w-11 h-11 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-ink text-[19px] mb-3">The verification engine</h3>
              <p className="text-[13.5px] text-ink-muted leading-relaxed mb-6 max-w-md">
                Every log runs through the same four-step check before it's ever listed for sale —
                ownership, balance, freshness, and delivery readiness. Nothing ships until it passes.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Ownership', 'Balance', 'Freshness', 'Delivery'].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-ink-soft bg-surface-hover border border-border px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-rows-2 gap-4">
              <div className="animate-card-float bg-surface border border-border rounded-[var(--radius-xl)] p-6 flex items-start gap-4" style={{ animationDelay: '0.2s' }}>
                <div className="w-10 h-10 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-[14px] mb-1">Worldwide coverage</h3>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed">US, UK, CA, AU and more — filter by country, type, and balance.</p>
                </div>
              </div>
              <div className="animate-card-float bg-surface border border-border rounded-[var(--radius-xl)] p-6 flex items-start gap-4" style={{ animationDelay: '1.1s' }}>
                <div className="w-10 h-10 bg-accent-soft rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-[14px] mb-1">Crypto-only anonymity</h3>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed">No card data stored, ever. Fund your wallet and check out with crypto alone.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-card-float bg-surface border border-border rounded-[var(--radius-xl)] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ animationDelay: '2s' }}>
            <div className="w-10 h-10 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
              <WalletIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-ink text-[14px] mb-1">One wallet, every purchase</h3>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">Top up once with BTC, ETH, or USDT — then check out instantly without re-entering payment details.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST & SECURITY ============ */}
      <section className="relative isolate py-20 sm:py-28 border-t border-border">
        <SectionPattern variant="a" speed={44} />
        <div ref={trustRef} className="reveal max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SystemLabel className="justify-center">Security &amp; payments</SystemLabel>
          <h2 className="font-display text-[26px] sm:text-[34px] font-bold text-ink tracking-tight mb-5">
            Pay your way. Stay in control.
          </h2>
          <p className="text-ink-muted text-[14px] leading-relaxed max-w-lg mx-auto mb-10">
            ShopLogs never stores card details. Every purchase is funded from your wallet and settled in crypto,
            so what you buy stays between you and the vault.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)'].map((method) => (
              <span key={method} className="inline-flex items-center gap-2 text-[12.5px] font-medium text-ink-soft bg-surface border border-border px-3.5 py-2 rounded-full">
                <Coins className="w-3.5 h-3.5 text-accent" />
                {method}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Ownership', 'Balance', 'Freshness', 'Delivery'].map((tag) => (
              <span key={tag} className="text-[10.5px] font-mono font-medium text-ink-muted bg-surface-hover border border-border px-2.5 py-1 rounded-full uppercase tracking-wide">
                {tag} · checked
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative isolate py-20 sm:py-28 border-t border-border overflow-hidden">
        <SectionPattern variant="b" />
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: 'radial-gradient(45% 45% at 50% 40%, color-mix(in srgb, var(--vault-primary) 12%, transparent), transparent 70%)' }}
          aria-hidden="true"
        />

        <div ref={ctaRef} className="reveal max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size={34} className="mx-auto mb-6" />
          <h2 className="font-display text-[28px] sm:text-[38px] font-bold text-ink tracking-tight mb-4">
            Your next log is already waiting.
          </h2>
          <p className="text-ink-muted text-[14.5px] leading-relaxed mb-9 max-w-md mx-auto">
            Fund your wallet, browse what's verified, and check out in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link to="/store">
              <Button size="lg" icon={<Zap className="w-4 h-4" />} className="hover:scale-[1.03] active:scale-[0.98]">
                Browse the store
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="hover:scale-[1.03] active:scale-[0.98]">
                Create free account
              </Button>
            </Link>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-ink-muted uppercase tracking-widest">
            <LiveDot />
            Status: marketplace online
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
