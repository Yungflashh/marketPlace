import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import { Search, Wallet as WalletIcon, Users as UsersIcon } from 'lucide-react';
import { PageHeader, Badge, Modal, Input, Select, Textarea, Button, Skeleton, EmptyState, Container } from '../../components/ui';

const AdminWallet: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    action: 'credit' as 'credit' | 'debit',
    amount: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data.users || []);
    } catch (error: any) {
      toast.error('Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: User): void => {
    setSelectedUser(user);
    setFormData({
      action: 'credit',
      amount: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      action: 'credit',
      amount: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedUser) return;

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/wallet/admin/update', {
        userId: selectedUser._id,
        amount,
        action: formData.action,
        description: formData.description || `Admin ${formData.action}`
      });

      toast.success(`Wallet ${formData.action}ed successfully!`);
      handleCloseModal();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating wallet');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="Admin" title="User wallets" description="Credit or debit customer balances" />

      <div className="relative max-w-sm mb-6">
        <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 rounded-lg border border-hairline-strong bg-surface pl-10 pr-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition-colors"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface">
          <EmptyState
            icon={<UsersIcon />}
            title={searchTerm ? 'No users found' : 'No users yet'}
            description={searchTerm ? 'Try a different search term.' : 'Registered customers will show up here.'}
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-hairline bg-surface overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Balance</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-ink">{user.name}</div>
                      <div className="text-xs text-ink-faint">{user.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={user.role === 'admin' ? 'gold' : 'neutral'}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-success">${user.walletBalance.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="secondary" size="sm" icon={<WalletIcon />} onClick={() => handleOpenModal(user)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div key={user._id} className="rounded-xl border border-hairline bg-surface p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                    <p className="text-xs text-ink-faint truncate">{user.email}</p>
                  </div>
                  <Badge tone={user.role === 'admin' ? 'gold' : 'neutral'}>{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg text-success">${user.walletBalance.toFixed(2)}</span>
                  <Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <Button variant="secondary" size="sm" fullWidth icon={<WalletIcon />} onClick={() => handleOpenModal(user)}>
                  Manage wallet
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Wallet Management Modal */}
      <Modal open={showModal} onClose={handleCloseModal} title="Manage wallet" description={selectedUser ? `${selectedUser.name} — ${selectedUser.email}` : ''}>
        {selectedUser && (
          <>
            <div className="mb-6 p-4 bg-canvas-raised rounded-lg border border-hairline">
              <p className="text-xs text-ink-faint mb-1">Current balance</p>
              <p className="font-display text-2xl text-ink">${selectedUser.walletBalance.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as 'credit' | 'debit' })}
              >
                <option value="credit">Credit (add funds)</option>
                <option value="debit">Debit (deduct funds)</option>
              </Select>

              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="Enter amount"
              />

              <Textarea
                label="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter reason for transaction"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" variant={formData.action === 'credit' ? 'success' : 'destructive'}>
                  {formData.action === 'credit' ? 'Credit wallet' : 'Debit wallet'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AdminWallet;
