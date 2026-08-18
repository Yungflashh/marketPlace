import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import {
  Search,
  Package,
  MapPin,
  X,
  ShieldCheck,
  Zap,
  Truck,
  Sparkles,
  ArrowUpDown,
  ArrowRight,
  Grid3x3,
  Smartphone,
  Shirt,
  Sofa,
  Dumbbell,
  BookOpen,
  Gem,
  Car,
  Gamepad2,
  UtensilsCrossed,
  Tag,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Skeleton, EmptyState, Button, Container } from '../components/ui';

const trustPoints = [
  { icon: ShieldCheck, label: 'Verified sellers' },
  { icon: Zap, label: 'Instant wallet checkout' },
  { icon: Truck, label: 'Fast dispatch' },
];

type SortBy = 'newest' | 'price-asc' | 'price-desc';

// Maps a free-text category name to a representative icon — categories come
// from the API with no icon field of their own.
const categoryIconFor = (category: string) => {
  const c = category.toLowerCase();
  if (/(phone|electronic|laptop|computer|tech|gadget)/.test(c)) return Smartphone;
  if (/(fashion|cloth|apparel|wear|shoe)/.test(c)) return Shirt;
  if (/(home|furniture|kitchen|decor)/.test(c)) return Sofa;
  if (/(beauty|cosmetic|skincare)/.test(c)) return Sparkles;
  if (/(sport|fitness|gym)/.test(c)) return Dumbbell;
  if (/(book|stationery)/.test(c)) return BookOpen;
  if (/(jewel|accessor|watch)/.test(c)) return Gem;
  if (/(auto|car|vehicle)/.test(c)) return Car;
  if (/(toy|game|kids)/.test(c)) return Gamepad2;
  if (/(food|grocery|drink)/.test(c)) return UtensilsCrossed;
  return Tag;
};

const initialsOf = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

