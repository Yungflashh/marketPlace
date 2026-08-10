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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-50 text-green-700',
      pending: 'bg-yellow-50 text-yellow-700',
      cancelled: 'bg-red-50 text-red-600',
    };
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircle2 className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${ styles[status] || 'bg-gray-100 text-gray-600' }`}
      >
        {icons[status] || <Package className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Orders</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 px-4">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Start shopping to see your orders here.
            </p>
            <Link to="/">
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Browse logs</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                        <Hash className="w-3 h-3" />
                        <span>Order</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{order.orderNumber}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Total</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-50">
                  <Link to={`/order/${order._id}`}>
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{orders.length}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Total orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Total spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
