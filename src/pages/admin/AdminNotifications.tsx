import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // <-- IMPORTANT: Using centralized API utility
import { toast } from 'react-toastify';
import {
  Bell,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  ShoppingBag,
  User,
  Calendar,
  Shield,
  Sparkles
} from 'lucide-react';

interface Notification {
  _id: string;
  name: string;
  location: string;
  amount: number;
  product: string;
  createdAt: string;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    amount: '',
    product: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (): Promise<void> => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error: any) {
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/notifications', {
        name: formData.name,
        location: formData.location,
        amount: parseFloat(formData.amount),
        product: formData.product
      });

      toast.success('Notification created successfully!');
      setShowModal(false);
      setFormData({ name: '', location: '', amount: '', product: '' });
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      toast.success('Notification deleted successfully!');
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting notification');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
            <Shield className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Notification Management</h1>
                <p className="text-gray-600">Create and manage purchase notifications</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notification</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4">
                <Bell className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-sm text-gray-600 font-semibold">Total Notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">Active</p>
                <p className="text-sm text-gray-600 font-semibold">Status</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  ${notifications.reduce((sum, n) => sum + n.amount, 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600 font-semibold">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">No notifications yet</p>
            <p className="text-gray-500 mb-6">Create your first purchase notification to display on the homepage</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notification</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 rounded-full p-1">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      Live Notification
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-3">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{notification.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{notification.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-semibold">Product</span>
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900">{notification.product}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        ${notification.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(notification._id)}
                    disabled={deletingId === notification._id}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deletingId === notification._id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl">
              <h2 className="text-3xl font-bold mb-2">Create Notification</h2>
              <p className="text-indigo-100">Add a new purchase notification</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John D."
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York"
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <div className="relative group">
                    <ShoppingBag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      placeholder="Wireless Headphones"
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="199.99"
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;