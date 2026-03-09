import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../types';
import { toast } from 'react-toastify';
import {
  Wallet as WalletIcon,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Hash,
  Calendar,
  Copy,
  Timer,
  Banknote
} from 'lucide-react';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timer, setTimer] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  const walletAddresses = {
    'USDT (TRC20)': 'TS4YcYuGH2kJpePVKAZGnpfVD4bN22sooE',
    'USDT (ERC20)': '0x9A2c294d35F3123a4E48c82477801bFA3cb2f375',
    'Ethereum': '0x9A2c294d35F3123a4E48c82477801bFA3cb2f375',
    'BTC (Main)': 'bc1q7ecv238v9f2e6mr7srkwe4jswe0c28p6tw77zc',
    'BTC (Secondary)': 'bc1qh2g93tgmk6h40p978r7s5wnmhn06fv726zyu3c'
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      toast.error('Payment time expired. Please try again.');
      handleCloseModal();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.data.transactions);
    } catch (error) {
      toast.error('Error fetching transactions');
      console.log(error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleInitiatePayment = (e: React.FormEvent): void => {
    e.preventDefault();
    const fundAmount = parseFloat(amount);
    if (!fundAmount || fundAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedCrypto) {
      toast.error('Please select a payment method');
      return;
    }
    setShowPaymentModal(true);
    setTimer(600);
    setTimerActive(true);
  };

  const handleCloseModal = (): void => {
    setShowPaymentModal(false);
    setTimerActive(false);
    setTimer(600);
    setAmount('');
    setSelectedCrypto('');
  };

  const handleConfirmPayment = async (): Promise<void> => {
    setLoading(true);
    try {
      const fundAmount = parseFloat(amount);
      await api.post('/wallet/fund', {
        amount: fundAmount,
        paymentMethod: selectedCrypto,
        walletAddress: walletAddresses[selectedCrypto as keyof typeof walletAddresses],
        status: 'pending'
      });
      toast.success('Payment submitted! Please wait for admin approval.');
      handleCloseModal();
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error confirming payment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalCredit = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-500">Manage your funds and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Balance */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white">
              <p className="text-sm text-indigo-100 mb-1">Available Balance</p>
              <p className="text-3xl font-bold">${user?.walletBalance.toFixed(2)}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">${totalCredit.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Credits</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">${totalDebit.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Debits</p>
              </div>
            </div>

            {/* Fund Wallet */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Fund Wallet</h2>
              </div>

              <form onSubmit={handleInitiatePayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    required
                  >
                    <option value="">Choose crypto...</option>
                    {Object.keys(walletAddresses).map((crypto) => (
                      <option key={crypto} value={crypto}>{crypto}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Transaction History</h2>
              </div>

              {transactionsLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <WalletIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">No transactions yet</p>
                  <p className="text-sm text-gray-500">Your history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderLeftWidth: '3px', borderLeftColor: transaction.type === 'credit' ? '#10b981' : '#ef4444' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-2 ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.type === 'credit' ? (
                              <ArrowDownCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowUpCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Bal: ${transaction.balanceAfter.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{transaction.reference}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(transaction.status)}
                          <span className={`text-xs font-semibold uppercase ${
                            transaction.status === 'completed' ? 'text-green-600' :
                            transaction.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="bg-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Complete Payment</h2>
              <p className="text-indigo-100 text-sm">Send exactly ${amount} USD to the address below</p>
            </div>

            <div className="p-6">
              {/* Timer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className="w-4 h-4 text-orange-600" />
                  <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatTime(timer)}</p>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900">{selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">${amount} USD</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Send to:</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-900 break-all mb-2">
                    {walletAddresses[selectedCrypto as keyof typeof walletAddresses]}
                  </p>
                  <button
                    onClick={() => copyToClipboard(walletAddresses[selectedCrypto as keyof typeof walletAddresses])}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Address
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Instructions
                </h3>
                <ol className="space-y-1 text-xs text-gray-600 list-decimal list-inside">
                  <li>Send exactly ${amount} USD in {selectedCrypto}</li>
                  <li>Complete within {formatTime(timer)}</li>
                  <li>Click "I've Sent the Payment" below</li>
                  <li>Wallet credited within 10-30 minutes</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I've Sent the Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
