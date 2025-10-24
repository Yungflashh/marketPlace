
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api'; // <-- use helper
import {
  Shield, Package, ShoppingCart, DollarSign, TrendingUp,
  Users, Wallet, Eye, Settings, ArrowRight, Activity,
  BarChart3, Clock, CheckCircle2, Sparkles, Bell
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products?limit=1000'),
        api.get('/orders?limit=1000')
      ]);

      const products = productsRes.data.data.products;
      const orders = ordersRes.data.data.orders;

      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return order.status === 'completed' ? sum + order.totalAmount : sum;
      }, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue
      });
    } catch (error: any) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your marketplace efficiently</p>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Welcome Back, Admin!</h2>
            </div>
            <p className="text-indigo-100 text-lg mb-6">
              Here's what's happening with your marketplace today
            </p>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2 inline-flex border border-white/30">
              <Activity className="w-5 h-5" />
              <span className="font-semibold">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4">
                  <Package className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="bg-indigo-50 rounded-full px-3 py-1">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Products</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-2">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Active in catalog</p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <div className="bg-green-50 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Orders</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-2">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500">All time orders</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden group hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <div className="bg-purple-50 rounded-full px-3 py-1">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-2">${stats.totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Completed orders</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manage Products */}
            <Link to="/admin/products" className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove products</p>
              </div>
            </Link>

            {/* View Orders */}
            <Link to="/admin/orders" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">View Orders</h3>
                <p className="text-sm text-gray-600">Track and manage orders</p>
              </div>
            </Link>

            {/* Manage Wallets */}
            <Link to="/admin/transactions" className="group">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-2xl p-6 border-2 border-yellow-100 hover:border-yellow-300 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Manage Wallets</h3>
                <p className="text-sm text-gray-600">Review wallet transactions</p>
              </div>
            </Link>

            {/* View Store */}
            <Link to="/" className="group">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-2xl p-6 border-2 border-pink-100 hover:border-pink-300 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">View Store</h3>
                <p className="text-sm text-gray-600">See customer view</p>
              </div>
            </Link>


            {/* Manage Notifications */}
<Link to="/admin/notifications" className="group">
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
        <Bell className="w-6 h-6 text-white" />
      </div>
      <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-1">Manage Notifications</h3>
    <p className="text-sm text-gray-600">View and send system notifications</p>
  </div>
</Link>

          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Products API</span>
                </div>
                <span className="text-sm font-bold text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Orders System</span>
                </div>
                <span className="text-sm font-bold text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Payment Gateway</span>
                </div>
                <span className="text-sm font-bold text-green-600">Operational</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <span className="font-semibold text-gray-900">Avg. Order Value</span>
                <span className="text-xl font-bold text-indigo-600">
                  ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <span className="font-semibold text-gray-900">Products per Order</span>
                <span className="text-xl font-bold text-green-600">
                  {stats.totalOrders > 0 ? (stats.totalProducts / stats.totalOrders).toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <span className="font-semibold text-gray-900">Conversion Rate</span>
                <span className="text-xl font-bold text-purple-600">
                  {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;