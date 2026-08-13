import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Order, User } from '../../types';
import { toast } from 'react-toastify';
import { Eye, Receipt } from 'lucide-react';
import { PageHeader, Badge, Modal, Skeleton, EmptyState, Container } from '../../components/ui';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/orders?limit=1000');
      setOrders(response.data.data.orders);
    } catch (error: any) {
      toast.error('Error fetching orders');
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (order: Order): void => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="Admin" title="Orders" description={`${orders.length} orders placed on ShopLogs`} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface">
          <EmptyState icon={<Receipt />} title="No orders yet" description="Orders placed by customers will show up here." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-hairline bg-surface overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Items</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const user = order.user as User;
                  return (
                    <tr key={order._id} className="border-b border-hairline last:border-0">
                      <td className="px-5 py-3.5 text-sm font-medium text-ink">{order.orderNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-ink">{user?.name}</div>
                        <div className="text-xs text-ink-faint">{user?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-muted">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-ink-muted">{order.items.length}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-ink">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-ink-faint hover:text-gold hover:bg-gold-soft transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => {
              const user = order.user as User;
              return (
                <button
                  key={order._id}
                  onClick={() => handleViewDetails(order)}
                  className="w-full text-left rounded-xl border border-hairline bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{order.orderNumber}</p>
                      <p className="text-xs text-ink-faint truncate">{user?.name} · {user?.email}</p>
                    </div>
                    <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-faint">{order.items.length} items · {formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-ink">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Order Details Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Order details" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-canvas-raised rounded-lg border border-hairline">
              <div>
                <p className="text-xs text-ink-faint">Order number</p>
                <p className="font-medium text-ink text-sm mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Order date</p>
                <p className="font-medium text-ink text-sm mt-0.5">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Customer</p>
                <p className="font-medium text-ink text-sm mt-0.5">{(selectedOrder.user as User)?.name}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Status</p>
                <Badge tone={statusTone(selectedOrder.status)} className="mt-1">{selectedOrder.status}</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-3">Order items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-canvas-raised rounded-lg border border-hairline">
                    <div>
                      <p className="font-medium text-ink text-sm">{item.productName}</p>
                      <p className="text-xs text-ink-faint">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-ink text-sm">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-hairline pt-4 flex justify-between items-center">
              <span className="text-sm font-medium text-ink">Total amount</span>
              <span className="font-display text-2xl text-ink">${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default AdminOrders;
