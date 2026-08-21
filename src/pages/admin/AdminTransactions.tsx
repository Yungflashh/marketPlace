import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Wallet, Clock, CheckCircle2, XCircle,
  ArrowUpCircle, ArrowDownCircle, Hash, User, Calendar, AlertTriangle, MailWarning,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

const PAGE_SIZE = 15;

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  failedTransactionCount?: number;
  isBanned?: boolean;
  banExpiresAt?: string | null;
}

interface Transaction {
  _id: string;
  user: UserInfo | null;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  walletAddress?: string;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  rejectionReason?: string;
  createdAt: string;
}

type FilterType = 'all' | 'pending' | 'completed' | 'failed';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);
  const [approveTarget, setApproveTarget] = useState<Transaction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const [warnTxn, setWarnTxn] = useState<Transaction | null>(null);
  const [warnPreview, setWarnPreview] = useState<{ subject: string; html: string; to: string; failedCount: number } | null>(null);
  const [warnPreviewLoading, setWarnPreviewLoading] = useState(false);
  const [warnSending, setWarnSending] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data.data.transactions || []);
    } catch {
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const submitStatusChange = async (
    id: string,
    newStatus: 'completed' | 'failed',
    reason?: string,
  ): Promise<void> => {
    setProcessingId(id);
    try {
      const payload: { status: 'completed' | 'failed'; rejectionReason?: string } = { status: newStatus };
      if (newStatus === 'failed') payload.rejectionReason = reason ?? '';
      await api.patch(`/admin/transactions/${id}`, payload);
      toast.success(`Transaction ${newStatus === 'completed' ? 'approved' : 'rejected'}`);
      await fetchTransactions();
      if (detailTxn?._id === id) setDetailTxn(null);
      setApproveTarget(null);
      setRejectTarget(null);
      setRejectionReason('');
      setReasonError(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const requestApprove = (txn: Transaction) => setApproveTarget(txn);

  const requestReject = (txn: Transaction) => {
    setRejectionReason('');
    setReasonError(null);
    setRejectTarget(txn);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;
    submitStatusChange(approveTarget._id, 'completed');
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setReasonError('Please provide a reason so the user knows why their transaction was rejected.');
      return;
    }
    submitStatusChange(rejectTarget._id, 'failed', trimmed);
  };

  const closeRejectDialog = () => {
    if (processingId) return;
    setRejectTarget(null);
    setRejectionReason('');
    setReasonError(null);
  };

  const openWarning = async (txn: Transaction) => {
    if (!txn.user?._id) {
      toast.error('User info missing on this transaction');
      return;
    }
    setWarnTxn(txn);
    setWarnPreview(null);
    setWarnPreviewLoading(true);
    try {
      const res = await api.get(`/users/${txn.user._id}/warning-email/preview`);
      setWarnPreview(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading email preview');
      setWarnTxn(null);
    } finally {
      setWarnPreviewLoading(false);
    }
  };

  const closeWarning = () => {
    if (warnSending) return;
    setWarnTxn(null);
    setWarnPreview(null);
  };

  const sendWarning = async () => {
    if (!warnTxn?.user?._id) return;
    setWarnSending(true);
    try {
      await api.post(`/users/${warnTxn.user._id}/warning-email`);
      toast.success(`Warning email sent to ${warnTxn.user.email}`);
      setWarnTxn(null);
      setWarnPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error sending warning email');
    } finally {
      setWarnSending(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = filterStatus === 'all' ? transactions : transactions.filter((t) => t.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === 'pending').length,
    completed: transactions.filter((t) => t.status === 'completed').length,
    failed: transactions.filter((t) => t.status === 'failed').length,
    volume: transactions.filter((t) => t.status === 'completed' && t.type === 'credit').reduce((s, t) => s + t.amount, 0),
  };

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: stats.total },
    { label: 'Pending', value: 'pending', count: stats.pending },
    { label: 'Completed', value: 'completed', count: stats.completed },
    { label: 'Failed', value: 'failed', count: stats.failed },
  ];

  const statusTone: Record<Transaction['status'], 'success' | 'warning' | 'error'> = {
    completed: 'success', pending: 'warning', failed: 'error',
  };
  const statusIcon: Record<Transaction['status'], React.ReactNode> = {
    completed: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, failed: <XCircle className="w-3 h-3" />,
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <AdminPageHeader icon={<Wallet className="w-5 h-5" />} title="Transactions" subtitle="Review and approve wallet funding requests" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatTile label="Total" value={stats.total} />
        <StatTile label="Pending" value={stats.pending} tone="warning" />
        <StatTile label="Approved" value={stats.completed} tone="success" />
        <StatTile label="Rejected" value={stats.failed} tone="error" />
        <StatTile label="Volume" value={`$${stats.volume.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} tone="primary" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              filterStatus === f.value ? 'bg-primary text-on-primary' : 'bg-surface border border-border text-ink-soft hover:border-border-strong'
            }`}
          >
            {f.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${filterStatus === f.value ? 'bg-white/20 text-on-primary' : 'bg-surface-hover text-ink-muted'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Wallet className="w-6 h-6" />} title="No transactions found" className="bg-surface border border-border rounded-[var(--radius-xl)]" />
      ) : (
        <Card padded={false}>
          <div className="lg:hidden divide-y divide-[var(--vault-border)]">
            {paginated.map((txn) => (
              <div key={txn._id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{txn.user?.name ?? 'Unknown'}</p>
                    <p className="text-[11px] text-ink-muted truncate">{txn.user?.email ?? ''}</p>
                  </div>
                  <span className={`text-[13px] font-bold shrink-0 ${txn.type === 'credit' ? 'text-success' : 'text-error'}`}>
                    {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Badge tone={statusTone[txn.status]}>{statusIcon[txn.status]} {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</Badge>
                  <Badge tone="neutral">{txn.paymentMethod ?? '—'}</Badge>
                  <span className="text-[10.5px] text-ink-muted">{formatDate(txn.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={() => setDetailTxn(txn)}>Details</Button>
                  {txn.status === 'pending' && (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => requestReject(txn)} loading={processingId === txn._id}>Reject</Button>
                      <Button size="sm" onClick={() => requestApprove(txn)} loading={processingId === txn._id} className="!bg-success hover:!bg-success">Approve</Button>
                    </>
                  )}
                  {txn.status === 'failed' && txn.type === 'credit' && txn.user && (
                    <Button size="sm" variant="ghost" onClick={() => openWarning(txn)} icon={<MailWarning className="w-3.5 h-3.5" />} className="!text-warning">
                      Warn
                    </Button>
                  )}
                </div>
                {txn.status === 'failed' && (txn.user?.failedTransactionCount ?? 0) > 0 && (
                  <p className="text-[10.5px] text-ink-muted mt-2">
                    Failed streak: <span className="font-semibold text-error">{txn.user?.failedTransactionCount}</span>
                    {(txn.user?.failedTransactionCount ?? 0) >= 3 && ' — consider sending a warning'}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--vault-border)]">
              <thead className="bg-surface-hover">
                <tr>
                  {['User', 'Type', 'Amount', 'Method', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {paginated.map((txn) => (
                  <tr key={txn._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-[13px] font-medium text-ink">{txn.user?.name ?? 'Unknown'}</p>
                      <p className="text-[11px] text-ink-muted">{txn.user?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge tone={txn.type === 'credit' ? 'success' : 'error'}>
                        {txn.type === 'credit' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                        {txn.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[13px] font-bold ${txn.type === 'credit' ? 'text-success' : 'text-error'}`}>
                        {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><Badge tone="neutral">{txn.paymentMethod ?? '—'}</Badge></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><span className="text-[12px] text-ink-muted">{formatDate(txn.createdAt)}</span></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><Badge tone={statusTone[txn.status]}>{statusIcon[txn.status]} {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</Badge></td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button size="sm" variant="ghost" onClick={() => setDetailTxn(txn)}>Details</Button>
                        {txn.status === 'pending' && (
                          <>
                            <Button size="sm" variant="destructive" onClick={() => requestReject(txn)} loading={processingId === txn._id}>Reject</Button>
                            <Button size="sm" onClick={() => requestApprove(txn)} loading={processingId === txn._id} className="!bg-success hover:!bg-success">Approve</Button>
                          </>
                        )}
                        {txn.status === 'failed' && txn.type === 'credit' && txn.user && (
                          <Button size="sm" variant="ghost" onClick={() => openWarning(txn)} icon={<MailWarning className="w-3.5 h-3.5" />} className="!text-warning">
                            Warn
                          </Button>
                        )}
                      </div>
                      {txn.status === 'failed' && (txn.user?.failedTransactionCount ?? 0) >= 3 && (
                        <p className="text-[10.5px] text-error text-right mt-1 flex items-center justify-end gap-1">
                          <AlertTriangle className="w-3 h-3" /> {txn.user?.failedTransactionCount} consecutive failures
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <p className="text-[11.5px] text-ink-muted">Page {currentPage} of {totalPages} — {filtered.length} transactions</p>
              <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={!!detailTxn}
        onClose={() => setDetailTxn(null)}
        title="Transaction details"
        footer={
          detailTxn?.status === 'pending' ? (
            <>
              <Button variant="destructive" fullWidth onClick={() => requestReject(detailTxn)} loading={processingId === detailTxn._id} icon={<XCircle className="w-4 h-4" />}>
                Reject
              </Button>
              <Button fullWidth onClick={() => requestApprove(detailTxn)} loading={processingId === detailTxn._id} className="!bg-success hover:!bg-success" icon={<CheckCircle2 className="w-4 h-4" />}>
                Approve
              </Button>
            </>
          ) : detailTxn?.status === 'failed' && detailTxn.type === 'credit' && detailTxn.user ? (
            <Button fullWidth variant="destructive" onClick={() => openWarning(detailTxn)} icon={<MailWarning className="w-4 h-4" />}>
              Send warning email to user
            </Button>
          ) : undefined
        }
      >
        {detailTxn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1 flex items-center gap-1"><User className="w-3 h-3" /> User</p>
                <p className="text-[13px] font-medium text-ink">{detailTxn.user?.name ?? 'Unknown'}</p>
                <p className="text-[11px] text-ink-muted truncate">{detailTxn.user?.email ?? ''}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                <p className="text-[13px] font-medium text-ink">{formatDate(detailTxn.createdAt)}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1">Amount</p>
                <p className={`text-[19px] font-bold ${detailTxn.type === 'credit' ? 'text-success' : 'text-error'}`}>
                  {detailTxn.type === 'credit' ? '+' : '-'}${detailTxn.amount.toFixed(2)}
                </p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1">Balance after</p>
                <p className="text-[16px] font-bold text-ink">${detailTxn.balanceAfter.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-ink-muted">Method</span>
                <span className="font-medium text-ink">{detailTxn.paymentMethod ?? '—'}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-ink-muted">Status</span>
                <Badge tone={statusTone[detailTxn.status]}>{detailTxn.status}</Badge>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-ink-muted flex items-center gap-1"><Hash className="w-3 h-3" /> Reference</span>
                <span className="font-mono text-[11.5px] text-ink-soft">{detailTxn.reference}</span>
              </div>
            </div>

            {detailTxn.walletAddress && (
              <div className="border border-border rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1">Wallet address</p>
                <p className="text-[11.5px] font-mono text-ink-soft break-all">{detailTxn.walletAddress}</p>
              </div>
            )}

            {detailTxn.description && (
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] text-ink-muted mb-1">Description</p>
                <p className="text-[13px] text-ink-soft">{detailTxn.description}</p>
              </div>
            )}

            {detailTxn.status === 'failed' && detailTxn.rejectionReason && (
              <div className="border border-error/30 bg-error-soft rounded-[var(--radius-md)] p-3">
                <p className="text-[11px] font-semibold text-error mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Rejection reason
                </p>
                <p className="text-[13px] text-ink-soft whitespace-pre-wrap">{detailTxn.rejectionReason}</p>
              </div>
            )}

            {detailTxn.status === 'failed' && (detailTxn.user?.failedTransactionCount ?? 0) > 0 && (
              <div className="border border-border rounded-[var(--radius-md)] p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-ink-muted">Consecutive failed funding requests</p>
                  <p className="text-[15px] font-bold text-error">{detailTxn.user?.failedTransactionCount}</p>
                </div>
                {(detailTxn.user?.failedTransactionCount ?? 0) >= 3 && (
                  <span className="text-[11px] font-semibold text-error flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Threshold reached
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve transaction?"
        message={
          approveTarget
            ? `This will credit $${approveTarget.amount.toFixed(2)} to ${approveTarget.user?.name ?? 'the user'}'s wallet. This action cannot be undone.`
            : ''
        }
        confirmLabel="Yes, approve"
        loading={!!approveTarget && processingId === approveTarget._id}
        onConfirm={confirmApprove}
        onCancel={() => { if (!processingId) setApproveTarget(null); }}
      />

      <Dialog
        open={!!rejectTarget}
        onClose={closeRejectDialog}
        size="sm"
        title="Reject transaction?"
        description={
          rejectTarget
            ? `The user will see this reason on their transaction history. Amount: $${rejectTarget.amount.toFixed(2)}.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={closeRejectDialog} disabled={!!processingId}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={confirmReject}
              loading={!!rejectTarget && processingId === rejectTarget._id}
            >
              Reject transaction
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-ink-soft">
            Reason for rejection <span className="text-error">*</span>
          </label>
          <Textarea
            rows={4}
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (reasonError) setReasonError(null);
            }}
            placeholder="e.g. Payment not received at wallet address, or amount does not match."
            invalid={!!reasonError}
            disabled={!!processingId}
          />
          {reasonError && (
            <p className="text-[12px] text-error flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {reasonError}
            </p>
          )}
        </div>
      </Dialog>

      <Dialog
        open={!!warnTxn}
        onClose={closeWarning}
        size="lg"
        title="Review warning email"
        description={
          warnTxn?.user
            ? `This email will be sent to ${warnTxn.user.email}. Review before confirming.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={closeWarning} disabled={warnSending}>
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
            <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 space-y-2 text-[12.5px]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-3">
                <span className="text-ink-muted">To</span>
                <span className="font-medium text-ink break-all sm:truncate sm:text-right">{warnPreview.to}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-3">
                <span className="text-ink-muted">Subject</span>
                <span className="font-medium text-ink sm:text-right">{warnPreview.subject}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-ink-muted">Failed transactions on record</span>
                <span className="font-semibold text-error">{warnPreview.failedCount}</span>
              </div>
            </div>

            <div className="border border-border rounded-[var(--radius-md)] overflow-hidden bg-white">
              <iframe
                title="Warning email preview"
                srcDoc={warnPreview.html}
                sandbox=""
                className="w-full h-[280px] sm:h-[420px] block"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AdminTransactions;
