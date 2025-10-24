import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { Search, Filter, ShoppingBag, Sparkles, TrendingUp, Star, Package, Grid3x3, Bell, MapPin, DollarSign } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState(0);

  // Fake purchase notifications
  const notifications = [
    { name: "Sarah M.", location: "New York", amount: 245, product: "Wireless Headphones" },
    { name: "James K.", location: "Los Angeles", amount: 189, product: "Smart Watch" },
    { name: "Emily R.", location: "Chicago", amount: 520, product: "Laptop Stand" },
    { name: "Michael B.", location: "Houston", amount: 350, product: "Gaming Mouse" },
    { name: "Jessica L.", location: "Miami", amount: 120, product: "Phone Case" },
    { name: "David W.", location: "Seattle", amount: 890, product: "Mechanical Keyboard" },
    { name: "Ashley P.", location: "Boston", amount: 275, product: "Fitness Tracker" },
    { name: "Chris T.", location: "Denver", amount: 445, product: "Bluetooth Speaker" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

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

      const response = await axios.get('https://marketplc-be.onrender.com/api/products', { params });
      setProducts(response.data.data.products);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching Logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await axios.get('https://marketplc-be.onrender.com/api/products/categories');
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Live Purchase Notification - Positioned at bottom left */}
      {notifications.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 animate-slide-in max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-4 border-l-4 border-green-500 backdrop-blur-lg">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{notifications[currentNotification].name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Just purchased
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notifications[currentNotification].product}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{notifications[currentNotification].location}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="w-3 h-3" />
                    <span>{notifications[currentNotification].amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
            <h1 className="text-5xl font-extrabold tracking-tight">Welcome to ShopLogs</h1>
            <Sparkles className="w-8 h-8 ml-3 animate-pulse" />
          </div>
          <p className="text-xl text-center text-indigo-100 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Your perfect find is just a click away.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold">{products.length}+</div>
              <div className="text-sm text-indigo-100">Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold">{categories.length}+</div>
              <div className="text-sm text-indigo-100">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold">4.8</div>
              <div className="text-sm text-indigo-100">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 -mt-16 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Product</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Box */}
            <form onSubmit={handleSearch}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="relative group">
              <Grid3x3 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-600 transition-colors" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-700 appearance-none bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
            </h2>
          </div>
          {!loading && products.length > 0 && (
            <span className="text-gray-600 font-medium">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <ShoppingBag className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <p className="text-2xl font-bold text-gray-900 mb-2">No products found</p>
            <p className="text-gray-500 text-lg">Try adjusting your search or filters to find what you're looking for</p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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