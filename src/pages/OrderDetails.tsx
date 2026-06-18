import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  Hash,
  Truck
} from 'lucide-react';

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
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching order');
      navigate('/orders');
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
      completed: <CheckCircle2 className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {icons[status] || <Package className="w-4 h-4" />}
        {status.toUpperCase()}
      </span>
    );
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-gray-200 p-10">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center gap-1.5 text-gray-700 hover:text-gray-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Order #{order.orderNumber}</span>
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Order Info */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-lg p-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-lg p-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-lg p-2">
                  <ShoppingBag className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="text-sm font-medium text-gray-900">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-5 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">Total Amount</p>
                <p className="text-xs text-gray-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {order.status === 'completed' && (
            <div className="px-6 py-4 bg-green-50 border-t border-green-100">
              <div className="flex items-center gap-2 text-green-700">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="font-medium text-sm">Order Completed</p>
                  <p className="text-xs text-green-600">Your order has been successfully delivered</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
