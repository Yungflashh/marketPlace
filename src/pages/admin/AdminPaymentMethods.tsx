import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  CreditCard, Plus, Trash2, Edit2, Copy, CheckCircle2, XCircle,
  Sparkles, Hash, Wallet as WalletIcon, ArrowUp, ArrowDown,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

type PaymentType = 'crypto' | 'paypal' | 'cashapp' | 'zelle' | 'bank' | 'other';

interface PaymentMethod {
  _id: string;
  label: string;
  type: PaymentType;
  address: string;
  network?: string;
  instructions?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const TYPE_OPTIONS: { value: PaymentType; label: string; addressLabel: string; addressPlaceholder: string; showNetwork: boolean }[] = [
  { value: 'crypto', label: 'Crypto wallet', addressLabel: 'Wallet address', addressPlaceholder: 'e.g. TS4YcYuGH2kJ...', showNetwork: true },
  { value: 'paypal', label: 'PayPal', addressLabel: 'PayPal email', addressPlaceholder: 'you@example.com', showNetwork: false },
  { value: 'cashapp', label: 'Cash App', addressLabel: 'Cashtag', addressPlaceholder: '$yourcashtag', showNetwork: false },
  { value: 'zelle', label: 'Zelle', addressLabel: 'Zelle email/phone', addressPlaceholder: 'you@example.com or +1 555 555 5555', showNetwork: false },
  { value: 'bank', label: 'Bank transfer', addressLabel: 'Account details', addressPlaceholder: 'Bank name, account number, routing #', showNetwork: false },
  { value: 'other', label: 'Other', addressLabel: 'Destination', addressPlaceholder: 'Payment destination', showNetwork: false },
];

const typeMeta = (t: PaymentType) => TYPE_OPTIONS.find((o) => o.value === t) ?? TYPE_OPTIONS[0];

const emptyForm = { label: '', type: 'crypto' as PaymentType, address: '', network: '', instructions: '', isActive: true, sortOrder: 0 };

const AdminPaymentMethods: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async (): Promise<void> => {
    try {
      const res = await api.get('/payment-methods/admin/all');
      setMethods(res.data.data ?? []);
    } catch {
      toast.error('Error fetching payment methods');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (): void => {
    setEditingId(null);
    setFormData({ ...emptyForm, sortOrder: methods.length + 1 });
    setShowModal(true);
  };

  const openEdit = (m: PaymentMethod): void => {
    setEditingId(m._id);
    setFormData({
      label: m.label,
      type: m.type ?? 'crypto',
      address: m.address,
      network: m.network ?? '',
      instructions: m.instructions ?? '',
      isActive: m.isActive,
      sortOrder: m.sortOrder,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/payment-methods/${editingId}`, formData);
        toast.success('Payment method updated');
      } else {
        await api.post('/payment-methods', formData);
        toast.success('Payment method created');
      }
      setShowModal(false);
      setFormData(emptyForm);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error saving payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/payment-methods/${deleteTarget._id}`);
      toast.success('Payment method deleted');
      setDeleteTarget(null);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error deleting payment method');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (m: PaymentMethod): Promise<void> => {
    try {
      await api.put(`/payment-methods/${m._id}`, { isActive: !m.isActive });
      fetchMethods();
    } catch {
      toast.error('Error updating status');
    }
  };

  const seedDefaults = async (): Promise<void> => {
    setSeeding(true);
    try {
      const res = await api.post('/payment-methods/seed-defaults');
      toast.success(res.data.message ?? 'Defaults seeded');
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error seeding defaults');
    } finally {
      setSeeding(false);
    }
  };

  const copy = (text: string): void => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const move = async (m: PaymentMethod, direction: 'up' | 'down'): Promise<void> => {
    const idx = methods.findIndex((x) => x._id === m._id);
    const swapWith = direction === 'up' ? methods[idx - 1] : methods[idx + 1];
    if (!swapWith) return;
    try {
      await Promise.all([
        api.put(`/payment-methods/${m._id}`, { sortOrder: swapWith.sortOrder }),
        api.put(`/payment-methods/${swapWith._id}`, { sortOrder: m.sortOrder }),
      ]);
      fetchMethods();
    } catch {
      toast.error('Error reordering');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const activeCount = methods.filter((m) => m.isActive).length;

  return (
    <div>
      <AdminPageHeader
        icon={<CreditCard className="w-5 h-5" />}
        title="Payment methods"
        subtitle="Manage the crypto wallets users pay into when funding"
        action={
          <div className="flex items-center gap-2">
            {methods.length === 0 && (
              <Button variant="secondary" onClick={seedDefaults} loading={seeding} icon={<Sparkles className="w-4 h-4" />}>
                {seeding ? 'Seeding...' : 'Load defaults'}
              </Button>
            )}
            <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add method</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Total methods" value={methods.length} icon={<CreditCard className="w-4 h-4" />} />
        <StatTile label="Active" value={activeCount} icon={<CheckCircle2 className="w-4 h-4" />} tone="success" />
        <StatTile label="Disabled" value={methods.length - activeCount} icon={<XCircle className="w-4 h-4" />} tone="error" />
      </div>

      {methods.length === 0 ? (
        <EmptyState
          icon={<WalletIcon className="w-6 h-6" />}
          title="No payment methods yet"
          description="Users can't fund their wallets until you add at least one method."
          action={
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" onClick={seedDefaults} loading={seeding} icon={<Sparkles className="w-4 h-4" />}>
                {seeding ? 'Seeding...' : 'Load defaults'}
              </Button>
              <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add method</Button>
            </div>
          }
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-[var(--vault-border)]">
            {methods.map((m, idx) => (
              <div key={m._id} className="p-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold text-ink text-[13.5px]">{m.label}</span>
                      <Badge tone="primary">{typeMeta(m.type ?? 'crypto').label}</Badge>
                      {m.network && <Badge tone="neutral">{m.network}</Badge>}
                      <button onClick={() => toggleActive(m)}>
                        <Badge tone={m.isActive ? 'success' : 'error'} className="cursor-pointer">{m.isActive ? 'Active' : 'Disabled'}</Badge>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-ink-muted mb-1">
                      <Hash className="w-3 h-3 shrink-0" />
                      <p className="font-mono truncate">{m.address}</p>
                      <button onClick={() => copy(m.address)} className="text-ink-muted hover:text-ink-soft transition-colors shrink-0" title="Copy address">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {m.instructions && <p className="text-[11.5px] text-ink-muted mt-1">{m.instructions}</p>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col">
                      <button onClick={() => move(m, 'up')} disabled={idx === 0} className="text-ink-muted hover:text-ink-soft disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => move(m, 'down')} disabled={idx === methods.length - 1} className="text-ink-muted hover:text-ink-soft disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => openEdit(m)} className="p-2 rounded-[var(--radius-sm)] text-ink-muted hover:bg-surface-hover transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-[var(--radius-sm)] text-error hover:bg-error-soft transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit payment method' : 'Add payment method'}
        description="Users will see this in the fund-wallet dropdown"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button form="payment-method-form" type="submit" loading={submitting}>{editingId ? 'Save changes' : 'Create method'}</Button>
          </>
        }
      >
        <form id="payment-method-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Type</label>
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentType })}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Label</label>
            <Input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder={formData.type === 'crypto' ? 'e.g. USDT (TRC20)' : formData.type === 'paypal' ? 'e.g. PayPal — Main' : 'Name users see in the dropdown'}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">{typeMeta(formData.type).addressLabel}</label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={typeMeta(formData.type).addressPlaceholder}
              required
              rows={2}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {typeMeta(formData.type).showNetwork && (
              <div>
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Network</label>
                <Input type="text" value={formData.network} onChange={(e) => setFormData({ ...formData, network: e.target.value })} placeholder="TRC20" />
              </div>
            )}
            <div className={typeMeta(formData.type).showNetwork ? '' : 'col-span-2'}>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Sort order</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Instructions (optional)</label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any note shown to users when they select this method"
              rows={2}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-border accent-[var(--vault-primary)] cursor-pointer"
            />
            <span className="text-[13px] text-ink-soft">Active — show this method to users</span>
          </label>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete payment method"
        message="Delete this payment method? Users will no longer be able to select it."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPaymentMethods;
