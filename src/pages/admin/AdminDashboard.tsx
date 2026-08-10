import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Shield,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Wallet,
  Eye,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  Bell,
  CreditCard,
  Mail,
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
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products?limit=1000'),
        api.get('/orders?limit=1000'),
      ]);

      const products = productsRes.data.data.products;
      const orders = ordersRes.data.data.orders;

      const totalRevenue = orders.reduce((sum: number, order: any) =>
        order.status === 'completed' ? sum + order.totalAmount : sum, 0
      );

      setStats({ totalProducts: products.length, totalOrders: orders.length, totalRevenue });
    } catch {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    { to: '/admin/products', icon: Package, label: 'Logs', desc: 'Add, edit, or remove logs', color: 'text-gray-700 bg-gray-100' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', desc: 'Track and manage orders', color: 'text-green-700 bg-green-50' },
    { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage user accounts', color: 'text-blue-700 bg-blue-50' },
    { to: '/admin/wallet', icon: Wallet, label: 'Wallets', desc: 'Credit or debit user wallets', color: 'text-purple-700 bg-purple-50' },
    { to: '/admin/transactions', icon: CreditCard, label: 'Transactions', desc: 'Approve or reject payments', color: 'text-orange-700 bg-orange-50' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', desc: 'Manage purchase notifications', color: 'text-teal-700 bg-teal-50' },
    { to: '/admin/emails', icon: Mail, label: 'Emails', desc: 'AI-assisted email automation', color: 'text-rose-700 bg-rose-50' },
    { to: '/admin/payment-methods', icon: CreditCard, label: 'Payment Methods', desc: 'Manage crypto payout addresses', color: 'text-amber-700 bg-amber-50' },
    { to: '/', icon: Eye, label: 'View Store', desc: 'See the customer view', color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 ml-9">Manage your marketplace</p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h2 className="text-base font-semibold">Welcome back, Admin</h2>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Here's an overview of your marketplace today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2.5 w-fit mb-3">
              <Package className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProducts}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="bg-green-50 rounded-lg p-2.5 w-fit mb-3">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="bg-purple-50 rounded-lg p-2.5 w-fit mb-3">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${stats.totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="group">
                <div className="border border-gray-100 dark:border-gray-800 hover:border-gray-200 rounded-xl p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-0.5">{action.label}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">System Status</h3>
            </div>
            <div className="space-y-2">
              {['Products API', 'Orders System', 'Payment Gateway'].map((service) => (
                <div key={service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service}</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Operational</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Quick Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Order Value</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logs per Order</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalOrders > 0 ? (stats.totalProducts / stats.totalOrders).toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalProducts > 0
                    ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1)
                    : '0.0'}%
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
