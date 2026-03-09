import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  Bell,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  ShoppingBag,
  User,
  Calendar
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
      console.log('Notifications response:', response.data);
      const data = response.data.data;
      console.log('Parsed data:', data);
      setNotifications(Array.isArray(data) ? data : data?.notifications || []);
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
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Bell className="w-7 h-7 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
            </div>
            <p className="text-gray-500 text-sm ml-10">Create and manage purchase notifications</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="bg-indigo-50 rounded-lg p-2">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="bg-green-50 rounded-lg p-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">Active</p>
              <p className="text-xs text-gray-500">Status</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="bg-purple-50 rounded-lg p-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">${notifications.reduce((sum, n) => sum + n.amount, 0).toFixed(0)}</p>
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
          </div>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-1">No notifications yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first purchase notification</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notification</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map((notification) => (
              <div key={notification._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-green-500 rounded-full p-0.5">
                      <Bell className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">Live Notification</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{notification.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{notification.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                    <p className="text-xs text-gray-500 mb-0.5">Product</p>
                    <p className="font-medium text-gray-900">{notification.product}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">${notification.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-3 pb-3 border-b border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(notification._id)}
                    disabled={deletingId === notification._id}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deletingId === notification._id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200">
            <div className="bg-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Create Notification</h2>
              <p className="text-indigo-100 text-sm">Add a new purchase notification</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John D."
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      placeholder="Wireless Headphones"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="199.99"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <><Plus className="w-4 h-4" /><span>Create</span></>
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
