import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Receipt,
  DollarSign,
  Hash,
  Sparkles,
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
      const response = await axios.get(`https://marketplc-be.onrender.com/api/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-500';
      case 'pending':
        return 'from-yellow-500 to-orange-500';
      case 'cancelled':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <Package className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getStatusColor(order.status)} text-white px-8 py-8`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Order Details</h1>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Hash className="w-4 h-4" />
                  <p className="text-lg font-semibold">Order #{order.orderNumber}</p>
                </div>
              </div>
              <div className={`bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/30 flex items-center gap-3`}>
                {getStatusIcon(order.status)}
                <span className="text-xl font-bold uppercase tracking-wide">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="px-8 py-8 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Date */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-600 rounded-xl p-2">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Order Date</p>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-600 rounded-xl p-2">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Payment Method</p>
                </div>
                <p className="font-bold text-gray-900 text-lg capitalize">
                  {order.paymentMethod}
                </p>
              </div>

              {/* Total Items */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 rounded-xl p-2">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Total Items</p>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} Items
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-8 py-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900 text-lg mb-2">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg">
                          <span className="font-semibold text-indigo-600">Qty:</span>
                          <span className="font-bold text-gray-900">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">${item.price.toFixed(2)} each</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-8 py-8 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                </div>
                <p className="text-sm text-gray-600">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items in total
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Grand Total</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline (if completed) */}
          {order.status === 'completed' && (
            <div className="px-8 py-8 bg-green-50 border-t border-green-100">
              <div className="flex items-center gap-3 text-green-800">
                <div className="bg-green-500 rounded-full p-2">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Order Completed</p>
                  <p className="text-sm text-green-700">Your order has been successfully delivered</p>
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