import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  History,
  Wallet,
  AlertOctagon,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async (): Promise<void> => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching order');
      navigate('/orders');
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
    completed: <CheckCircle2 className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
    cancelled: <XCircle className="w-3.5 h-3.5" />,
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    'in-review': 'In review',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const STATUS_DOT: Record<string, string> = {
    pending: 'bg-warning',
    'in-review': 'bg-primary',
    processing: 'bg-primary',
    completed: 'bg-success',
    cancelled: 'bg-error',
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-canvas flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Card>
            <XCircle className="w-11 h-11 text-error mx-auto mb-4" />
            <h2 className="font-display text-[19px] font-bold text-ink mb-2">Order not found</h2>
            <p className="text-[13px] text-ink-muted mb-6">We couldn't find the order you're looking for.</p>
            <Button onClick={() => navigate('/orders')}>View all orders</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center gap-1.5 text-ink-soft hover:text-ink text-[13px] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to orders</span>
        </button>

        <Card padded={false}>
          <div className="px-5 sm:px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-[19px] font-bold text-ink">Order details</h1>
                <div className="flex items-center gap-1.5 text-[12.5px] text-ink-muted mt-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Order #{order.orderNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone[order.status] || 'neutral'}>
                  {statusIcon[order.status]} {order.status.toUpperCase()}
                </Badge>
                <Link
                  to={`/order/${order._id}/invoice`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-hover border border-border text-[11.5px] font-medium text-ink-soft hover:border-border-strong hover:text-ink transition-colors"
                >
                  Receipt
                </Link>
              </div>
            </div>
            <Link
              to={`/order/${order._id}/invoice`}
              className="sm:hidden mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-hover border border-border text-[11.5px] font-medium text-ink-soft hover:border-border-strong hover:text-ink transition-colors"
            >
              Download receipt
            </Link>
          </div>

          <div className="px-5 sm:px-6 py-5 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface-hover rounded-[var(--radius-sm)] p-2">
                  <Calendar className="w-4 h-4 text-ink-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-ink-muted">Order date</p>
                  <p className="text-[13px] font-medium text-ink">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-surface-hover rounded-[var(--radius-sm)] p-2">
                  <CreditCard className="w-4 h-4 text-ink-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-ink-muted">Payment method</p>
                  <p className="text-[13px] font-medium text-ink capitalize">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-surface-hover rounded-[var(--radius-sm)] p-2">
                  <ShoppingBag className="w-4 h-4 text-ink-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-ink-muted">Total items</p>
                  <p className="text-[13px] font-medium text-ink">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 border-b border-border">
            <h2 className="text-[13px] font-semibold text-ink mb-3">Order items</h2>
            <div className="space-y-2.5">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-surface-hover rounded-[var(--radius-md)]">
                  <div>
                    <p className="font-medium text-ink text-[13px]">{item.productName}</p>
                    <p className="text-[11.5px] text-ink-muted">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-ink text-[13px]">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 bg-surface-hover">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[13px] font-semibold text-ink">Total amount</p>
                <p className="text-[11.5px] text-ink-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
              <p className="font-display text-[24px] font-bold text-ink">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {order.status === 'completed' && (
            <div className="px-5 sm:px-6 py-4 bg-success-soft border-t border-success/20">
              <div className="flex items-center gap-2 text-success">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="font-medium text-[13px]">Order completed</p>
                  <p className="text-[11.5px] opacity-80">Your order has been successfully delivered</p>
                </div>
              </div>
            </div>
          )}

          {order.status === 'cancelled' && order.rejectionReason && (
            <div className="px-5 sm:px-6 py-4 bg-error-soft border-t border-error/20">
              <div className="flex items-start gap-2 text-error">
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-[13px]">Order cancelled</p>
                  <p className="text-[12px] opacity-90 leading-relaxed mt-0.5">{order.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {order.refunded && (
            <div className="px-5 sm:px-6 py-4 bg-success-soft border-t border-success/20">
              <div className="flex items-center gap-2 text-success">
                <Wallet className="w-5 h-5" />
                <div>
                  <p className="font-medium text-[13px]">${order.totalAmount.toFixed(2)} refunded</p>
                  <p className="text-[11.5px] opacity-80">Credited back to your wallet balance.</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {order.statusHistory && order.statusHistory.length > 0 && (
          <Card className="mt-4" padded={false}>
            <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <h2 className="font-display text-[15px] font-bold text-ink">Status history</h2>
            </div>
            <ol className="px-5 sm:px-6 py-4 space-y-4">
              {[...order.statusHistory].reverse().map((entry, idx, arr) => (
                <li key={idx} className="relative flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[entry.status] || 'bg-ink-muted'} ring-4 ring-surface`} />
                    {idx < arr.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-2 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-ink">
                        {STATUS_LABEL[entry.status] || entry.status}
                      </p>
                      <p className="text-[11px] text-ink-muted">{formatDate(entry.changedAt)}</p>
                    </div>
                    {entry.reason && (
                      <p className="mt-1 text-[12px] text-ink-soft leading-relaxed bg-surface-hover rounded-[var(--radius-sm)] p-2">
                        {entry.reason}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
