import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { Search, Filter, ShoppingBag, Package, Grid3x3, MapPin, CheckCircle2, User } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState(0);
  const [notifications, setNotifications] = useState<{ name: string; location: string; amount: number; product: string }[]>([]);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data.data;
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
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
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
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
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Purchase Notification */}
      {notifications.length > 0 && (
        <div
          className="fixed bottom-6 left-6 z-50 max-w-xs"
          style={{
            opacity: showNotification ? 1 : 0,
            transform: showNotification ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 rounded-full p-2 shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {notifications[currentNotification].name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    purchased <span className="font-medium text-gray-700">{notifications[currentNotification].product}</span>
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
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">Welcome to ShopLogs</h1>
          <p className="text-lg text-center text-indigo-100 max-w-2xl mx-auto mt-3">
            Discover amazing products at unbeatable prices.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <ShoppingBag className="w-6 h-6 mx-auto mb-1" />
              <div className="text-2xl font-bold">{products.length}+</div>
              <div className="text-xs text-indigo-100">Products</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Filter className="w-6 h-6 mx-auto mb-1" />
              <div className="text-2xl font-bold">{categories.length}+</div>
              <div className="text-xs text-indigo-100">Categories</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-1" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-xs text-indigo-100">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="relative">
              <Grid3x3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
          </h2>
          {!loading && products.length > 0 && (
            <span className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[300px]">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