// Fake purchase notifications — social proof only, not backed by real orders.
const notifications = [
  { name: 'Sarah M.', location: 'New York', amount: 245, product: 'Wireless Headphones' },
  { name: 'James K.', location: 'Los Angeles', amount: 189, product: 'Smart Watch' },
  { name: 'Emily R.', location: 'Chicago', amount: 520, product: 'Laptop Stand' },
  { name: 'Michael B.', location: 'Houston', amount: 350, product: 'Gaming Mouse' },
  { name: 'Jessica L.', location: 'Miami', amount: 120, product: 'Phone Case' },
  { name: 'David W.', location: 'Seattle', amount: 890, product: 'Mechanical Keyboard' },
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const searchRef = useRef<HTMLInputElement>(null);
  const freshRailRef = useRef<HTMLDivElement>(null);
  const freshRailPaused = useRef(false);
  const freshRailResumeTimer = useRef<number | undefined>(undefined);

  // Live-purchase toast — cycles through fake notifications, sliding in/out.
  const [notifIndex, setNotifIndex] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  // "/" focuses search, like most dev-facing tools
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (notifDismissed) return;
    let live = true;
    const timers: number[] = [];
    const runCycle = () => {
      if (!live) return;
      setNotifVisible(true);
      timers.push(
        window.setTimeout(() => {
          if (!live) return;
          setNotifVisible(false);
          timers.push(
            window.setTimeout(() => {
              if (!live) return;
              setNotifIndex((i) => (i + 1) % notifications.length);
              runCycle();
            }, 500)
          );
        }, 4500)
      );
    };
    timers.push(window.setTimeout(runCycle, 1600));
    return () => {
      live = false;
      timers.forEach(clearTimeout);
    };
  }, [notifDismissed]);

  // Gently auto-scrolls the "Fresh picks" rail so the home screen feels alive;
  // pauses on hover/touch so users can still browse manually.
  useEffect(() => {
    const railIsShown = !loading && !selectedCategory && !searchTerm && products.length > 0;
    const el = freshRailRef.current;
    if (!railIsShown || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf: number;
    const step = () => {
      if (!freshRailPaused.current) {
        const max = el.scrollWidth - el.clientWidth;
        el.scrollLeft = max <= 0 ? 0 : el.scrollLeft >= max - 1 ? 0 : el.scrollLeft + 0.6;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loading, selectedCategory, searchTerm, products.length]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching Logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  const dismissNotification = (): void => {
    setNotifVisible(false);
    setNotifDismissed(true);
  };

  const sortedProducts = useMemo(() => {
    if (sortBy === 'newest') return products;
    const list = [...products];
    list.sort((a, b) => (sortBy === 'price-asc' ? a.price - b.price : b.price - a.price));
    return list;
  }, [products, sortBy]);

  const showBrowseSections = !loading && !selectedCategory && !searchTerm && products.length > 0;
  const notification = notifications[notifIndex];

  return (
    <div className="min-h-screen bg-canvas bg-spotlight relative overflow-hidden">
      {/* Decorative ambient glows + technical grid */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-grid" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gold/[0.08] blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-[28rem] -left-32 w-[320px] h-[320px] rounded-full bg-gold/[0.05] blur-3xl animate-drift" />

      {/* Live purchase toast — desktop only, bottom-right, self-dismissing */}
      {!notifDismissed && notification && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-30 w-[300px]">
          <div
            className={cn(
              'transition-all duration-500 ease-out',
              notifVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'
            )}
          >
            <div className="relative bg-elevated border border-hairline-strong rounded-xl p-3.5 pr-8 shadow-2xl shadow-black/40 flex items-start gap-3">
              <button
                onClick={dismissNotification}
                aria-label="Dismiss notification"
                className="absolute top-2.5 right-2.5 text-ink-faint hover:text-ink transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gold-soft text-gold flex items-center justify-center text-[11px] font-bold select-none">
                  {initialsOf(notification.name)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success border-2 border-elevated" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink leading-snug">
                  <span className="font-semibold">{notification.name}</span> just bought{' '}
                  <span className="font-medium">{notification.product}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10.5px] text-ink-faint">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{notification.location}</span>
                  <span className="text-hairline-strong">·</span>
                  <span className="text-gold font-semibold shrink-0">${notification.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <Container className="pt-12 sm:pt-20 pb-8 relative">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12 lg:items-start">
        <div>
        <div className="max-w-xl">
          <p
            className="inline-flex items-center gap-2 text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-gold mb-3 animate-rise-in"
            style={{ animationFillMode: 'backwards' }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
            </span>
            [ the catalog ]
          </p>
          <h1
            className="font-display text-[34px] sm:text-[44px] font-medium text-ink tracking-tight leading-[1.05] animate-rise-in"
            style={{ animationDelay: '70ms', animationFillMode: 'backwards' }}
          >
            Discover your next{' '}
            <span className="bg-gradient-to-r from-gold via-gold-strong to-gold bg-clip-text text-transparent text-glow-gold">
              favorite thing
            </span>
          </h1>
          <p
            className="text-ink-faint mt-4 text-[15px] leading-relaxed animate-rise-in"
            style={{ animationDelay: '140ms', animationFillMode: 'backwards' }}
          >
            Curated products at honest prices — pay instantly from your ShopLogs wallet.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-lg animate-rise-in"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          <div className="relative group">
            <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-gold" />
            <input
              ref={searchRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products, brands, or categories…"
              className="w-full h-12 rounded-md border border-hairline-strong bg-surface pl-11 pr-11 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-all duration-200 focus:border-gold focus:ring-4 focus:ring-gold/15 focus:shadow-lg focus:shadow-gold/5"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-hairline-strong bg-canvas-raised text-ink-faint font-mono text-[11px] group-focus-within:opacity-0 transition-opacity">
                /
              </kbd>
            )}
          </div>
        </form>

        {/* Trust cards */}
        <div
          className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 max-w-lg animate-rise-in"
          style={{ animationDelay: '260ms', animationFillMode: 'backwards' }}
        >
          {trustPoints.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-hairline bg-surface px-3 py-3 flex flex-col items-start gap-2"
            >
              <span className="w-8 h-8 rounded-lg bg-gold-soft flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </span>
              <span className="text-[11px] sm:text-[11.5px] font-medium text-ink-muted leading-tight">{label}</span>
            </div>
          ))}
        </div>
        </div>

        {/* Live snapshot panel — balances the wide empty gap next to the hero text on large screens */}
        <div className="hidden lg:flex flex-col gap-4 animate-rise-in" style={{ animationDelay: '260ms', animationFillMode: 'backwards' }}>
          <div className="relative overflow-hidden rounded-2xl border border-hairline-strong bg-surface p-6">
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl animate-drift" />
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint mb-5">[ live snapshot ]</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 text-sm text-ink-muted">
                  <Package className="w-4 h-4 text-gold" /> Listings live
                </span>
                <span className="font-mono text-lg font-semibold text-ink">{loading ? '—' : products.length}</span>
              </div>
              <div className="h-px bg-hairline" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 text-sm text-ink-muted">
                  <Grid3x3 className="w-4 h-4 text-gold" /> Categories
                </span>
                <span className="font-mono text-lg font-semibold text-ink">{categories.length || '—'}</span>
              </div>
              <div className="h-px bg-hairline" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 text-sm text-ink-muted">
                  <ShieldCheck className="w-4 h-4 text-gold" /> Seller checks
                </span>
                <span className="font-mono text-lg font-semibold text-ink">100%</span>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-ink-faint leading-relaxed px-1">
            Every listing is reviewed before it goes live — browse with confidence.
          </p>
        </div>
        </div>

        {/* Category tiles */}
        {categories.length > 0 && (
          <div
            className="mt-8 animate-fade-in"
            style={{ animationDelay: '320ms', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Grid3x3 className="w-4 h-4 text-ink-faint" />
              <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide">Browse categories</h2>
            </div>
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto snap-x pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedCategory('')}
                className="group shrink-0 w-[76px] flex flex-col items-center gap-2 snap-start"
              >
                <span
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-150',
                    selectedCategory === ''
                      ? 'bg-gold text-canvas border-gold shadow-[0_0_16px_-4px_var(--color-gold)]'
                      : 'bg-surface text-ink-muted border-hairline-strong group-hover:border-ink-faint group-hover:text-ink'
                  )}
                >
                  <Grid3x3 className="w-5 h-5" />
                </span>
                <span className={cn('text-[11px] font-medium text-center leading-tight', selectedCategory === '' ? 'text-gold' : 'text-ink-faint')}>
                  All
                </span>
              </button>
              {categories.map((category) => {
                const Icon = categoryIconFor(category);
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="group shrink-0 w-[76px] flex flex-col items-center gap-2 snap-start"
                  >
                    <span
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-150',
                        active
                          ? 'bg-gold text-canvas border-gold shadow-[0_0_16px_-4px_var(--color-gold)]'
                          : 'bg-surface text-ink-muted border-hairline-strong group-hover:border-ink-faint group-hover:text-ink'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className={cn('text-[11px] font-medium text-center leading-tight capitalize line-clamp-2', active ? 'text-gold' : 'text-ink-faint')}>
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Container>

      {/* Promo strip */}
      <Container className="pb-10 relative">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-hairline-strong bg-gradient-to-br from-gold-soft/70 via-surface to-surface p-5 sm:p-6">
            <WalletIcon className="w-20 h-20 text-gold/10 absolute -right-3 -bottom-4 animate-float" />
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-gold mb-2">
              <Zap className="w-3 h-3" /> Instant checkout
            </p>
            <h3 className="font-display text-lg font-medium text-ink mb-1">Fund your wallet</h3>
            <p className="text-[13px] text-ink-faint max-w-[230px] leading-relaxed">
              Top up once, then check out in a single tap — no card required.
            </p>
            <Link
              to={isAuthenticated ? '/wallet' : '/login'}
              className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-gold hover:gap-2.5 transition-all duration-150"
            >
              Go to wallet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <ShieldCheck className="w-20 h-20 text-ink-faint/[0.06] absolute -right-3 -bottom-4 animate-float-slow" />
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint mb-2">
              <ShieldCheck className="w-3 h-3 text-gold" /> Buyer protection
            </p>
            <h3 className="font-display text-lg font-medium text-ink mb-1">Every seller verified</h3>
            <p className="text-[13px] text-ink-faint max-w-[240px] leading-relaxed">
              Manual checks and wallet escrow keep every order safe, start to finish.
            </p>
          </div>
        </div>
      </Container>

      {/* Featured rail — only on the unfiltered view */}
      {showBrowseSections && (
        <Container className="pb-2 relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gold" />
            <h2 className="text-[15px] font-semibold text-ink">Fresh picks</h2>
          </div>
          <div
            ref={freshRailRef}
            onMouseEnter={() => (freshRailPaused.current = true)}
            onMouseLeave={() => (freshRailPaused.current = false)}
            onTouchStart={() => {
              freshRailPaused.current = true;
              window.clearTimeout(freshRailResumeTimer.current);
            }}
            onTouchEnd={() => {
              freshRailResumeTimer.current = window.setTimeout(() => {
                freshRailPaused.current = false;
              }, 1500);
            }}
            className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.slice(0, 8).map((product) => (
              <div key={product._id} className="shrink-0 w-[46vw] sm:w-[200px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* Main grid */}
      <Container className="pt-8 pb-16 relative">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-4 h-4 text-ink-faint shrink-0" />
            <h2 className="text-[15px] font-semibold text-ink truncate">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} products` : 'All products'}
            </h2>
            {!loading && products.length > 0 && (
              <span className="font-mono text-xs text-ink-faint shrink-0">
                [ {String(products.length).padStart(3, '0')} ]
              </span>
            )}
          </div>

          {!loading && products.length > 1 && (
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                aria-label="Sort products"
                className="h-9 rounded-lg border border-hairline-strong bg-surface pl-3 pr-8 text-[12.5px] font-medium text-ink-muted outline-none appearance-none transition-colors focus:border-gold cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-ink-faint absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-hairline overflow-hidden">
                <Skeleton className="aspect-square rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-surface animate-fade-in">
            <EmptyState
              icon={<Package />}
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                (searchTerm || selectedCategory) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {sortedProducts.map((product, index) => (
              <div
                key={product._id}
                className="animate-rise-in"
                style={{ animationDelay: `${Math.min(index, 11) * 40}ms`, animationFillMode: 'backwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Home;
