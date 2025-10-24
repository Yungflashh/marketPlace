import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Shield,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Eye,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders?: number;
  completedOrders?: number;
  totalUsers?: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:9000/api/products?limit=1000'),
        axios.get('http://localhost:9000/api/orders?limit=1000')
      ]);

      const products = productsRes.data.data.products;
      const orders = ordersRes.data.data.orders;

      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return order.status === 'completed' ? sum + order.totalAmount : sum;
      }, 0);

      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const completedOrders = orders.filter((order: any) => order.status === 'completed').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalUsers: 0 // Add API call if you have user endpoint
      });
    } catch (error: any) {
      toast.error('Error fetching dashboard data');
      console.log(error);
      
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <Shield className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your store overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4">
                  <Package className="w-8 h-8 text-indigo-600" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Products</p>
              <p className="text-5xl font-extrabold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Orders</p>
              <p className="text-5xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</p>
              <p className="text-5xl font-extrabold text-gray-900">${stats.totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-semibold text-gray-700">Pending Orders</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-200 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-gray-700">Completed Orders</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <div className="bg-green-200 rounded-full p-3">
                <CheckCircle2 className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-semibold text-gray-700">Total Users</p>
                </div>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers || '--'}</p>
              </div>
              <div className="bg-indigo-200 rounded-full p-3">
                <Users className="w-6 h-6 text-indigo-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Manage Products */}
            <Link to="/admin/products" className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-lg">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Products</h3>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or remove products</p>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Go to Products</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* View Orders */}
            <Link to="/admin/orders" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View Orders</h3>
                <p className="text-sm text-gray-600 mb-4">Track and manage all orders</p>
                <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Go to Orders</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Manage Wallets */}
            <Link to="/admin/transactions" className="group">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-100 hover:border-yellow-300 transition-all hover:shadow-lg">
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Transactions</h3>
                <p className="text-sm text-gray-600 mb-4">Approve wallet transactions</p>
                <div className="flex items-center gap-2 text-yellow-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Go to Transactions</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* View Store */}
            <Link to="/" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View Store</h3>
                <p className="text-sm text-gray-600 mb-4">Preview your marketplace</p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Go to Store</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;