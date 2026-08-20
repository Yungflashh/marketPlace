import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import { Users, Search, Shield, ShieldOff, Crown, UserCheck, DollarSign, Calendar, Mail, Eye, X, Ban, MailWarning, AlertTriangle } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
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

  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [banDays, setBanDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [banError, setBanError] = useState<string | null>(null);
  const [banLoading, setBanLoading] = useState(false);

  const [warnTarget, setWarnTarget] = useState<User | null>(null);
  const [warnPreview, setWarnPreview] = useState<{ subject: string; html: string; to: string; failedCount: number } | null>(null);
  const [warnPreviewLoading, setWarnPreviewLoading] = useState(false);
  const [warnSending, setWarnSending] = useState(false);

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

  const openBanDialog = (user: User) => {
    setBanTarget(user);
    setBanDays('7');
    setBanReason('');
    setBanError(null);
  };

  const closeBanDialog = () => {
    if (banLoading) return;
    setBanTarget(null);
    setBanError(null);
  };

  const submitBan = async () => {
    if (!banTarget) return;
    const days = Number(banDays);
    if (!Number.isFinite(days) || days <= 0) {
      setBanError('Enter a valid number of days (must be greater than 0).');
      return;
    }
    if (!banReason.trim()) {
      setBanError('Provide a reason so the user understands why they were banned.');
      return;
    }
    setBanLoading(true);
    try {
      await api.post(`/users/${banTarget._id}/ban`, { days, reason: banReason.trim() });
      toast.success(`${banTarget.name} banned for ${days} day${days === 1 ? '' : 's'}`);
      setBanTarget(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error banning user');
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = (user: User) => {
    ask({
      title: 'Unban user',
      message: `Restore ${user.name}'s access immediately? Their consecutive-failure counter will also be reset.`,
      confirmLabel: 'Yes, unban',
      danger: false,
      execute: async () => {
        await api.post(`/users/${user._id}/unban`);
        toast.success('User unbanned');
        await fetchUsers();
      },
    });
  };

  const openWarningDialog = async (user: User) => {
    setWarnTarget(user);
    setWarnPreview(null);
    setWarnPreviewLoading(true);
    try {
      const res = await api.get(`/users/${user._id}/warning-email/preview`);
      setWarnPreview(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading email preview');
      setWarnTarget(null);
    } finally {
      setWarnPreviewLoading(false);
    }
  };

  const closeWarningDialog = () => {
    if (warnSending) return;
    setWarnTarget(null);
    setWarnPreview(null);
  };

  const sendWarning = async () => {
    if (!warnTarget) return;
    setWarnSending(true);
    try {
      await api.post(`/users/${warnTarget._id}/warning-email`);
      toast.success(`Warning email sent to ${warnTarget.email}`);
      setWarnTarget(null);
      setWarnPreview(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error sending warning email');
    } finally {
      setWarnSending(false);
    }
  };

  const isCurrentlyBanned = (user: User): boolean => {
    if (!user.isBanned) return false;
    if (!user.banExpiresAt) return true;
    return new Date(user.banExpiresAt) > new Date();
  };

  const formatBanExpiry = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive && !isCurrentlyBanned(u)).length,
    inactive: users.filter((u) => !u.isActive).length,
    banned: users.filter((u) => isCurrentlyBanned(u)).length,
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatTile label="Total users" value={stats.total} />
        <StatTile label="Active" value={stats.active} tone="success" />
        <StatTile label="Inactive" value={stats.inactive} tone="error" />
        <StatTile label="Banned" value={stats.banned} tone="warning" />
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
                  {isCurrentlyBanned(user) && (
                    <Badge tone="warning"><Ban className="w-3 h-3" /> Banned</Badge>
                  )}
                  {(user.failedTransactionCount ?? 0) > 0 && (
                    <Badge tone="error">{user.failedTransactionCount} failed</Badge>
                  )}
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                        {isCurrentlyBanned(user) && (
                          <Badge tone="warning"><Ban className="w-3 h-3" /> Banned</Badge>
                        )}
                        {(user.failedTransactionCount ?? 0) > 0 && (
                          <Badge tone="error">{user.failedTransactionCount} failed</Badge>
                        )}
                      </div>
                    </td>
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

              <div className="border border-border rounded-[var(--radius-md)] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink-soft">Trust &amp; safety</p>
                    <p className="text-[11.5px] text-ink-muted mt-0.5">
                      Consecutive failed funding requests: <span className="font-semibold text-ink">{selectedUser.failedTransactionCount ?? 0}</span>
                    </p>
                    {selectedUser.lastWarningEmailAt && (
                      <p className="text-[11px] text-ink-muted">
                        Last warning email: {formatBanExpiry(selectedUser.lastWarningEmailAt)}
                      </p>
                    )}
                  </div>
                  {(selectedUser.failedTransactionCount ?? 0) >= 3 && !isCurrentlyBanned(selectedUser) && (
                    <span className="text-[10.5px] font-semibold uppercase tracking-wide text-error flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Threshold reached
                    </span>
                  )}
                </div>

                {isCurrentlyBanned(selectedUser) && (
                  <div className="bg-warning-soft border border-warning/30 rounded-[var(--radius-sm)] px-3 py-2 text-[12px] text-ink-soft">
                    <p className="font-semibold text-warning flex items-center gap-1 mb-0.5">
                      <Ban className="w-3 h-3" /> Currently banned until {formatBanExpiry(selectedUser.banExpiresAt)}
                    </p>
                    {selectedUser.banReason && <p className="whitespace-pre-wrap">Reason: {selectedUser.banReason}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => openWarningDialog(selectedUser)}
                    icon={<MailWarning className="w-4 h-4" />}
                  >
                    Send warning email
                  </Button>
                  {isCurrentlyBanned(selectedUser) ? (
                    <Button
                      onClick={() => handleUnban(selectedUser)}
                      icon={<Shield className="w-4 h-4" />}
                      className="!bg-success hover:!bg-success"
                    >
                      Unban user
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => openBanDialog(selectedUser)}
                      icon={<Ban className="w-4 h-4" />}
                      disabled={selectedUser.role === 'admin'}
                    >
                      Ban user
                    </Button>
                  )}
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

      <Dialog
        open={!!banTarget}
        onClose={closeBanDialog}
        size="sm"
        title="Ban user"
        description={
          banTarget
            ? `${banTarget.name} will lose dashboard access for the duration you set. They will see the reason on login.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={closeBanDialog} disabled={banLoading}>
              Cancel
            </Button>
            <Button variant="destructive" fullWidth onClick={submitBan} loading={banLoading} icon={<Ban className="w-4 h-4" />}>
              Ban user
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
              Duration (days) <span className="text-error">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max="3650"
              step="1"
              value={banDays}
              onChange={(e) => { setBanDays(e.target.value); if (banError) setBanError(null); }}
              placeholder="e.g. 7"
              disabled={banLoading}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[1, 3, 7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setBanDays(String(d)); if (banError) setBanError(null); }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-hover border border-border text-ink-soft hover:border-border-strong transition-colors"
                  disabled={banLoading}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
              Reason <span className="text-error">*</span>
            </label>
            <Textarea
              rows={3}
              value={banReason}
              onChange={(e) => { setBanReason(e.target.value); if (banError) setBanError(null); }}
              placeholder="e.g. Repeated fraudulent funding attempts."
              disabled={banLoading}
              invalid={!!banError && !banReason.trim()}
            />
          </div>

          {banError && (
            <p className="text-[12px] text-error flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {banError}
            </p>
          )}
        </div>
      </Dialog>

      <Dialog
        open={!!warnTarget}
        onClose={closeWarningDialog}
        size="lg"
        title="Review warning email"
        description={
          warnTarget
            ? `This email will be sent to ${warnTarget.email}. Review the content before confirming.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={closeWarningDialog} disabled={warnSending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={sendWarning}
              loading={warnSending}
              disabled={!warnPreview}
              icon={<MailWarning className="w-4 h-4" />}
            >
              Send warning email
            </Button>
          </>
        }
      >
        {warnPreviewLoading || !warnPreview ? (
          <div className="py-12 flex items-center justify-center text-[13px] text-ink-muted">
            Loading preview…
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 space-y-1.5 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">To</span>
                <span className="font-medium text-ink truncate">{warnPreview.to}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Subject</span>
                <span className="font-medium text-ink text-right">{warnPreview.subject}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Failed transactions on record</span>
                <span className="font-semibold text-error">{warnPreview.failedCount}</span>
              </div>
            </div>

            <div className="border border-border rounded-[var(--radius-md)] overflow-hidden bg-white">
              <iframe
                title="Warning email preview"
                srcDoc={warnPreview.html}
                sandbox=""
                className="w-full h-[420px] block"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AdminUsers;
