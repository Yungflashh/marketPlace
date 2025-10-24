import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  Hash,
  Filter,
  Search,
  Shield,
  TrendingUp,
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
  user: UserInfo;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterStatus]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await axios.get('http://localhost:9000/api/admin/transactions');
      setTransactions(response.data.data.transactions);
    } catch (error: any) {
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

    // if (searchTerm) {
    //     console.log(filtered);
        
    //   filtered = filtered.filter(t => 
        
    //     t.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     t.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     t.reference.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
    // }

    setFilteredTransactions(filtered);
  };

  const handleStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed'): Promise<void> => {
    setProcessingId(transactionId);
    try {
      await axios.patch(`http://localhost:9000/api/admin/transactions/${transactionId}`, {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-500';
      case 'pending':
        return 'from-yellow-500 to-orange-500';
      case 'failed':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <Shield className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Transaction Management</h1>
              <p className="text-gray-600">Review and approve wallet transactions</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 rounded-xl p-2">
                <Wallet className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
            <p className="text-sm text-gray-600 font-semibold">Total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 rounded-xl p-2">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
            <p className="text-sm text-gray-600 font-semibold">Pending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 rounded-xl p-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</p>
            <p className="text-sm text-gray-600 font-semibold">Approved</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 rounded-xl p-2">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-1">{stats.failed}</p>
            <p className="text-sm text-gray-600 font-semibold">Rejected</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-xl p-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-1">${stats.totalAmount.toFixed(0)}</p>
            <p className="text-sm text-gray-600 font-semibold">Approved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by user, email, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              />
            </div> */}

            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-12 h-12 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">No transactions found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Left: User & Transaction Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`rounded-xl p-3 ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900">{transaction.user.name}</p>
                            <p className="text-sm text-gray-500">{transaction.user.email}</p>
                          </div>
                        </div>
                        
                        <p className="font-bold text-lg text-gray-900 mb-2">
                          {transaction.description}
                        </p>

                        {transaction.paymentMethod && (
                          <div className="bg-indigo-50 rounded-lg px-3 py-2 inline-block mb-2">
                            <p className="text-sm font-semibold text-indigo-700">
                              Payment Method: {transaction.paymentMethod}
                            </p>
                          </div>
                        )}

                        {transaction.walletAddress && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
                            <p className="text-sm font-mono text-gray-900 break-all">
                              {transaction.walletAddress}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(transaction.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono">{transaction.reference}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status */}
                    <div className="text-right ml-4">
                      <p className={`text-3xl font-bold mb-2 ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      
                      <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${getStatusColor(transaction.status)} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md mb-3`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status.toUpperCase()}
                      </span>

                      <p className="text-sm text-gray-500">
                        Balance: ${transaction.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons (only for pending transactions) */}
                  {transaction.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleStatusChange(transaction._id, 'failed')}
                        disabled={processingId === transaction._id}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processingId === transaction._id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(transaction._id, 'completed')}
                        disabled={processingId === transaction._id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processingId === transaction._id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;