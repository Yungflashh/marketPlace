import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Wallet, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  ArrowUpCircle, ArrowDownCircle, Hash, X, User, Calendar
} from 'lucide-react';

const PAGE_SIZE = 15;

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

type FilterType = 'all' | 'pending' | 'completed' | 'failed';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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

  const handleStatusChange = async (id: string, newStatus: 'completed' | 'failed'): Promise<void> => {
    setProcessingId(id);
    try {
      await api.patch(`/admin/transactions/${id}`, { status: newStatus });
      toast.success(`Transaction ${newStatus === 'completed' ? 'approved' : 'rejected'}`);
      await fetchTransactions();
      if (detailTxn?._id === id) closeDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = (txn: Transaction) => {
    setDetailTxn(txn);
    requestAnimationFrame(() => setDetailVisible(true));
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setDetailTxn(null), 200);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = filterStatus === 'all' ? transactions : transactions.filter(t => t.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    volume: transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((s, t) => s + t.amount, 0),
  };

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: stats.total },
    { label: 'Pending', value: 'pending', count: stats.pending },
    { label: 'Completed', value: 'completed', count: stats.completed },
    { label: 'Failed', value: 'failed', count: stats.failed },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Wallet className="w-7 h-7 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-10">Review and approve wallet funding requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">${stats.volume.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${ filterStatus === f.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-900 hover:text-gray-900' }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${ filterStatus === f.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500' }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{txn.user?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{txn.user?.email ?? ''}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${ txn.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                          {txn.type === 'credit'
                            ? <ArrowDownCircle className="w-3 h-3" />
                            : <ArrowUpCircle className="w-3 h-3" />
                          }
                          {txn.type.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          {txn.paymentMethod ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(txn.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${ txn.status === 'completed' ? 'bg-green-100 text-green-700' : txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' }`}>
                          {txn.status === 'completed' ? <CheckCircle2 className="w-3 h-3" />
                            : txn.status === 'pending' ? <Clock className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />
                          }
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetail(txn)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Details
                          </button>
                          {txn.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(txn._id, 'failed')}
                                disabled={processingId === txn._id}
                                className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleStatusChange(txn._id, 'completed')}
                                disabled={processingId === txn._id}
                                className="text-xs text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                              >
                                {processingId === txn._id
                                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  : 'Approve'
                                }
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Page {currentPage} of {totalPages} — {filtered.length} transactions
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} className="px-1 text-gray-300 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${currentPage === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {detailTxn && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${detailVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-200 ${detailVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gray-900 px-6 py-5 flex items-center justify-between">
              <h2 className="text-white font-semibold">Transaction Details</h2>
              <button onClick={closeDetail} className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> User</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{detailTxn.user?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{detailTxn.user?.email ?? ''}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(detailTxn.createdAt)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Amount</p>
                  <p className={`text-xl font-bold ${detailTxn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {detailTxn.type === 'credit' ? '+' : '-'}${detailTxn.amount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Balance After</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${detailTxn.balanceAfter.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Method</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{detailTxn.paymentMethod ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`font-semibold capitalize ${ detailTxn.status === 'completed' ? 'text-green-600' : detailTxn.status === 'pending' ? 'text-yellow-600' : 'text-red-600' }`}>{detailTxn.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Hash className="w-3 h-3" /> Reference</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{detailTxn.reference}</span>
                </div>
              </div>

              {detailTxn.walletAddress && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{detailTxn.walletAddress}</p>
                </div>
              )}

              {detailTxn.description && (
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{detailTxn.description}</p>
                </div>
              )}

              {detailTxn.status === 'pending' && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleStatusChange(detailTxn._id, 'failed')}
                    disabled={processingId === detailTxn._id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(detailTxn._id, 'completed')}
                    disabled={processingId === detailTxn._id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {processingId === detailTxn._id
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><CheckCircle2 className="w-4 h-4" /> Approve</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
