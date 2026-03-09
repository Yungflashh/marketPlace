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
  Hash
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
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircle2 className="w-3.5 h-3.5" />,
      pending: <Clock className="w-3.5 h-3.5" />,
      cancelled: <XCircle className="w-3.5 h-3.5" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {icons[status] || <Package className="w-3.5 h-3.5" />}
        {status.toUpperCase()}
      </span>
    );
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-xl border border-gray-200 py-16 px-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here!</p>
            <Link to="/">
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Hash className="w-3 h-3" />
                        <span>Order Number</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Total</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link to={`/order/${order._id}`}>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
