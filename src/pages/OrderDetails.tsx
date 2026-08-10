import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  Hash,
  Truck,
  Package,
} from 'lucide-react';
import { Badge, Button, Skeleton, ErrorState, Container } from '../components/ui';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching order');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-8 sm:py-10 max-w-3xl">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16 max-w-3xl">
        <ErrorState
          title="Order not found"
          description="We couldn't find the order you're looking for."
          onRetry={() => navigate('/orders')}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10 max-w-3xl">
      <button
        onClick={() => navigate('/orders')}
        className="mb-7 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-8 py-6 border-b border-hairline">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold mb-2">Order details</p>
              <div className="flex items-center gap-1.5 text-sm text-ink-faint">
                <Hash className="w-3.5 h-3.5" />
                <span>{order.orderNumber}</span>
              </div>
            </div>
            <Badge tone={statusTone(order.status)} icon={getStatusIcon(order.status)} className="text-xs px-3 py-1.5">
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="px-5 sm:px-8 py-6 border-b border-hairline">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-canvas-raised rounded-lg p-4 border border-hairline">
              <div className="flex items-center gap-2 mb-2 text-ink-faint">
                <Calendar className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Order date</p>
              </div>
              <p className="font-medium text-ink text-sm">{formatDate(order.createdAt)}</p>
            </div>

            <div className="bg-canvas-raised rounded-lg p-4 border border-hairline">
              <div className="flex items-center gap-2 mb-2 text-ink-faint">
                <CreditCard className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Payment method</p>
              </div>
              <p className="font-medium text-ink text-sm capitalize">{order.paymentMethod}</p>
            </div>

            <div className="bg-canvas-raised rounded-lg p-4 border border-hairline">
              <div className="flex items-center gap-2 mb-2 text-ink-faint">
                <ShoppingBag className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Total items</p>
              </div>
              <p className="font-medium text-ink text-sm">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="px-5 sm:px-8 py-6 border-b border-hairline">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-4">Order items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-canvas-raised rounded-lg p-4 border border-hairline">
                <div className="min-w-0 pr-4">
                  <p className="font-medium text-ink mb-1 truncate">{item.productName}</p>
                  <p className="text-sm text-ink-faint">
                    Qty {item.quantity} · ${item.price.toFixed(2)} each
                  </p>
                </div>
                <p className="font-display text-lg text-ink shrink-0">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="px-5 sm:px-8 py-6 flex justify-between items-center">
          <div>
            <p className="font-medium text-ink">Total amount</p>
            <p className="text-sm text-ink-faint">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items in total
            </p>
          </div>
          <p className="font-display text-3xl text-ink">${order.totalAmount.toFixed(2)}</p>
        </div>

        {/* Order Status Timeline (if completed) */}
        {order.status === 'completed' && (
          <div className="px-5 sm:px-8 py-4 bg-success-soft border-t border-success/20 flex items-center gap-3">
            <div className="bg-success/20 rounded-full p-1.5 shrink-0">
              <Truck className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="font-semibold text-sm text-success">Order completed</p>
              <p className="text-xs text-ink-muted">Your order has been successfully delivered</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="secondary" onClick={() => navigate('/orders')}>
          View all orders
        </Button>
      </div>
    </Container>
  );
};

export default OrderDetails;
