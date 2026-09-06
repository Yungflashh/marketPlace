import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Bell,
  CreditCard,
  Mail,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  UserPlus,
  XCircle,
  BarChart3,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import PageLoader from '../../components/ui/PageLoader';
import Badge from '../../components/ui/Badge';

interface LowStockProduct {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
}
interface ExpiringBan {
  _id: string;
  name: string;
  email: string;
  banExpiresAt: string;
  banReason?: string;
}
interface TrendPoint { date: string; orders: number; revenue: number; }
interface HealthItem { name: string; ok: boolean; }
interface DailyStats { orders: number; revenue: number; signups: number; }

interface DashboardData {
  totals: {
    products: number;
    orders: number;
    users: number;
    revenue: number;
    avgItemsPerOrder: number;
    avgOrderValue: number;
    walletLiability: number;
  };
  today: DailyStats;
  yesterday: DailyStats;
  queues: {
    pendingTransactionsCount: number;
    pendingOrdersCount: number;
    lowStockProducts: LowStockProduct[];
    expiringBans: ExpiringBan[];
  };
  revenueTrend: TrendPoint[];
  systemHealth: HealthItem[];
}

const money = (n: number) => `$${n.toFixed(n < 100 ? 2 : 0)}`;

const deltaHint = (today: number, yesterday: number, formatter: (n: number) => string = String) => {
  if (yesterday === 0 && today === 0) return { text: 'No activity yesterday', tone: 'neutral' as const, dir: 'flat' as const };
  if (yesterday === 0) return { text: `${formatter(today)} today · new`, tone: 'success' as const, dir: 'up' as const };
  const pct = ((today - yesterday) / yesterday) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return { text: `Flat vs yesterday (${formatter(yesterday)})`, tone: 'neutral' as const, dir: 'flat' as const };
  if (rounded > 0) return { text: `+${rounded}% vs yesterday`, tone: 'success' as const, dir: 'up' as const };
  return { text: `${rounded}% vs yesterday`, tone: 'error' as const, dir: 'down' as const };
};

