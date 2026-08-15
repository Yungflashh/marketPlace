import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { Search, Package, Bell, MapPin, X, ShieldCheck, Zap, Truck } from 'lucide-react';
import { Skeleton, EmptyState, Button, Container } from '../components/ui';

const trustPoints = [
  { icon: ShieldCheck, label: 'Verified sellers' },
  { icon: Zap, label: 'Instant wallet checkout' },
  { icon: Truck, label: 'Fast dispatch' },
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fake purchase notifications
  const notifications = [
    { name: "Sarah M.", location: "New York", amount: 245, product: "Wireless Headphones", tx: "TX-4471" },
    { name: "James K.", location: "Los Angeles", amount: 189, product: "Smart Watch", tx: "TX-8834" },
    { name: "Emily R.", location: "Chicago", amount: 520, product: "Laptop Stand", tx: "TX-2290" },
    { name: "Michael B.", location: "Houston", amount: 350, product: "Gaming Mouse", tx: "TX-6612" },
    { name: "Jessica L.", location: "Miami", amount: 120, product: "Phone Case", tx: "TX-8841" },
    { name: "David W.", location: "Seattle", amount: 890, product: "Mechanical Keyboard", tx: "TX-1027" },
    { name: "Ashley P.", location: "Boston", amount: 275, product: "Fitness Tracker", tx: "TX-3358" },
    { name: "Chris T.", location: "Denver", amount: 445, product: "Bluetooth Speaker", tx: "TX-9903" },
  ];

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

  // Rotate notifications every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const notification = notifications[currentNotification];

  return (
    <div className="min-h-screen bg-canvas bg-spotlight relative overflow-hidden">
      {/* Decorative ambient glows + technical grid */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-grid" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gold/[0.08] blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-[28rem] -left-32 w-[320px] h-[320px] rounded-full bg-gold/[0.05] blur-3xl animate-drift" />

      {/* Live Purchase Notification */}
      {notification && (
        <div key={currentNotification} className="hidden xl:block fixed bottom-6 left-6 z-30 w-72 animate-rise-in">
          <div className="bg-elevated border border-hairline-strong rounded-lg p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="bg-success-soft rounded-md p-1.5 shrink-0">
                <Bell className="w-3.5 h-3.5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-ink truncate">{notification.name}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-success-soft text-success px-1.5 py-0.5 rounded font-mono uppercase tracking-wide shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                    </span>
                    Live
                  </span>
                </div>
                <p className="text-xs text-ink-faint mb-1.5 truncate">{notification.product}</p>
                <div className="flex items-center gap-2.5 text-[11px] font-mono text-ink-faint">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {notification.location}
                  </span>
                  <span className="text-hairline-strong">·</span>
                  <span className="font-semibold text-gold">${notification.amount.toFixed(2)}</span>
                  <span className="text-hairline-strong">·</span>
                  <span>{notification.tx}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Container className="pt-12 sm:pt-20 pb-8 relative">
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

        {/* Trust strip */}
        <div
          className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise-in"
          style={{ animationDelay: '260ms', animationFillMode: 'backwards' }}
        >
          {trustPoints.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <Icon className="w-3.5 h-3.5 text-gold" />
              {label}
            </span>
          ))}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div
            className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 flex gap-2 overflow-x-auto pb-1 animate-fade-in [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ animationDelay: '320ms', animationFillMode: 'backwards' }}
          >
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium border transition-all duration-150 ${
                selectedCategory === ''
                  ? 'bg-gold-soft text-gold border-gold shadow-[0_0_16px_-4px_var(--color-gold)]'
                  : 'bg-surface text-ink-muted border-hairline-strong hover:border-ink-faint'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium border capitalize transition-all duration-150 ${
                  selectedCategory === category
                    ? 'bg-gold-soft text-gold border-gold shadow-[0_0_16px_-4px_var(--color-gold)]'
                    : 'bg-surface text-ink-muted border-hairline-strong hover:border-ink-faint'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-16 relative">
        <div className="flex items-center justify-between mb-5 pt-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-ink-faint" />
            <h2 className="text-[15px] font-semibold text-ink">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} products` : 'All products'}
            </h2>
          </div>
          {!loading && products.length > 0 && (
            <span className="font-mono text-xs text-ink-faint">
              [ {String(products.length).padStart(3, '0')} ]
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
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
        ) : products.length === 0 ? (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product, index) => (
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
