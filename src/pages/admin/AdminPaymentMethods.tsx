import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Hash,
  Wallet as WalletIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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
  { value: 'crypto',  label: 'Crypto wallet', addressLabel: 'Wallet address',    addressPlaceholder: 'e.g. TS4YcYuGH2kJ...',                 showNetwork: true  },
  { value: 'paypal',  label: 'PayPal',        addressLabel: 'PayPal email',      addressPlaceholder: 'you@example.com',                       showNetwork: false },
  { value: 'cashapp', label: 'Cash App',      addressLabel: 'Cashtag',           addressPlaceholder: '$yourcashtag',                          showNetwork: false },
  { value: 'zelle',   label: 'Zelle',         addressLabel: 'Zelle email/phone', addressPlaceholder: 'you@example.com or +1 555 555 5555',    showNetwork: false },
  { value: 'bank',    label: 'Bank transfer', addressLabel: 'Account details',   addressPlaceholder: 'Bank name, account number, routing #',  showNetwork: false },
  { value: 'other',   label: 'Other',         addressLabel: 'Destination',       addressPlaceholder: 'Payment destination',                   showNetwork: false },
];

const typeMeta = (t: PaymentType) => TYPE_OPTIONS.find(o => o.value === t) ?? TYPE_OPTIONS[0];

const emptyForm = {
  label: '',
  type: 'crypto' as PaymentType,
  address: '',
  network: '',
  instructions: '',
  isActive: true,
  sortOrder: 0,
};

const AdminPaymentMethods: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Delete this payment method? Users will no longer be able to select it.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/payment-methods/${id}`);
      toast.success('Payment method deleted');
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error deleting payment method');
    } finally {
      setDeletingId(null);
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
    const idx = methods.findIndex(x => x._id === m._id);
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading payment methods...</p>
      </div>
    );
  }

  const activeCount = methods.filter(m => m.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Methods</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-10">Manage the crypto wallets users pay into when funding</p>
          </div>
          <div className="flex items-center gap-2">
            {methods.length === 0 && (
              <button
                onClick={seedDefaults}
                disabled={seeding}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Seeding...' : 'Load defaults'}
              </button>
            )}
            <button
              onClick={openCreate}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add method
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{methods.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total methods</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="bg-green-50 rounded-lg p-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="bg-red-50 rounded-lg p-2">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{methods.length - activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disabled</p>
            </div>
          </div>
        </div>

        {/* List */}
        {methods.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <WalletIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">No payment methods yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Users can't fund their wallets until you add at least one method.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={seedDefaults}
                disabled={seeding}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Seeding...' : 'Load defaults'}
              </button>
              <button
                onClick={openCreate}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add method
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {methods.map((m, idx) => (
                <div key={m._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{m.label}</span>
                        <span className="text-[10px] font-medium bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {typeMeta(m.type ?? 'crypto').label}
                        </span>
                        {m.network && (
                          <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {m.network}
                          </span>
                        )}
                        <button
                          onClick={() => toggleActive(m)}
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full transition-colors ${ m.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100' }`}
                        >
                          {m.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Hash className="w-3 h-3 flex-shrink-0" />
                        <p className="font-mono truncate">{m.address}</p>
                        <button
                          onClick={() => copy(m.address)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                          title="Copy address"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {m.instructions && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{m.instructions}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex flex-col">
                        <button
                          onClick={() => move(m, 'up')}
                          disabled={idx === 0}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => move(m, 'down')}
                          disabled={idx === methods.length - 1}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => openEdit(m)}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        disabled={deletingId === m._id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === m._id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 text-white p-6 rounded-t-xl">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit payment method' : 'Add payment method'}</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Users will see this in the fund-wallet dropdown</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentType })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white dark:bg-gray-900"
                >
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={formData.type === 'crypto' ? 'e.g. USDT (TRC20)' : formData.type === 'paypal' ? 'e.g. PayPal — Main' : 'Name users see in the dropdown'}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{typeMeta(formData.type).addressLabel}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={typeMeta(formData.type).addressPlaceholder}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {typeMeta(formData.type).showNetwork && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Network</label>
                    <input
                      type="text"
                      value={formData.network}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                      placeholder="TRC20"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    />
                  </div>
                )}
                <div className={typeMeta(formData.type).showNetwork ? '' : 'col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instructions (optional)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Any note shown to users when they select this method"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-100"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active — show this method to users</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{editingId ? 'Save changes' : 'Create method'}</>
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

export default AdminPaymentMethods;
