import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Timer,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  BadgeDollarSign,
  Globe,
} from 'lucide-react';
import Logo from '../components/Logo';

const HERO_BG =
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1280&q=85';

const features = [
  {
    icon: BadgeDollarSign,
    title: 'Premium Bank Logs',
    desc: 'Access high-balance bank logs from top institutions — Chase, Wells Fargo, Bank of America, and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified & Fresh',
    desc: 'Every log is checked and verified before listing. No dead logs — only active, working accounts.',
  },
  {
    icon: Timer,
    title: 'Instant Delivery',
    desc: 'Order confirmed, log delivered immediately. No waiting, no back-and-forth — straight to your account.',
  },
  {
    icon: Globe,
    title: 'Worldwide Coverage',
    desc: 'US, UK, CA, AU and more. Bank logs, PayPal logs, crypto accounts — all in one place.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your account',
    desc: 'Sign up in under a minute. No credit card required — just an email and password.',
  },
  {
    n: '02',
    title: 'Fund your wallet',
    desc: 'Top up using USDT, BTC, or Ethereum. Your balance is ready to spend the moment it\'s confirmed.',
  },
  {
    n: '03',
    title: 'Pick your log & checkout',
    desc: 'Browse bank logs, PayPal logs, and more by country, balance, and type — then checkout instantly.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[100svh] flex flex-col overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        {/* Dark overlay — ensures text is always readable */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4 py-24 sm:py-32">

          {/* Eyebrow badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3.5 py-1.5 rounded-full ring-1 ring-white/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Now live — ShopLogs Marketplace
          </div>

          {/* Headline */}
          <h1 className="text-white font-normal leading-[1.05] tracking-tight text-[44px] min-[480px]:text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] max-w-4xl">
            <span className="animate-fade-up block">Shop Smart.</span>
            <span className="animate-fade-up [animation-delay:100ms] block">Pay Instantly.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up [animation-delay:220ms] mt-6 text-white/75 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
            ShopLogs is a curated marketplace for premium bank logs, PayPal logs,
            and financial accounts — verified, fresh, and delivered the moment you checkout.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up [animation-delay:340ms] mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/store">
              <button className="bg-white text-gray-900 text-sm font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                Browse the Store
              </button>
            </Link>
            <Link to="/register">
              <button className="text-white text-sm font-medium px-7 py-3 rounded-full ring-1 ring-white/40 hover:bg-white/10 transition-colors">
                Create Free Account
                <ChevronRight className="inline w-4 h-4 -mt-0.5 ml-1" />
              </button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up [animation-delay:460ms] mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} ring-2 ring-white/30 flex items-center justify-center`}>
                  <span className="text-white text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/60 text-xs mt-0.5">Trusted by 2,000+ shoppers</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-1.5 text-white/40">
            <div className="w-px h-8 bg-white/20" />
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
            {[
              { value: '1,000+', label: 'Logs in stock' },
              { value: 'US · UK · CA · AU', label: 'Countries covered' },
              { value: '4.8★',   label: 'Avg rating' },
              { value: 'BTC · ETH · USDT', label: 'Crypto accepted' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / What is ShopLogs ─────────────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">What is ShopLogs</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-snug tracking-tight">
              The go-to marketplace for bank logs and financial accounts
            </h2>
            <p className="mt-4 text-gray-500 text-base leading-relaxed">
              ShopLogs stocks verified bank logs, PayPal accounts, crypto wallets, and more —
              all sourced fresh and ready to use. Fund your wallet with crypto, pick what you need, and get it instantly.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gray-100" />

            {steps.map((step) => (
              <div key={step.n} className="relative text-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold tracking-wider mx-auto mb-5 relative z-10">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose ShopLogs ──────────────────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Why ShopLogs</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-snug mb-6">
                Fresh logs. Verified accounts. Instant access.
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Every log on ShopLogs is screened before it goes live. No dead links, no recycled accounts.
                We carry bank logs from major US, UK, Canadian, and Australian banks — plus PayPal, Cash App, and crypto accounts.
                Pay with crypto, stay anonymous, and get your order the second it's placed.
              </p>
              <div className="space-y-3">
                {[
                  'Bank logs: Chase, Wells Fargo, BoA, Barclays & more',
                  'PayPal logs, Cash App, Venmo, and crypto accounts',
                  'High-balance accounts filtered by country & amount',
                  'Crypto-only payments — fully anonymous checkout',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-sm text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Logo size={20} className="text-gray-900" />
                <span className="font-semibold text-gray-900">ShopLogs</span>
                <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">● Live</span>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Wallet Balance', value: '$2,500.00', sub: 'Available to spend' },
                  { label: 'Last Log', value: 'Chase Business — $48,200 bal', sub: 'Delivered instantly' },
                  { label: 'Coverage', value: 'US · UK · CA · AU', sub: 'Bank logs available' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                ))}
              </div>

              <Link to="/store">
                <button className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  Browse the Store
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Customer Reviews</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              Trusted by buyers worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Marcus T.',
                location: 'United States',
                rating: 5,
                text: 'Ordered a Chase log, got it the second I checked out. Balance was exactly as listed — fresh and working. Will definitely be back.',
                tag: 'Bank Logs',
              },
              {
                name: 'Jamie K.',
                location: 'United Kingdom',
                rating: 5,
                text: 'Best shop I\'ve used. Everything is verified before it goes live. No dead logs, no wasted money. The crypto checkout makes it super clean.',
                tag: 'PayPal Logs',
              },
              {
                name: 'D. Okonkwo',
                location: 'Canada',
                rating: 5,
                text: 'Found a Barclays log with a solid balance, paid with USDT and got it instantly. Smooth process, zero issues. 10/10.',
                tag: 'Bank Logs',
              },
              {
                name: 'Reece M.',
                location: 'Australia',
                rating: 5,
                text: 'The wallet system is smart — top up once and shop multiple times without re-entering anything. Really clean UX.',
                tag: 'Wallet',
              },
              {
                name: 'T. Williams',
                location: 'United States',
                rating: 5,
                text: 'Had a question about an order and support sorted it out fast. Great selection of US bank logs and always fresh stock.',
                tag: 'Bank Logs',
              },
              {
                name: 'Kwame A.',
                location: 'United Kingdom',
                rating: 5,
                text: 'Legit and reliable. Ordered three times now — every log has been live and ready to go. Consistent quality every time.',
                tag: 'PayPal Logs',
              },
            ].map((review) => (
              <div key={review.name} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.location}</p>
                  </div>
                  <span className="text-[11px] font-medium bg-gray-900 text-white px-2.5 py-1 rounded-full">
                    {review.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-20 sm:py-28 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo size={32} className="text-white/30 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Ready to browse the store?
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Hundreds of fresh bank logs, PayPal accounts, and more — all verified and ready.
            Top up with crypto and start shopping in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/store">
              <button className="bg-white text-gray-900 text-sm font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition-colors">
                Browse the Store
              </button>
            </Link>
            <Link to="/register">
              <button className="text-white/80 text-sm font-medium px-7 py-3 rounded-full ring-1 ring-white/20 hover:bg-white/10 transition-colors">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
