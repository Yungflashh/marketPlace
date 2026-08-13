import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Bell, Plus, Trash2, MapPin, ShoppingBag, User, Calendar } from 'lucide-react';
import { PageHeader, StatCard, Modal, Input, Button, Skeleton, EmptyState, Container } from '../../components/ui';

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

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description="Manage the live purchase feed shown on the homepage"
        actions={
          <Button icon={<Plus />} onClick={() => setShowModal(true)}>
            Create notification
          </Button>
        }
      />

      {/* Stats */}
      {!loading && notifications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Bell />} tone="gold" value={notifications.length} label="Total notifications" />
          <StatCard
            icon={<ShoppingBag />}
            tone="neutral"
            value={`$${notifications.reduce((sum, n) => sum + n.amount, 0).toFixed(0)}`}
            label="Total value"
          />
          <StatCard tone="success" value="Live" label="Status" className="col-span-2 sm:col-span-1" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface">
          <EmptyState
            icon={<Bell />}
            title="No notifications yet"
            description="Create your first purchase notification to display on the homepage."
            action={
              <Button icon={<Plus />} onClick={() => setShowModal(true)}>
                Create notification
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="rounded-xl border border-hairline bg-surface overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold-soft flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{notification.name}</p>
                    <div className="flex items-center gap-1 text-xs text-ink-faint">
                      <MapPin className="w-3 h-3" />
                      <span>{notification.location}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-canvas-raised rounded-lg p-3 mb-3 border border-hairline">
                  <p className="text-[10px] text-ink-faint uppercase tracking-wide mb-1">Product</p>
                  <p className="font-medium text-ink text-sm truncate">{notification.product}</p>
                </div>

                <p className="font-display text-2xl text-success mb-3">${notification.amount.toFixed(2)}</p>

                <div className="flex items-center gap-1.5 text-xs text-ink-faint mb-4 pb-4 border-b border-hairline">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>

                <Button
                  variant="destructive"
                  fullWidth
                  size="sm"
                  icon={<Trash2 />}
                  loading={deletingId === notification._id}
                  onClick={() => handleDelete(notification._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create notification" description="Add a new purchase notification">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John D."
            required
            icon={<User />}
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="New York"
            required
            icon={<MapPin />}
          />

          <Input
            label="Product name"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            placeholder="Wireless Headphones"
            required
            icon={<ShoppingBag />}
          />

          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="199.99"
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} icon={<Plus />}>Create</Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
};

export default AdminNotifications;
