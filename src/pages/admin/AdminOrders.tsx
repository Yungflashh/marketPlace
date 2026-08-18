import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Order, User } from '../../types';
import { toast } from 'react-toastify';
import { ShoppingCart, Calendar, DollarSign, Hash, Eye, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';

const PAGE_SIZE = 15;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { setPage(1); }, [filterStatus]);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/orders?limit=1000');
      setOrders(response.data.data.orders);
    } catch {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusTone: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    completed: 'success', pending: 'warning', cancelled: 'error',
  };
  const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, cancelled: <XCircle className="w-3 h-3" />,
  };
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <Badge tone={statusTone[status] || 'neutral'}>
      {statusIcon[status] || <Package className="w-3 h-3" />} {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    revenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0),
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <AdminPageHeader icon={<ShoppingCart className="w-5 h-5" />} title="Orders" subtitle="View and manage all customer orders" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Total orders" value={stats.total} />
        <StatTile label="Completed" value={stats.completed} tone="success" />
        <StatTile label="Pending" value={stats.pending} tone="warning" />
        <StatTile label="Revenue" value={`$${stats.revenue.toFixed(0)}`} tone="primary" />
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'completed', 'pending', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${filterStatus === s ? 'bg-primary text-on-primary' : 'text-ink-soft hover:bg-surface-hover'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-ink-muted shrink-0">{filtered.length} orders</span>
        </div>
      </Card>

      {paginated.length === 0 ? (
        <EmptyState icon={<Package className="w-6 h-6" />} title="No orders found" className="bg-surface border border-border rounded-[var(--radius-xl)]" />
      ) : (
        <Card padded={false}>
          <div className="md:hidden divide-y divide-[var(--vault-border)]">
            {paginated.map((order) => {
              const user = order.user as User;
              return (
                <button key={order._id} onClick={() => setSelectedOrder(order)} className="w-full text-left p-4 hover:bg-surface-hover transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Hash className="w-3 h-3 text-ink-muted shrink-0" />
                        <span className="text-[13px] font-semibold text-ink truncate">{order.orderNumber}</span>
                      </div>
                      <p className="text-[13px] text-ink truncate">{user?.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-ink">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-[10.5px] text-ink-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                    <StatusBadge status={order.status} />
                    <div className="flex items-center gap-1.5 text-[10.5px] text-ink-muted">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--vault-border)]">
              <thead className="bg-surface-hover">
                <tr>
                  {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                    <th key={h} className={`px-5 py-3 text-left text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {paginated.map((order) => {
                  const user = order.user as User;
                  return (
                    <tr key={order._id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-ink-muted" />
                          <span className="text-[13px] font-semibold text-ink">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-ink">{user?.name}</p>
                        <p className="text-[11px] text-ink-muted">{user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-[13px] text-ink-soft">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-ink-muted" />
                          <span className="text-[13px] font-bold text-ink">{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(order)} icon={<Eye className="w-3.5 h-3.5" />}>View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 sm:px-5 py-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[11.5px] text-ink-muted">Page {page} of {totalPages} — {filtered.length} orders</p>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order details"
        description={selectedOrder ? `#${selectedOrder.orderNumber}` : undefined}
        footer={<Button fullWidth onClick={() => setSelectedOrder(null)}>Close</Button>}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[10.5px] text-ink-muted mb-1">Customer</p>
                <p className="text-[13px] font-medium text-ink truncate">{(selectedOrder.user as User)?.name}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[10.5px] text-ink-muted mb-1">Email</p>
                <p className="text-[13px] font-medium text-ink truncate">{(selectedOrder.user as User)?.email}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[10.5px] text-ink-muted mb-1">Date</p>
                <p className="text-[13px] font-medium text-ink truncate">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[10.5px] text-ink-muted mb-1">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-3">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-surface-hover rounded-[var(--radius-md)] text-[13px]">
                    <div>
                      <p className="font-medium text-ink">{item.productName}</p>
                      <p className="text-[11px] text-ink-muted">{item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-ink">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-[13px] font-medium text-ink-soft">Total</span>
              <span className="font-display text-[22px] font-bold text-ink">${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AdminOrders;
