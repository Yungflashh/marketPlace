import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Bell, Plus, Trash2, MapPin, DollarSign, ShoppingBag, User, Calendar } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

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
  const [formData, setFormData] = useState({ name: '', location: '', amount: '', product: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (): Promise<void> => {
    try {
      const response = await api.get('/notifications');
      const data = response.data.data;
      setNotifications(Array.isArray(data) ? data : data?.notifications || []);
    } catch {
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
        product: formData.product,
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

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/notifications/${deleteTarget._id}`);
      toast.success('Notification deleted successfully!');
      setDeleteTarget(null);
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting notification');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <AdminPageHeader
        icon={<Bell className="w-5 h-5" />}
        title="Notification management"
        subtitle="Create and manage purchase notifications"
        action={<Button onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>Create</Button>}
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Total" value={notifications.length} icon={<Bell className="w-4 h-4" />} />
        <StatTile label="Status" value="Active" icon={<ShoppingBag className="w-4 h-4" />} tone="success" />
        <StatTile label="Total value" value={`$${notifications.reduce((sum, n) => sum + n.amount, 0).toFixed(0)}`} icon={<DollarSign className="w-4 h-4" />} tone="accent" />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications yet"
          description="Create your first purchase notification."
          action={<Button onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>Create notification</Button>}
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <Card key={notification._id} padded={false}>
              <div className="bg-success-soft px-4 py-2 border-b border-success/15 rounded-t-[var(--radius-lg)]">
                <Badge tone="success" dot>Live notification</Badge>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-surface-hover rounded-full p-2">
                    <User className="w-4 h-4 text-ink-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-[13px]">{notification.name}</p>
                    <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <MapPin className="w-3 h-3" />
                      <span>{notification.location}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 mb-3">
                  <p className="text-[11px] text-ink-muted mb-0.5">Log</p>
                  <p className="font-medium text-ink text-[13px]">{notification.product}</p>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="font-display text-[17px] font-bold text-success">${notification.amount.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[10.5px] text-ink-muted mb-3 pb-3 border-b border-border">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>

                <Button variant="destructive" fullWidth onClick={() => setDeleteTarget(notification)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create notification"
        description="Add a new purchase notification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button form="notification-form" type="submit" loading={submitting} icon={<Plus className="w-4 h-4" />}>Create</Button>
          </>
        }
      >
        <form id="notification-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Customer name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John D."
              required
              leftIcon={<User className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Location</label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="New York"
              required
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Log name</label>
            <Input
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Chase Business Log"
              required
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="199.99"
              required
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete notification"
        message={`Are you sure you want to delete this notification for "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminNotifications;
