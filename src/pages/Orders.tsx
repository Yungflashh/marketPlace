import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';
import {
  Package,
  ShoppingBag,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Hash,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageLoader from '../components/ui/PageLoader';
import StatTile from '../components/ui/StatTile';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data.orders);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const statusTone: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
  };
  const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />,
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-canvas py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">My orders</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No orders yet"
            description="Start shopping to see your orders here."
            action={
              <Link to="/">
                <Button icon={<ShoppingBag className="w-4 h-4" />}>Browse logs</Button>
              </Link>
            }
            className="bg-surface border border-border rounded-[var(--radius-xl)]"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} padded={false}>
                <div className="px-5 sm:px-6 py-4 border-b border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-[10.5px] text-ink-muted mb-1">
                        <Hash className="w-3 h-3" />
                        <span>Order</span>
                      </div>
                      <p className="text-[13px] font-semibold text-ink truncate">{order.orderNumber}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[10.5px] text-ink-muted mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date</span>
                      </div>
                      <p className="text-[12px] font-medium text-ink-soft">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] text-ink-muted mb-1">Status</p>
                      <Badge tone={statusTone[order.status] || 'neutral'}>
                        {statusIcon[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-[10.5px] text-ink-muted mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Total</span>
                      </div>
                      <p className="font-display text-[16px] font-bold text-ink">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2.5 bg-surface-hover rounded-[var(--radius-sm)] text-[13px]">
                        <div>
                          <p className="font-medium text-ink">{item.productName}</p>
                          <p className="text-[11px] text-ink-muted">{item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-ink">${item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-3 bg-surface-hover border-t border-border">
                  <Link to={`/order/${order._id}`}>
                    <Button size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                      View details <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile label="Total orders" value={orders.length} />
            <StatTile label="Completed" value={orders.filter((o) => o.status === 'completed').length} tone="success" />
            <StatTile label="Total spent" value={`$${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`} tone="primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
