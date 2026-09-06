import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductStrip from '../components/ProductStrip';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import {
  Search,
  Grid3x3,
  Package,
  MapPin,
  CheckCircle2,
  User,
  SlidersHorizontal,
  Star,
  Sparkles,
  Zap,
  ShieldCheck,
  Wallet,
  ArrowRight,
  TrendingUp,
  X,
  List as ListIcon,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import SectionPattern from '../components/landing/SectionPattern';
import { useReveal } from '../hooks/useReveal';

const PAGE_LIMIT = 12;
const VIEW_MODE_STORAGE_KEY = 'shoplogs.allLogsViewMode';
type ViewMode = 'grid' | 'list';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [currentNotification, setCurrentNotification] = useState(0);
  const [notifications, setNotifications] = useState<
    { name: string; location: string; amount: number; product: string }[]
  >([]);
  const [showNotification, setShowNotification] = useState(true);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'grid';
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'list' ? 'list' : 'grid';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  // One-shot count-up for the hero stat once real data arrives; later filter/search
  // changes just snap to the new number instantly rather than re-animating.
  const [displayedCount, setDisplayedCount] = useState(0);
  const countAnimated = useRef(false);

  // Sliding highlight pill behind the active category chip.
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const filtersRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm, page]);

  useEffect(() => {
    fetchCategories();
    fetchFeatured();
    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data.data;
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        // silent
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;
    const interval = setInterval(() => {
      setShowNotification(false);
      setTimeout(() => {
        setCurrentNotification((prev) => (prev + 1) % notifications.length);
        setShowNotification(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  useEffect(() => {
    if (totalCount <= 0) return;
    if (!countAnimated.current) {
      countAnimated.current = true;
      const start = performance.now();
      const duration = 900;
      const to = totalCount;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedCount(Math.round(to * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      setDisplayedCount(totalCount);
    }
  }, [totalCount]);

  useLayoutEffect(() => {
    const el = chipRefs.current.get(selectedCategory);
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedCategory, categories]);

  const setChipRef = useCallback(
    (key: string) => (el: HTMLButtonElement | null) => {
      if (el) chipRefs.current.set(key, el);
      else chipRefs.current.delete(key);
    },
    []
  );

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: PAGE_LIMIT };
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.pages);
      setTotalCount(response.data.data.pagination.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.data.categories);
    } catch {
      // silent
    }
  };

  const fetchFeatured = async (): Promise<void> => {
    try {
      const response = await api.get('/products/featured');
      setFeaturedProducts(response.data.data.products || []);
    } catch {
      // silent
    }
  };

  const fetchNewArrivals = async (): Promise<void> => {
    try {
      const response = await api.get('/products/new-arrivals');
      setNewArrivals(response.data.data.products || []);
    } catch {
      // silent
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    setSearchTerm(inputValue);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setInputValue('');
    setSelectedCategory('');
  };

  const trustPoints = [
    { icon: <Zap className="w-4 h-4" />, label: 'Instant delivery' },
    { icon: <ShieldCheck className="w-4 h-4" />, label: 'Verified logs' },
    { icon: <Wallet className="w-4 h-4" />, label: 'Wallet checkout' },
  ];

  return (
    <div className="bg-canvas">
      {/* Live purchase notification — compact top toast on mobile (out of the thumb
          zone and off the bottom tab bar), the fuller corner card on desktop. */}
      {notifications.length > 0 && !notificationDismissed && (
        <>
          <div
            className="sm:hidden fixed top-16 inset-x-3 z-30"
            style={{
              opacity: showNotification ? 1 : 0,
              transform: showNotification ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <div className="flex items-center gap-2.5 bg-elevated/95 backdrop-blur-md border border-border rounded-full shadow-[var(--shadow-vault-md)] pl-2 pr-2.5 py-2">
              <div className="relative shrink-0">
                <div className="bg-primary-soft text-primary rounded-full p-1.5">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success ring-2 ring-elevated" />
              </div>
              <p className="flex-1 min-w-0 text-[11.5px] text-ink-soft truncate">
                <span className="font-semibold text-ink">{notifications[currentNotification].name}</span> bought{' '}
                {notifications[currentNotification].product}
              </p>
              <span className="text-[12px] font-bold text-success shrink-0 tabular-nums">
                ${notifications[currentNotification].amount}
              </span>
              <button
                onClick={() => setNotificationDismissed(true)}
                aria-label="Dismiss notification"
                className="shrink-0 -mr-1 p-1 rounded-full text-ink-muted hover:bg-surface-hover transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div
            className="hidden sm:block fixed bottom-6 left-6 z-30 max-w-xs"
            style={{
              opacity: showNotification ? 1 : 0,
              transform: showNotification ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <div className="group bg-elevated/95 backdrop-blur-md rounded-[var(--radius-lg)] shadow-[var(--shadow-vault-lg)] border border-border overflow-hidden ring-1 ring-black/[0.02]">
              <button
                onClick={() => setNotificationDismissed(true)}
                aria-label="Dismiss notification"
                className="absolute top-2 right-2 z-10 p-1 rounded-full text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="animate-badge-glow bg-primary-soft text-primary rounded-full p-2">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success ring-2 ring-elevated" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {notifications[currentNotification].name}
                    </p>
                    <p className="text-[11.5px] text-ink-muted truncate">
                      purchased{' '}
                      <span className="font-medium text-ink-soft">
                        {notifications[currentNotification].product}
                      </span>
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-success shrink-0 tabular-nums">
                    ${notifications[currentNotification].amount}
                  </p>
                </div>
              </div>
              <div className="bg-surface-hover px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10.5px] text-ink-muted">
                  <MapPin className="w-3 h-3" />
                  <span>{notifications[currentNotification].location}</span>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] text-success font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 60% at 15% 15%, color-mix(in srgb, var(--vault-primary) 18%, transparent), transparent 70%), radial-gradient(50% 55% at 85% 0%, color-mix(in srgb, var(--vault-accent) 16%, transparent), transparent 70%)',
          }}
        />
        {/* Fine grid texture */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in srgb, var(--vault-border) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--vault-border) 60%, transparent) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(80% 60% at 50% 20%, black, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(80% 60% at 50% 20%, black, transparent 90%)',
          }}
        />
        <SectionPattern variant="a" speed={36} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <span className="animate-fade-up animate-badge-glow inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-[11.5px] font-semibold mb-6 ring-1 ring-primary/10">
            <Sparkles className="w-3.5 h-3.5" />
            Wallet-funded checkout, delivered instantly
          </span>

          <h1 className="text-pattern-safe animate-fade-up [animation-delay:80ms] font-display text-ink leading-[1.02] tracking-tight text-[38px] min-[400px]:text-[46px] sm:text-6xl lg:text-[80px] font-extrabold">
            Find your logs
            <br className="hidden sm:block" />{' '}
            <span className="relative inline-block text-primary">
              here.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8C40 3 80 3 118 6C150 8.5 178 7 198 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary/40"
                />
              </svg>
            </span>
          </h1>

          <p className="text-pattern-safe animate-fade-up [animation-delay:160ms] mt-6 text-ink-muted text-[14px] sm:text-[16.5px] leading-relaxed max-w-md mx-auto">
            Thousands of verified logs, delivered fast. Pay straight from your wallet — no card required.
          </p>

          <form onSubmit={handleSearch} className="animate-fade-up [animation-delay:240ms] mt-8 w-full max-w-lg mx-auto">
            <div className="flex items-center gap-2 rounded-full bg-elevated border border-border shadow-[var(--shadow-vault-md)] pl-5 pr-1.5 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-[var(--shadow-vault-lg)] transition-all">
              <Search className="w-4 h-4 text-ink-muted shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for any log..."
                className="flex-1 bg-transparent text-[13.5px] sm:text-[14.5px] text-ink placeholder:text-ink-muted outline-none py-2"
              />
              <button
                type="submit"
                className="h-9 px-5 rounded-full bg-primary text-on-primary text-[13px] font-semibold hover:bg-primary-hover active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
              >
                Search
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Trust row */}
          <div className="animate-fade-up [animation-delay:300ms] mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {trustPoints.map((t) => (
              <div key={t.label} className="text-pattern-safe flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
                <span className="text-primary">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>

          <div className="animate-fade-up [animation-delay:360ms] mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse logs
            </Button>
            <Link to="/register">
              <Button variant="ghost">Create account</Button>
            </Link>
          </div>

          {/* Stat cards */}
          <div className="animate-fade-up [animation-delay:440ms] mt-12 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { value: `${displayedCount || '—'}+`, label: 'Logs', mono: true },
              { value: `${categories.length || '—'}+`, label: 'Categories', mono: true },
              { value: '4.8', label: 'Avg rating', mono: false },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius-lg)] bg-elevated/70 backdrop-blur-sm border border-border px-3 py-4 shadow-[var(--shadow-vault-sm)]"
              >
                <p className={`font-display text-2xl font-bold text-ink ${s.mono ? 'tabular-nums' : ''}`}>
                  {s.value}
                </p>
                <p className="text-[11.5px] text-ink-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products-section" className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Grid3x3 className="w-4 h-4 text-primary" />
                <h2 className="font-display text-[16px] font-bold text-ink">Browse by category</h2>
              </div>
              <div className="relative flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <div
                  className="absolute top-0 h-9 rounded-full bg-primary transition-all duration-300 ease-out shadow-[var(--shadow-vault-sm)]"
                  style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
                  aria-hidden="true"
                />
                <button
                  ref={setChipRef('')}
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`relative z-10 shrink-0 px-4 h-9 rounded-full text-[13px] font-medium border transition-colors duration-200 ${
                    selectedCategory === '' ? 'text-on-primary border-transparent' : 'text-ink-soft bg-surface border-border hover:border-border-strong'
                  }`}
                >
                  All logs
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    ref={setChipRef(cat)}
                    onClick={() => { setSelectedCategory(cat); setPage(1); document.getElementById('all-logs')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className={`relative z-10 shrink-0 px-4 h-9 rounded-full text-[13px] font-medium capitalize border transition-colors duration-200 ${
                      selectedCategory === cat ? 'text-on-primary border-transparent' : 'text-ink-soft bg-surface border-border hover:border-border-strong'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {featuredProducts.length > 0 && (
            <ProductStrip
              title="Featured logs"
              badge="Featured"
              products={featuredProducts}
              icon={<Star className="w-4 h-4 fill-current" />}
            />
          )}

          {newArrivals.length > 0 && (
            <ProductStrip
              title="New arrivals"
              badge="New"
              products={newArrivals}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          )}

          {(featuredProducts.length > 0 || newArrivals.length > 0) && (
            <div className="relative my-10">
              <div className="border-t border-border" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-canvas px-4 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                  All logs
                </span>
              </div>
            </div>
          )}

          <div ref={filtersRef} className="reveal flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <div className="relative flex-1 max-w-xs">
              <SlidersHorizontal className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="!rounded-full !pl-10"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink px-4 py-2.5 rounded-full border border-border hover:border-border-strong transition-colors shrink-0 w-fit"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>

          <div id="all-logs" className="flex items-center justify-between mb-6 scroll-mt-20 gap-3">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h2 className="font-display text-[19px] font-bold text-ink truncate">
                {selectedCategory
                  ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  : searchTerm
                  ? `Results for "${searchTerm}"`
                  : 'All logs'}
              </h2>
              {!loading && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-surface border border-border text-[11.5px] font-mono text-ink-muted tabular-nums shrink-0">
                  {totalCount} result{totalCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div
              role="group"
              aria-label="Change layout"
              className="flex items-center gap-0.5 bg-surface border border-border rounded-full p-0.5 shrink-0"
            >
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            viewMode === 'list' ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                  <div key={i} className="border border-border rounded-[var(--radius-lg)] p-3 flex items-center gap-3 sm:gap-4">
                    <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 rounded-[var(--radius-md)] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="shrink-0 space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                  <div key={i} className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-6 h-6" />}
              title="No logs found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                (searchTerm || selectedCategory) && (
                  <Button onClick={clearFilters}>Clear filters</Button>
                )
              }
              className="bg-surface border border-border rounded-[var(--radius-xl)]"
            />
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {products.map((product, i) => (
                    <div key={product._id} className="stagger-item" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <ProductCard product={product} variant="list" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product, i) => (
                    <div key={product._id} className="stagger-item" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}

              <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-10" />
            </>
          )}
        </div>
      </section>

      {/* Trust / CTA band */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, var(--vault-primary) 12%, transparent), transparent 70%)',
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h2 className="font-display text-ink text-[26px] sm:text-4xl font-extrabold tracking-tight">
            Fund once. Buy in seconds.
          </h2>
          <p className="mt-4 text-ink-muted text-[14px] sm:text-[15.5px] max-w-md mx-auto leading-relaxed">
            Top up your wallet and every checkout after is a single tap. No cards, no waiting, no re-entering details.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse logs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;