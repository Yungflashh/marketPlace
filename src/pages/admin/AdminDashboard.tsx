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
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import PageLoader from '../../components/ui/PageLoader';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
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
    return <PageLoader />;
  }

  const quickActions = [
    { to: '/admin/products', icon: Package, label: 'Logs', desc: 'Add, edit, or remove logs' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', desc: 'Track and manage orders' },
    { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage user accounts' },
    { to: '/admin/wallet', icon: Wallet, label: 'Wallets', desc: 'Credit or debit user wallets' },
    { to: '/admin/transactions', icon: CreditCard, label: 'Transactions', desc: 'Approve or reject payments' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', desc: 'Manage purchase notifications' },
    { to: '/admin/emails', icon: Mail, label: 'Emails', desc: 'AI-assisted email automation' },
    { to: '/admin/payment-methods', icon: CreditCard, label: 'Payment methods', desc: 'Manage crypto payout addresses' },
    { to: '/', icon: Eye, label: 'View store', desc: 'See the customer view' },
  ];

  return (
    <div>
      <AdminPageHeader icon={<Shield className="w-5 h-5" />} title="Admin dashboard" subtitle="Manage your marketplace" />

      <div className="rounded-[var(--radius-lg)] p-6 mb-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--vault-primary), transparent 70%)' }} />
        <div className="relative flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-white/50" />
          <h2 className="font-display text-[15px] font-bold">Welcome back, Admin</h2>
        </div>
        <p className="relative text-white/45 text-[12.5px]">Here's an overview of your marketplace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total logs" value={stats.totalProducts} icon={<Package className="w-4 h-4" />} tone="primary" />
        <StatTile label="Total orders" value={stats.totalOrders} icon={<ShoppingCart className="w-4 h-4" />} tone="success" />
        <StatTile label="Total revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={<DollarSign className="w-4 h-4" />} tone="accent" />
      </div>

      <Card className="mb-6">
        <h2 className="font-display text-[15px] font-bold text-ink mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="group">
              <div className="border border-border hover:border-border-strong rounded-[var(--radius-md)] p-4 transition-all hover:bg-surface-hover h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-[var(--radius-sm)] p-2 bg-primary-soft text-primary">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-semibold text-ink text-[13px] mb-0.5">{action.label}</h3>
                <p className="text-[11.5px] text-ink-muted">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-ink-muted" />
            <h3 className="font-semibold text-ink text-[13.5px]">System status</h3>
          </div>
          <div className="space-y-2">
            {['Products API', 'Orders system', 'Payment gateway'].map((service) => (
              <div key={service} className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-[13px] font-medium text-ink-soft">{service}</span>
                </div>
                <span className="text-[11.5px] font-medium text-success">Operational</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-ink-muted" />
            <h3 className="font-semibold text-ink text-[13.5px]">Quick stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <span className="text-[13px] font-medium text-ink-soft">Avg. order value</span>
              <span className="text-[13px] font-bold text-ink">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <span className="text-[13px] font-medium text-ink-soft">Logs per order</span>
              <span className="text-[13px] font-bold text-ink">
                {stats.totalOrders > 0 ? (stats.totalProducts / stats.totalOrders).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <span className="text-[13px] font-medium text-ink-soft">Conversion rate</span>
              <span className="text-[13px] font-bold text-ink">
                {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
