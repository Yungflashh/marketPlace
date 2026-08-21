import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import { Users, Search, Shield, ShieldOff, Crown, UserCheck, DollarSign, Calendar, Mail, Eye, X } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Dialog from '../../components/ui/Dialog';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';

const PAGE_SIZE = 15;

interface PendingAction {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  execute: () => Promise<void>;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get('/users');
      const fetched: User[] = response.data.data.users || [];
      setUsers(fetched);
      setSelectedUser((prev) => (prev ? fetched.find((u) => u._id === prev._id) ?? null : null));
    } catch {
      toast.error('Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setBalanceInput('');
  };

  const closeModal = () => setSelectedUser(null);

  const ask = (action: PendingAction) => setPendingAction(action);

  const runAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await pendingAction.execute();
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const handleToggleStatus = (user: User) => {
    ask({
      title: user.isActive ? 'Deactivate user' : 'Activate user',
      message: user.isActive
        ? `This will block ${user.name} from logging in. Are you sure?`
        : `This will restore ${user.name}'s access. Continue?`,
      confirmLabel: user.isActive ? 'Yes, deactivate' : 'Yes, activate',
      danger: user.isActive,
      execute: async () => {
        await api.patch(`/users/${user._id}/status`, { isActive: !user.isActive });
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
        await fetchUsers();
      },
    });
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    ask({
      title: newRole === 'admin' ? 'Promote to admin' : 'Demote to user',
      message: newRole === 'admin'
        ? `${user.name} will gain full admin access. This is a sensitive change.`
        : `${user.name} will lose admin privileges and become a regular user.`,
      confirmLabel: newRole === 'admin' ? 'Yes, promote' : 'Yes, demote',
      danger: newRole === 'admin',
      execute: async () => {
        await api.patch(`/users/${user._id}/role`, { role: newRole });
        toast.success(`Role changed to ${newRole}`);
        await fetchUsers();
      },
    });
  };

  const handleAdjustBalance = (type: 'credit' | 'debit', user: User) => {
    const amount = parseFloat(balanceInput);
    if (!balanceInput || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    ask({
      title: type === 'credit' ? 'Credit wallet' : 'Debit wallet',
      message: `${type === 'credit' ? 'Add' : 'Subtract'} $${amount.toFixed(2)} ${type === 'credit' ? 'to' : 'from'} ${user.name}'s wallet?`,
      confirmLabel: type === 'credit' ? 'Yes, credit' : 'Yes, debit',
      danger: type === 'debit',
      execute: async () => {
        await api.patch(`/users/${user._id}/balance`, { amount, type });
        toast.success(`$${amount.toFixed(2)} ${type === 'credit' ? 'credited' : 'debited'}`);
        setBalanceInput('');
        await fetchUsers();
      },
    });
  };

  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <AdminPageHeader icon={<Users className="w-5 h-5" />} title="User management" subtitle="View and manage all registered users" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total users" value={stats.total} />
        <StatTile label="Active" value={stats.active} tone="success" />
        <StatTile label="Inactive" value={stats.inactive} tone="error" />
        <StatTile label="Admins" value={stats.admins} tone="accent" />
      </div>

      <div className="mb-5 max-w-md">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={searchTerm ? 'No users found' : 'No users yet'}
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          <div className="sm:hidden divide-y divide-[var(--vault-border)]">
            {paginatedUsers.map((user) => (
              <div key={user._id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                  </div>
                  <span className="text-[13px] font-bold text-ink shrink-0">${user.walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{user.role.toUpperCase()}</Badge>
                  <Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openModal(user)} icon={<Eye className="w-3 h-3" />}>View</Button>
                  <Button size="sm" variant={user.isActive ? 'destructive' : 'primary'} onClick={() => handleToggleStatus(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--vault-border)]">
              <thead className="bg-surface-hover">
                <tr>
                  {['User', 'Email', 'Role', 'Balance', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5"><span className="text-[13px] font-medium text-ink">{user.name}</span></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] text-ink-soft">{user.email}</span></td>
                    <td className="px-5 py-3.5"><Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{user.role.toUpperCase()}</Badge></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] font-semibold text-ink">${user.walletBalance.toFixed(2)}</span></td>
                    <td className="px-5 py-3.5"><Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => openModal(user)} icon={<Eye className="w-3.5 h-3.5" />}>View</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(user)} className={user.isActive ? '!text-error' : '!text-success'} icon={user.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <p className="text-[11.5px] text-ink-muted">Page {currentPage} of {totalPages} — {filteredUsers.length} users</p>
              <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </Card>
      )}

      <Dialog open={!!selectedUser} onClose={closeModal} hideClose>
        {selectedUser && (
          <div className="-mx-5 sm:-mx-6 -mt-4 sm:-mt-5">
            <div className="px-5 sm:px-6 pb-5 flex items-start justify-between" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
              <div className="flex items-center gap-4 pt-5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-[16px] shrink-0">
                  {initials(selectedUser.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-display font-bold text-[16px] leading-tight truncate">{selectedUser.name}</h2>
                  <p className="text-white/45 text-[12px] truncate">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors mt-5 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 sm:px-6 pt-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
                  <p className="text-[11px] text-ink-muted mb-1">Role</p>
                  <div className="flex items-center gap-2">
                    {selectedUser.role === 'admin' ? <Crown className="w-4 h-4 text-accent" /> : <UserCheck className="w-4 h-4 text-ink-muted" />}
                    <span className="font-semibold text-ink capitalize text-[13.5px]">{selectedUser.role}</span>
                  </div>
                </div>
                <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
                  <p className="text-[11px] text-ink-muted mb-1">Status</p>
                  <Badge tone={selectedUser.isActive ? 'success' : 'error'}>{selectedUser.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
                  <p className="text-[11px] text-ink-muted mb-1">Wallet balance</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-ink-muted" />
                    <span className="font-bold text-ink text-[16px]">{selectedUser.walletBalance.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
                  <p className="text-[11px] text-ink-muted mb-1">Member since</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-ink-muted" />
                    <span className="font-medium text-ink text-[13px]">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-surface-hover rounded-[var(--radius-md)]">
                <Mail className="w-4 h-4 text-ink-muted shrink-0" />
                <span className="text-[13px] text-ink-soft truncate">{selectedUser.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedUser.isActive ? 'destructive' : 'primary'}
                  onClick={() => handleToggleStatus(selectedUser)}
                  icon={selectedUser.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleToggleRole(selectedUser)}
                  icon={selectedUser.role === 'admin' ? <UserCheck className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                >
                  {selectedUser.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                </Button>
              </div>

              <div className="border border-border rounded-[var(--radius-md)] p-4">
                <p className="text-[13px] font-medium text-ink-soft mb-3">Adjust wallet balance</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    leftIcon={<span className="text-[13px]">$</span>}
                    className="flex-1"
                  />
                  <Button onClick={() => handleAdjustBalance('credit', selectedUser)} className="!bg-success hover:!bg-success">Credit</Button>
                  <Button variant="destructive" onClick={() => handleAdjustBalance('debit', selectedUser)}>Debit</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.title ?? ''}
        message={pendingAction?.message ?? ''}
        confirmLabel={pendingAction?.confirmLabel}
        danger={pendingAction?.danger ?? false}
        loading={actionLoading}
        onConfirm={runAction}
        onCancel={() => { if (!actionLoading) setPendingAction(null); }}
      />
    </div>
  );
};

export default AdminUsers;