const RevenueChart: React.FC<{ data: TrendPoint[] }> = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const totalWindow = data.reduce((s, d) => s + d.revenue, 0);
  const barW = 100 / data.length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Revenue · last 30 days</p>
          <p className="font-display text-[24px] font-bold text-ink leading-none mt-1">${totalWindow.toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-muted">Peak day</p>
          <p className="text-[13px] font-semibold text-ink">${max.toFixed(0)}</p>
        </div>
      </div>
      <div className="relative h-32 mt-3">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {data.map((d, i) => {
            const h = (d.revenue / max) * 100;
            return (
              <rect
                key={d.date}
                x={i * barW + barW * 0.15}
                y={100 - h}
                width={barW * 0.7}
                height={h}
                rx={0.6}
                className="fill-primary/70"
              >
                <title>{`${d.date} · $${d.revenue.toFixed(2)} · ${d.orders} orders`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-ink-muted">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setData(response.data.data);
    } catch {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = useMemo(() => [
    { to: '/admin/products', icon: Package, label: 'Logs', desc: 'Add, edit, or remove logs' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', desc: 'Track and manage orders' },
    { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage user accounts' },
    { to: '/admin/wallet', icon: Wallet, label: 'Wallets', desc: 'Credit or debit user wallets' },
    { to: '/admin/transactions', icon: CreditCard, label: 'Transactions', desc: 'Approve or reject payments' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', desc: 'Manage purchase notifications' },
    { to: '/admin/emails', icon: Mail, label: 'Emails', desc: 'AI-assisted email automation' },
    { to: '/admin/payment-methods', icon: CreditCard, label: 'Payment methods', desc: 'Manage crypto payout addresses' },
    { to: '/', icon: Eye, label: 'View store', desc: 'See the customer view' },
  ], []);

  if (loading || !data) return <PageLoader />;

  const { totals, today, yesterday, queues, revenueTrend, systemHealth } = data;

  const ordersDelta = deltaHint(today.orders, yesterday.orders);
  const revenueDelta = deltaHint(today.revenue, yesterday.revenue, money);
  const signupsDelta = deltaHint(today.signups, yesterday.signups);

  const DeltaIcon: React.FC<{ dir: 'up' | 'down' | 'flat' }> = ({ dir }) => {
    if (dir === 'up') return <TrendingUp className="w-3 h-3 inline mr-1" />;
    if (dir === 'down') return <TrendingDown className="w-3 h-3 inline mr-1" />;
    return null;
  };

  const StatTileWithDelta: React.FC<{
    label: string; value: React.ReactNode; icon: React.ReactNode; tone: 'primary' | 'success' | 'accent';
    delta: ReturnType<typeof deltaHint>;
  }> = ({ label, value, icon, tone, delta }) => (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
        <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center bg-${tone}-soft text-${tone}`}>{icon}</div>
      </div>
      <div className="font-display text-[24px] font-bold text-ink leading-none">{value}</div>
      <p className={`text-[11.5px] mt-2 font-medium ${
        delta.tone === 'success' ? 'text-success' : delta.tone === 'error' ? 'text-error' : 'text-ink-muted'
      }`}>
        <DeltaIcon dir={delta.dir} />{delta.text}
      </p>
    </div>
  );

  const attentionTotal =
    queues.pendingTransactionsCount +
    queues.pendingOrdersCount +
    queues.lowStockProducts.length +
    queues.expiringBans.length;

  return (
    <div>
      <AdminPageHeader icon={<Shield className="w-5 h-5" />} title="Admin dashboard" subtitle="Manage your marketplace" />

      <div className="rounded-[var(--radius-lg)] p-6 mb-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--vault-primary), transparent 70%)' }} />
        <div className="relative flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-white/50" />
          <h2 className="font-display text-[15px] font-bold">Welcome back, Admin</h2>
        </div>
        <p className="relative text-white/45 text-[12.5px]">
          {attentionTotal > 0
            ? `${attentionTotal} item${attentionTotal === 1 ? '' : 's'} need your attention today.`
            : 'Everything is up to date. Nice work.'}
        </p>
      </div>

      {/* Today */}
      <h2 className="font-display text-[13px] font-bold text-ink-muted uppercase tracking-widest mb-3">Today</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatTileWithDelta label="Orders today" value={today.orders} icon={<ShoppingCart className="w-4 h-4" />} tone="primary" delta={ordersDelta} />
        <StatTileWithDelta label="Revenue today" value={money(today.revenue)} icon={<DollarSign className="w-4 h-4" />} tone="success" delta={revenueDelta} />
        <StatTileWithDelta label="Signups today" value={today.signups} icon={<UserPlus className="w-4 h-4" />} tone="accent" delta={signupsDelta} />
      </div>

      {/* Needs attention */}
      <h2 className="font-display text-[13px] font-bold text-ink-muted uppercase tracking-widest mb-3 flex items-center gap-2">
        Needs attention {attentionTotal > 0 && <Badge tone="warning">{attentionTotal}</Badge>}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-ink-muted" />
              <h3 className="font-semibold text-ink text-[13.5px]">Approval queues</h3>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/admin/transactions" className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)] hover:bg-surface-hover/70 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center ${queues.pendingTransactionsCount > 0 ? 'bg-warning-soft text-warning' : 'bg-surface text-ink-muted'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">Pending transactions</p>
                  <p className="text-[11.5px] text-ink-muted">Funding requests waiting for review</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-display text-[18px] font-bold ${queues.pendingTransactionsCount > 0 ? 'text-warning' : 'text-ink-muted'}`}>{queues.pendingTransactionsCount}</span>
                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link to="/admin/orders" className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)] hover:bg-surface-hover/70 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center ${queues.pendingOrdersCount > 0 ? 'bg-primary-soft text-primary' : 'bg-surface text-ink-muted'}`}>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">Pending orders</p>
                  <p className="text-[11.5px] text-ink-muted">Orders awaiting status update</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-display text-[18px] font-bold ${queues.pendingOrdersCount > 0 ? 'text-primary' : 'text-ink-muted'}`}>{queues.pendingOrdersCount}</span>
                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-ink-muted" />
            <h3 className="font-semibold text-ink text-[13.5px]">Low stock</h3>
          </div>
          {queues.lowStockProducts.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-[13px] text-ink-soft">All products are well-stocked.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {queues.lowStockProducts.map((p) => (
                <Link key={p._id} to="/admin/products" className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)] hover:bg-surface-hover/70 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-muted">{p.category} · {money(p.price)}</p>
                  </div>
                  <Badge tone={p.quantity === 0 ? 'error' : 'warning'}>
                    {p.quantity === 0 ? 'Sold out' : `${p.quantity} left`}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4 text-ink-muted" />
            <h3 className="font-semibold text-ink text-[13.5px]">Bans expiring soon</h3>
            <span className="text-[11px] text-ink-muted">(next 48h)</span>
          </div>
          {queues.expiringBans.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-[13px] text-ink-soft">No temporary bans expiring in the next 48 hours.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {queues.expiringBans.map((u) => {
                const hoursLeft = Math.max(0, Math.round((new Date(u.banExpiresAt).getTime() - Date.now()) / 3600000));
                return (
                  <Link key={u._id} to={`/admin/users`} className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)] hover:bg-surface-hover/70 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink truncate">{u.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{u.email}</p>
                    </div>
                    <Badge tone="warning">{hoursLeft}h left</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Trends + all-time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <RevenueChart data={revenueTrend} />
        </Card>
        <div className="space-y-3">
          <StatTile label="All-time revenue" value={money(totals.revenue)} icon={<DollarSign className="w-4 h-4" />} tone="accent" />
          <StatTile label="Wallet liability" value={money(totals.walletLiability)} icon={<Wallet className="w-4 h-4" />} tone="warning" hint="Total credit held across all user wallets" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total logs" value={totals.products} icon={<Package className="w-4 h-4" />} tone="primary" />
        <StatTile label="Total orders" value={totals.orders} icon={<ShoppingCart className="w-4 h-4" />} tone="success" />
        <StatTile label="Total users" value={totals.users} icon={<Users className="w-4 h-4" />} tone="accent" />
        <StatTile label="Avg. order value" value={money(totals.avgOrderValue)} icon={<BarChart3 className="w-4 h-4" />} tone="primary" hint={`${totals.avgItemsPerOrder.toFixed(1)} items per order`} />
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

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-ink-muted" />
          <h3 className="font-semibold text-ink text-[13.5px]">System status</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {systemHealth.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 bg-surface-hover rounded-[var(--radius-md)]">
              <div className="flex items-center gap-2">
                {s.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />}
                <span className="text-[13px] font-medium text-ink-soft">{s.name}</span>
              </div>
              <span className={`text-[11.5px] font-medium ${s.ok ? 'text-success' : 'text-error'}`}>
                {s.ok ? 'Operational' : 'Down'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
