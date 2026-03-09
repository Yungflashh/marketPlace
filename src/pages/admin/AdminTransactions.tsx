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
  Filter,
  Shield,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

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
      await api.patch(`/admin/transactions/${transactionId}`, { status: newStatus });
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
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </span>
    );
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          </div>
          <p className="text-gray-500 text-sm ml-10">Review and approve wallet transactions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-indigo-600">${stats.totalAmount.toFixed(0)}</p>
            <p className="text-xs text-gray-500">Approved Amount</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="relative max-w-xs">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-900">No transactions found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`rounded-lg p-2 ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <p className="font-medium text-gray-900 text-sm">{transaction.user?.name || 'Unknown User'}</p>
                        <span className="text-xs text-gray-400">{transaction.user?.email || ''}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{transaction.description}</p>

                      {transaction.paymentMethod && (
                        <p className="text-xs bg-indigo-50 px-2 py-0.5 inline-block rounded text-indigo-700 mb-1">
                          {transaction.paymentMethod}
                        </p>
                      )}

                      {transaction.walletAddress && (
                        <div className="bg-gray-50 rounded p-2 mb-1">
                          <p className="text-[10px] text-gray-500 mb-0.5">Wallet Address:</p>
                          <p className="text-xs font-mono text-gray-700 break-all">{transaction.walletAddress}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className={`text-xl font-bold mb-1 ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    {getStatusBadge(transaction.status)}
                    <p className="text-xs text-gray-400 mt-1">Balance: ${transaction.balanceAfter.toFixed(2)}</p>
                  </div>
                </div>

                {transaction.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusChange(transaction._id, 'failed')}
                      disabled={processingId === transaction._id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {processingId === transaction._id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><XCircle className="w-4 h-4" /> Reject</>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange(transaction._id, 'completed')}
                      disabled={processingId === transaction._id}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {processingId === transaction._id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Approve</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
