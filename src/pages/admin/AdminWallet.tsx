import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import { Wallet, Search, Crown, User as UserIcon } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';

const AdminWallet: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ action: 'credit' as 'credit' | 'debit', amount: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data.users || []);
    } catch {
      toast.error('Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: User): void => {
    setSelectedUser(user);
    setFormData({ action: 'credit', amount: '', description: '' });
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ action: 'credit', amount: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedUser) return;

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await api.post('/wallet/admin/update', {
        userId: selectedUser._id,
        amount,
        action: formData.action,
        description: formData.description || `Admin ${formData.action}`,
      });

      toast.success(`Wallet ${formData.action}ed successfully!`);
      handleCloseModal();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating wallet');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <AdminPageHeader icon={<Wallet className="w-5 h-5" />} title="Manage user wallets" subtitle="Credit or debit any user's balance directly" />

      <div className="mb-5 max-w-md">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<UserIcon className="w-6 h-6" />}
          title={searchTerm ? 'No users found' : 'No users yet'}
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          <div className="sm:hidden divide-y divide-[var(--vault-border)]">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
                    {user.role === 'admin' && <Crown className="w-3 h-3 text-accent shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                  <p className="text-[13px] font-bold text-success mt-1">${user.walletBalance.toFixed(2)}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleOpenModal(user)} className="shrink-0">Manage</Button>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--vault-border)]">
              <thead className="bg-surface-hover">
                <tr>
                  {['User', 'Email', 'Role', 'Wallet balance', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5"><span className="text-[13px] font-medium text-ink">{user.name}</span></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] text-ink-soft">{user.email}</span></td>
                    <td className="px-5 py-3.5"><Badge tone={user.role === 'admin' ? 'accent' : 'primary'}>{user.role.toUpperCase()}</Badge></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] font-bold text-success">${user.walletBalance.toFixed(2)}</span></td>
                    <td className="px-5 py-3.5"><Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenModal(user)}>Manage wallet</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={showModal && !!selectedUser}
        onClose={handleCloseModal}
        title="Manage wallet"
        description={selectedUser ? `${selectedUser.name} — ${selectedUser.email}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button
              form="wallet-form"
              type="submit"
              loading={saving}
              variant={formData.action === 'credit' ? 'primary' : 'destructive'}
            >
              {formData.action === 'credit' ? 'Credit wallet' : 'Debit wallet'}
            </Button>
          </>
        }
      >
        {selectedUser && (
          <>
            <div className="mb-5 p-4 bg-primary-soft rounded-[var(--radius-md)]">
              <p className="text-[11.5px] text-ink-muted mb-1">Current balance</p>
              <p className="font-display text-[26px] font-bold text-ink">${selectedUser.walletBalance.toFixed(2)}</p>
            </div>

            <form id="wallet-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Action</label>
                <Select value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value as 'credit' | 'debit' })}>
                  <option value="credit">Credit (add funds)</option>
                  <option value="debit">Debit (deduct funds)</option>
                </Select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Description (optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter reason for transaction"
                />
              </div>
            </form>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default AdminWallet;
