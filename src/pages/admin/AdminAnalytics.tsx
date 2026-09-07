import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Wallet,
  AlertTriangle,
  Send,
  Trophy,
  Activity,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageLoader from '../../components/ui/PageLoader';
import Badge from '../../components/ui/Badge';

interface TopProduct {
  name: string;
  units: number;
  revenue: number;
}
interface DailyBucket {
  date: string;
  orders: number;
  revenue: number;
}
interface WeeklyStats {
  windowStart: string;
  windowEnd: string;
  orders: {
    placed: number;
    placedPrev: number;
    placedChangePct: number | null;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    totalPrev: number;
    changePct: number | null;
  };
  growth: {
    signups: number;
    signupsPrev: number;
    signupsChangePct: number | null;
    activeUsers: number;
    totalUsers: number;
  };
  wallet: {
    depositsTotal: number;
    depositsCount: number;
    pendingFunding: number;
  };
  inventory: {
    lowStock: number;
  };
  topProducts: TopProduct[];
  dailyTrend: DailyBucket[];
}

// pctChange can come across the wire as null (JSON.stringify(Infinity) → "null")
// when the previous window was empty and the current one has activity.
// Treat that case as growth from zero.
const fmtPct = (p: number | null | undefined) => {
  if (p == null || !isFinite(p)) return '+∞%';
  const sign = p >= 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
};

const isPositiveDelta = (p: number | null | undefined) => p == null || !isFinite(p) || p >= 0;

