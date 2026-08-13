import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Hash,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { PageHeader, StatCard, Badge, Select, Button, Skeleton, EmptyState, Container } from '../../components/ui';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
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
  createdAt: string;
}

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterStatus]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data.data.transactions);
      console.log(response.data.data);

    } catch (error: any) {
      console.log(error);
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (): void => {
    let filtered = [...transactions];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const handleStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed'): Promise<void> => {
    setProcessingId(transactionId);
    try {
      await api.patch(`/admin/transactions/${transactionId}`, {
        status: newStatus
      });

      toast.success(`Transaction ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully!`);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating transaction');
    } finally {
      setProcessingId(null);
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

  const statusTone = (status: string): 'success' | 'error' | 'warning' | 'neutral' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 />;
      case 'failed':
        return <XCircle />;
      case 'pending':
        return <Clock />;
      default:
        return <AlertCircle />;
    }
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions
      .filter(t => t.status === 'completed' && t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)
  };

  if (loading) {
    return (
      <Container className="py-8 sm:py-10">
        <PageHeader eyebrow="Admin" title="Transactions" description="Review and approve wallet funding requests" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="Admin" title="Transactions" description="Review and approve wallet funding requests" />

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <StatCard value={stats.total} label="Total" />
        <StatCard value={stats.pending} label="Pending" tone="warning" />
        <StatCard value={stats.completed} label="Approved" tone="success" />
        <StatCard value={stats.failed} label="Rejected" tone="error" />
        <StatCard value={`$${stats.totalAmount.toFixed(0)}`} label="Approved amount" tone="gold" className="col-span-2 sm:col-span-1" />
      </div>

      {/* Filters */}
      <div className="mb-6 max-w-xs">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface">
          <EmptyState icon={<Wallet />} title="No transactions found" description="Try adjusting your filters." />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction._id} className="rounded-xl border border-hairline bg-surface p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                {/* Left */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`rounded-lg p-2.5 shrink-0 ${transaction.type === 'credit' ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownCircle className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-danger" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                      <p className="font-medium text-ink text-sm truncate">{transaction.user?.name || 'Unknown user'}</p>
                    </div>
                    <p className="text-xs text-ink-faint mb-2 truncate">{transaction.user?.email || 'N/A'}</p>

                    <p className="font-medium text-ink text-sm mb-2">{transaction.description}</p>

                    {transaction.paymentMethod && (
                      <Badge tone="gold" className="mb-2">{transaction.paymentMethod}</Badge>
                    )}

                    {transaction.walletAddress && (
                      <div className="bg-canvas-raised rounded-lg p-2.5 mb-2 border border-hairline">
                        <p className="text-[10px] text-ink-faint mb-0.5 uppercase tracking-wide">Wallet address</p>
                        <p className="text-xs font-mono text-ink-muted break-all">{transaction.walletAddress}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-ink-faint mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(transaction.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Hash className="w-3 h-3" />
                        {transaction.reference}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right shrink-0">
                  <p className={`font-display text-xl mb-2 ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <Badge tone={statusTone(transaction.status)} icon={getStatusIcon(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <p className="text-xs text-ink-faint mt-2">Bal: ${transaction.balanceAfter.toFixed(2)}</p>
                </div>
              </div>

              {/* Approve / Reject Buttons */}
              {transaction.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-hairline">
                  <Button
                    variant="destructive"
                    fullWidth
                    icon={<XCircle />}
                    loading={processingId === transaction._id}
                    onClick={() => handleStatusChange(transaction._id, 'failed')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    fullWidth
                    icon={<CheckCircle2 />}
                    loading={processingId === transaction._id}
                    onClick={() => handleStatusChange(transaction._id, 'completed')}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default AdminTransactions;
