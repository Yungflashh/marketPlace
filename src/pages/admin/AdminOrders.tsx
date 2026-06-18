import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Order, User } from '../../types';
import { toast } from 'react-toastify';
import {
  ShoppingCart, Calendar, DollarSign, Hash, Eye,
  CheckCircle2, Clock, XCircle, Package, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const PAGE_SIZE = 15;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { setPage(1); }, [filterStatus]);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/orders?limit=1000');
      setOrders(response.data.data.orders);
    } catch {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode }> = {
      completed: { cls: 'bg-green-50 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      pending:   { cls: 'bg-yellow-50 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      cancelled: { cls: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] ?? { cls: 'bg-gray-100 text-gray-600', icon: <Package className="w-3 h-3" /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
        {s.icon}{status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-sm text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            </div>
            <p className="text-sm text-gray-400 ml-9">View and manage all customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-gray-900' },
            { label: 'Completed', value: stats.completed, color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, color: 'text-gray-900' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
          {['all', 'completed', 'pending', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} orders</span>
        </div>

        {/* Table */}
        {paginated.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                      <th key={h} className={`px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((order) => {
                    const user = order.user as User;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Hash className="w-3 h-3 text-gray-300" />
                            <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-700">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-bold text-gray-900">{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Page {page} of {totalPages} — {filtered.length} orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} className="px-1 text-gray-300 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${page === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">#{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Customer', value: (selectedOrder.user as User)?.name },
                  { label: 'Email', value: (selectedOrder.user as User)?.email },
                  { label: 'Date', value: formatDate(selectedOrder.createdAt) },
                  { label: 'Status', value: selectedOrder.status, badge: true },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400 mb-1">{item.label}</p>
                    {item.badge
                      ? getStatusBadge(item.value as string)
                      : <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                    }
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-xl font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
