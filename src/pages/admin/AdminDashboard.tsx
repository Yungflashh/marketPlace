import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Package, ShoppingCart, DollarSign,
  Wallet, Eye, ArrowRight, Bell, ArrowLeftRight
} from 'lucide-react';
import { PageHeader, StatCard, Skeleton, Container } from '../../components/ui';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const quickActions = [
  { to: '/admin/products', icon: Package, title: 'Products', description: 'Add, edit, or remove listings' },
  { to: '/admin/orders', icon: ShoppingCart, title: 'Orders', description: 'Track and manage orders' },
  { to: '/admin/wallet', icon: Wallet, title: 'User wallets', description: 'Credit or debit customer balances' },
  { to: '/admin/transactions', icon: ArrowLeftRight, title: 'Transactions', description: 'Approve pending funding requests' },
  { to: '/admin/notifications', icon: Bell, title: 'Notifications', description: 'Manage on-site announcements' },
  { to: '/', icon: Eye, title: 'View store', description: 'See the customer-facing view' },
];

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

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="Admin" title="Dashboard" description="Manage your marketplace efficiently" />

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<Package />} tone="gold" value={stats.totalProducts} label="Total products" />
          <StatCard icon={<ShoppingCart />} tone="success" value={stats.totalOrders} label="Total orders" />
          <StatCard icon={<DollarSign />} tone="warning" value={`$${stats.totalRevenue.toFixed(0)}`} label="Total revenue" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to} className="group">
              <div className="rounded-xl border border-hairline bg-surface p-5 hover:border-hairline-strong hover:bg-surface-hover transition-colors h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-soft flex items-center justify-center text-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-medium text-ink mb-1">{title}</h3>
                <p className="text-sm text-ink-faint">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-4">System status</h3>
          <div className="space-y-2.5">
            {['Products API', 'Orders system', 'Payment gateway'].map((name) => (
              <div key={name} className="flex items-center justify-between px-4 py-3 bg-canvas-raised rounded-lg border border-hairline">
                <span className="text-sm font-medium text-ink">{name}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Operational
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-4">Quick stats</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-4 py-3 bg-canvas-raised rounded-lg border border-hairline">
              <span className="text-sm font-medium text-ink-muted">Avg. order value</span>
              <span className="text-sm font-semibold text-ink">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-canvas-raised rounded-lg border border-hairline">
              <span className="text-sm font-medium text-ink-muted">Products per order</span>
              <span className="text-sm font-semibold text-ink">
                {stats.totalOrders > 0 ? (stats.totalProducts / stats.totalOrders).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-canvas-raised rounded-lg border border-hairline">
              <span className="text-sm font-medium text-ink-muted">Conversion rate</span>
              <span className="text-sm font-semibold text-ink">
                {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AdminDashboard;
