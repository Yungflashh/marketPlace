import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import {
  Users, Search, Shield, ShieldOff, ChevronLeft, ChevronRight,
  X, Crown, UserCheck, DollarSign, Calendar, Mail, Eye
} from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get('/users');
      const fetched: User[] = response.data.data.users || [];
      setUsers(fetched);
      setSelectedUser(prev => prev ? (fetched.find(u => u._id === prev._id) ?? null) : null);
    } catch {
      toast.error('Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Smooth modal open/close
  const openModal = (user: User) => {
    setSelectedUser(user);
    setBalanceInput('');
    requestAnimationFrame(() => setModalVisible(true));
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedUser(null), 200);
  };

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
      title: newRole === 'admin' ? 'Promote to Admin' : 'Demote to User',
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-7 h-7 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-10">View and manage all registered users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-gray-900' },
            { label: 'Active', value: stats.active, color: 'text-green-600' },
            { label: 'Inactive', value: stats.inactive, color: 'text-red-600' },
            { label: 'Admins', value: stats.admins, color: 'text-gray-700' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">{searchTerm ? 'No users found' : 'No users yet'}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    {['User', 'Email', 'Role', 'Balance', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${user.walletBalance.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            {user.isActive
                              ? <><ShieldOff className="w-3.5 h-3.5" /> Deactivate</>
                              : <><Shield className="w-3.5 h-3.5" /> Activate</>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">Page {currentPage} of {totalPages} — {filteredUsers.length} users</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) => p === '...'
                      ? <span key={`e-${i}`} className="px-1 text-gray-300 text-sm">…</span>
                      : <button key={p} onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${currentPage === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                          {p}
                        </button>
                    )}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Modal Header */}
            <div className="bg-gray-900 px-6 py-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                  {initials(selectedUser.name)}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg leading-tight">{selectedUser.name}</h2>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Role</p>
                  <div className="flex items-center gap-2">
                    {selectedUser.role === 'admin' ? <Crown className="w-4 h-4 text-gray-700 dark:text-gray-300" /> : <UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                    <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{selectedUser.role}</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Wallet Balance</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{selectedUser.walletBalance.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Member Since</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedUser.email}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedUser)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${ selectedUser.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100' }`}
                >
                  {selectedUser.isActive
                    ? <><ShieldOff className="w-4 h-4" /> Deactivate</>
                    : <><Shield className="w-4 h-4" /> Activate</>
                  }
                </button>
                <button
                  onClick={() => handleToggleRole(selectedUser)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${ selectedUser.role === 'admin' ? 'bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800' }`}
                >
                  {selectedUser.role === 'admin'
                    ? <><UserCheck className="w-4 h-4" /> Demote to User</>
                    : <><Crown className="w-4 h-4" /> Promote to Admin</>
                  }
                </button>
              </div>

              {/* Balance Adjustment */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adjust Wallet Balance</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleAdjustBalance('credit', selectedUser)}
                    className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Credit
                  </button>
                  <button
                    onClick={() => handleAdjustBalance('debit', selectedUser)}
                    className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Debit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
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
