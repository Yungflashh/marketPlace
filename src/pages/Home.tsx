import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductStrip from '../components/ProductStrip';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { ArrowUp, Grid3x3, Package, MapPin, CheckCircle2, User, SlidersHorizontal, Star } from 'lucide-react';

const HERO_BG =
  'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=1280&q=85';

const PAGE_LIMIT = 12;

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

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchProducts();
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
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications.length]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Live Purchase Notification */}
      {notifications.length > 0 && (
        <div
          className="fixed bottom-6 left-6 z-50 max-w-xs"
          style={{
            opacity: showNotification ? 1 : 0,
            transform: showNotification ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-full p-2 shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {notifications[currentNotification].name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    purchased{' '}
                    <span className="font-medium text-gray-700">
                      {notifications[currentNotification].product}
                    </span>
                  </p>
                </div>
                <p className="text-sm font-bold text-green-600 shrink-0">
                  ${notifications[currentNotification].amount}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{notifications[currentNotification].location}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center flex flex-col"
        style={{ backgroundImage: `url(${HERO_BG})`, minHeight: 'calc(100vh - 64px)' }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-center flex-1 text-center px-4 py-20 sm:py-28">
          {/* Headline */}
          <h1 className="text-white font-normal leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">
            <span className="animate-fade-up block">Find Your</span>
            <span className="animate-fade-up [animation-delay:100ms] block">Logs Here.</span>
          </h1>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="animate-fade-up [animation-delay:220ms] mt-6 w-full max-w-xl mx-auto"
          >
            <div className="flex items-center gap-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-gray-200 pl-5 pr-1.5 py-1.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for any log..."
                className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 outline-none py-2"
              />
              <button
                type="submit"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 text-white hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </form>

          {/* Description */}
          <p className="animate-fade-up [animation-delay:340ms] mt-4 sm:mt-5 text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
            Thousands of logs, delivered fast.
            <br />
            Pay with your wallet — no card needed.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up [animation-delay:460ms] mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 hover:shadow-lg transition-all"
            >
              Browse Logs
            </button>
            <Link to="/register">
              <button className="text-white text-sm font-medium px-6 py-2.5 rounded-full ring-1 ring-white/40 hover:bg-white/10 transition-colors">
                Create Account
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up [animation-delay:560ms] mt-10 flex items-center gap-8 text-center">
            <div>
              <p className="text-2xl font-semibold text-white">{totalCount || '—'}+</p>
              <p className="text-xs text-white/60 mt-0.5">Logs</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-semibold text-white">{categories.length || '—'}+</p>
              <p className="text-xs text-white/60 mt-0.5">Categories</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-semibold text-white">4.8</p>
              <p className="text-xs text-white/60 mt-0.5">Avg Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Quick-Picks */}
          {categories.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedCategory === ''
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  All Logs
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setPage(1); document.getElementById('all-logs')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedCategory === cat
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Strip */}
          {featuredProducts.length > 0 && (
            <ProductStrip
              title="Featured Logs"
              badge="Featured"
              badgeClass="bg-gray-900 text-white"
              products={featuredProducts}
              icon={<Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />}
            />
          )}

          {/* New Arrivals Strip */}
          {newArrivals.length > 0 && (
            <ProductStrip
              title="New Arrivals"
              badge="New"
              badgeClass="bg-green-600 text-white"
              products={newArrivals}
            />
          )}

          {/* Divider before full grid */}
          {(featuredProducts.length > 0 || newArrivals.length > 0) && (
            <div className="border-t border-gray-100 mb-10" />
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-2.5 rounded-full ring-1 ring-gray-200 hover:ring-gray-300 transition-colors shrink-0"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Header */}
          <div id="all-logs" className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory
                  ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  : searchTerm
                  ? `Results for "${searchTerm}"`
                  : 'All Logs'}
              </h2>
              </div>
            <Grid3x3 className="w-5 h-5 text-gray-300" />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-semibold text-gray-900 mb-1">No logs found</p>
              <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters</p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                              page === p
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