const DeltaBadge: React.FC<{ pct: number | null | undefined }> = ({ pct }) => {
  const positive = isPositiveDelta(pct);
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        positive ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
      }`}
    >
      <Icon className="w-3 h-3" />
      {fmtPct(pct)}
    </span>
  );
};

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await api.get('/admin/analytics/weekly');
      setStats(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const sendDigest = async () => {
    try {
      setSending(true);
      await api.post('/admin/analytics/weekly/send');
      toast.success('Digest posted to Telegram');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post digest');
    } finally {
      setSending(false);
    }
  };

  const range = useMemo(() => {
    if (!stats) return '';
    const start = new Date(stats.windowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(stats.windowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} – ${end}`;
  }, [stats]);

  const chartMax = useMemo(() => {
    if (!stats?.dailyTrend?.length) return 0;
    return Math.max(...stats.dailyTrend.map((d) => d.revenue), 1);
  }, [stats]);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const activePct = stats.growth.totalUsers
    ? Math.round((stats.growth.activeUsers / stats.growth.totalUsers) * 100)
    : 0;

  return (
    <div>
      <AdminPageHeader
        icon={<BarChart3 className="w-5 h-5" />}
        title="Weekly analytics"
        subtitle={`Past 7 days · ${range}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchStats(true)}
              loading={refreshing}
              disabled={refreshing}
              icon={<Activity className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={sendDigest}
              loading={sending}
              disabled={sending}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send to Telegram
            </Button>
          </div>
        }
      />

      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile
          label="Orders placed"
          value={stats.orders.placed}
          icon={<ShoppingCart className="w-4 h-4" />}
          hint={fmtPct(stats.orders.placedChangePct) + ' WoW'}
          tone={isPositiveDelta(stats.orders.placedChangePct) ? 'success' : 'error'}
        />
        <StatTile
          label="Revenue"
          value={`$${(stats.revenue.total || 0).toFixed(0)}`}
          icon={<DollarSign className="w-4 h-4" />}
          hint={fmtPct(stats.revenue.changePct) + ' WoW'}
          tone={isPositiveDelta(stats.revenue.changePct) ? 'success' : 'error'}
        />
        <StatTile
          label="New signups"
          value={stats.growth.signups}
          icon={<UserPlus className="w-4 h-4" />}
          hint={fmtPct(stats.growth.signupsChangePct) + ' WoW'}
          tone={isPositiveDelta(stats.growth.signupsChangePct) ? 'success' : 'error'}
        />
        <StatTile
          label="Active users"
          value={`${stats.growth.activeUsers}`}
          icon={<Activity className="w-4 h-4" />}
          hint={`${activePct}% of ${stats.growth.totalUsers}`}
          tone="primary"
        />
      </div>

      {/* Revenue trend chart */}
      <Card className="mb-6" padded={false}>
        <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[15px] font-bold text-ink">Daily revenue</h2>
            <p className="text-[11.5px] text-ink-muted mt-0.5">Revenue per day across the 7-day window</p>
          </div>
          <DeltaBadge pct={stats.revenue.changePct} />
        </div>
        <div className="px-5 sm:px-6 py-5">
          {stats.dailyTrend.length === 0 ? (
            <p className="text-[13px] text-ink-muted text-center py-8">No orders yet in this window.</p>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-40">
              {stats.dailyTrend.map((d) => {
                const heightPct = chartMax ? Math.max(2, (d.revenue / chartMax) * 100) : 2;
                const dayLabel = new Date(d.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-[var(--radius-sm)] bg-primary/80 hover:bg-primary transition-colors relative group"
                        style={{ height: `${heightPct}%` }}
                        title={`${d.date}: $${(d.revenue || 0).toFixed(2)} · ${d.orders} orders`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-ink text-canvas text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                          ${(d.revenue || 0).toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-muted font-medium">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[15px] font-bold text-ink">Orders breakdown</h3>
            <DeltaBadge pct={stats.orders.placedChangePct} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[13px] text-ink-soft">Completed</span>
              </div>
              <span className="text-[13px] font-semibold text-ink">{stats.orders.completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-[13px] text-ink-soft">Cancelled</span>
              </div>
              <span className="text-[13px] font-semibold text-ink">{stats.orders.cancelled}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[13px] text-ink-soft">In flight</span>
              </div>
              <span className="text-[13px] font-semibold text-ink">
                {Math.max(0, stats.orders.placed - stats.orders.completed - stats.orders.cancelled)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest">Total placed</span>
              <span className="font-display text-[18px] font-bold text-ink">{stats.orders.placed}</span>
            </div>
          </div>
        </Card>

        {/* Wallet + inventory */}
        <Card>
          <h3 className="font-display text-[15px] font-bold text-ink mb-4">Wallet &amp; inventory</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <Wallet className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-ink-muted">Approved deposits</p>
                <p className="text-[15px] font-bold text-ink">
                  ${(stats.wallet.depositsTotal || 0).toFixed(2)}
                  <span className="text-[11.5px] font-normal text-ink-muted ml-2">
                    · {stats.wallet.depositsCount} transaction{stats.wallet.depositsCount === 1 ? '' : 's'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${stats.wallet.pendingFunding > 0 ? 'text-warning' : 'text-ink-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-ink-muted">Pending funding requests</p>
                <p className="text-[15px] font-bold text-ink">{stats.wallet.pendingFunding}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-hover">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${stats.inventory.lowStock > 0 ? 'text-error' : 'text-ink-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-ink-muted">Low-stock products</p>
                <p className="text-[15px] font-bold text-ink">
                  {stats.inventory.lowStock}
                  {stats.inventory.lowStock > 0 && (
                    <span className="ml-2"><Badge tone="warning">Restock soon</Badge></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top products */}
      <Card padded={false}>
        <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <h2 className="font-display text-[15px] font-bold text-ink">Top 5 products this week</h2>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="p-6 text-[13px] text-ink-muted text-center">No products sold in this window.</p>
        ) : (
          <div className="divide-y divide-[var(--vault-border)]">
            {stats.topProducts.map((p, idx) => {
              const maxUnits = Math.max(...stats.topProducts.map((x) => x.units), 1);
              const barPct = (p.units / maxUnits) * 100;
              return (
                <div key={p.name + idx} className="px-5 sm:px-6 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[13px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-[13px] font-medium text-ink truncate">{p.name}</p>
                      <p className="text-[12px] text-ink-muted shrink-0">
                        <span className="font-semibold text-ink">{p.units}</span> unit{p.units === 1 ? '' : 's'} ·{' '}
                        <span className="font-semibold text-ink">${(p.revenue || 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAnalytics;
