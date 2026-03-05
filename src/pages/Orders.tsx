import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
  Sparkles,
  Receipt,
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
      const response = await axios.get('https://marketplc-be-c2a5.onrender.com/api/orders/my-orders');
      setOrders(response.data.data.orders);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching orders');
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
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <Package className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track and manage your purchases</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Link to="/">
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto group">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Start Shopping</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Order Number */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Hash className="w-4 h-4" />
                        <span className="font-semibold">Order Number</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {order.orderNumber}
                      </p>
                    </div>

                    {/* Order Date */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">Order Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">Status</p>
                      <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${getStatusColor(order.status)} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md`}>
                        {getStatusIcon(order.status)}
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Total Amount */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-sm text-gray-600 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">Total Amount</span>
                      </div>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-8 py-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Items ({order.items.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex-grow">
                            <p className="font-bold text-gray-900 mb-1">{item.productName}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                                <span className="font-semibold text-indigo-600">Qty:</span>
                                <span className="font-bold text-gray-900">{item.quantity}</span>
                              </div>
                              <span>×</span>
                              <span className="font-semibold">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900 text-lg">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-t border-gray-100">
                  <Link to={`/order/${order._id}`}>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 group">
                      <Eye className="w-5 h-5" />
                      <span>View Details</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{orders.length}</p>
                <p className="text-gray-600 font-semibold">Total Orders</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
                <p className="text-gray-600 font-semibold">Completed</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                </p>
                <p className="text-gray-600 font-semibold">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
