import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';
import {
  Package,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { Badge, Button, EmptyState, PageHeader, StatCard, Skeleton, Container } from '../components/ui';

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

  const statusTone = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 />;
      case 'pending':
        return <Clock />;
      case 'cancelled':
        return <XCircle />;
      default:
        return <Package />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-8 sm:py-10">
        <PageHeader eyebrow="History" title="My orders" description="Track and manage your purchases" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="History" title="My orders" description="Track and manage your purchases" />

      {orders.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface max-w-md mx-auto">
          <EmptyState
            icon={<Package />}
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see your orders here."
            action={
              <Link to="/">
                <Button icon={<ShoppingBag />}>Start shopping</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-xl border border-hairline bg-surface overflow-hidden">
              {/* Order Header */}
              <div className="px-5 sm:px-6 py-5 border-b border-hairline">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-faint mb-1">
                      <Hash className="w-3 h-3" />
                      <span className="font-medium">Order</span>
                    </div>
                    <p className="text-sm font-semibold text-ink truncate">{order.orderNumber}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-faint mb-1">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">Date</span>
                    </div>
                    <p className="text-sm font-medium text-ink-muted">{formatDate(order.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-ink-faint font-medium mb-1.5">Status</p>
                    <Badge tone={statusTone(order.status)} icon={getStatusIcon(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-ink-faint font-medium mb-1">Total</p>
                    <p className="font-display text-xl text-ink">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-5 sm:px-6 py-4">
                <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-ink-muted truncate pr-3">
                        {item.productName} <span className="text-ink-faint">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-ink shrink-0">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 bg-canvas-raised border-t border-hairline">
                <Link to={`/order/${order._id}`}>
                  <Button variant="secondary" size="sm" icon={<Eye />}>
                    View details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <StatCard icon={<Package />} tone="gold" value={orders.length} label="Total orders" />
          <StatCard
            icon={<CheckCircle2 />}
            tone="success"
            value={orders.filter((o) => o.status === 'completed').length}
            label="Completed"
          />
          <StatCard
            icon={<ShoppingBag />}
            tone="neutral"
            value={`$${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`}
            label="Total spent"
          />
        </div>
      )}
    </Container>
  );
};

export default Orders;
