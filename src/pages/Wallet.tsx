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
  Banknote,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const TXN_PAGE_SIZE = 10;

interface PaymentMethod {
  _id: string;
  label: string;
  type: 'crypto' | 'paypal' | 'cashapp' | 'zelle' | 'bank' | 'other';
  address: string;
  network?: string;
  instructions?: string;
}

const destinationLabel = (type?: string): string => {
  switch (type) {
    case 'paypal':  return 'PayPal email';
    case 'cashapp': return 'Cashtag';
    case 'zelle':   return 'Zelle email/phone';
    case 'bank':    return 'Bank details';
    case 'other':   return 'Destination';
    default:        return 'Wallet address';
  }
};

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [timer, setTimer] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const selectedMethod = paymentMethods.find(m => m.label === selectedCrypto);

  useEffect(() => { fetchTransactions(); fetchPaymentMethods(); }, []);

  const fetchPaymentMethods = async (): Promise<void> => {
    try {
      const res = await api.get('/payment-methods');
      setPaymentMethods(res.data.data ?? []);
    } catch {
      // silent — dropdown just stays empty if BE is down
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      toast.error('Payment time expired. Please try again.');
      closePaymentModal();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.data.transactions);
    } catch {
      toast.error('Error fetching transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const openPaymentModal = (e: React.FormEvent): void => {
    e.preventDefault();
    const fundAmount = parseFloat(amount);
    if (!fundAmount || fundAmount <= 0) { toast.error('Please enter a valid amount'); return; }
    if (!selectedCrypto) { toast.error('Please select a payment method'); return; }
    setShowPaymentModal(true);
    setTimer(600);
    setTimerActive(true);
    requestAnimationFrame(() => setModalVisible(true));
  };

  const closePaymentModal = (): void => {
    setModalVisible(false);
    setTimeout(() => {
      setShowPaymentModal(false);
      setTimerActive(false);
      setTimer(600);
      setAmount('');
      setSelectedCrypto('');
    }, 200);
  };

  const handleConfirmPayment = async (): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/wallet/fund', {
        amount: parseFloat(amount),
        paymentMethod: selectedCrypto,
        walletAddress: selectedMethod?.address,
        status: 'pending',
      });
      toast.success('Payment submitted! Awaiting admin approval.');
      closePaymentModal();
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error confirming payment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const totalCredit = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);

  const txnTotalPages = Math.ceil(transactions.length / TXN_PAGE_SIZE);
  const paginatedTxns = transactions.slice((txnPage - 1) * TXN_PAGE_SIZE, txnPage * TXN_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your funds and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Balance Card */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <p className="text-sm text-gray-400 mb-1">Available Balance</p>
              <p className="text-3xl font-bold">${user?.walletBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-3">Wallet balance — use it to checkout</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <TrendingUp className="w-4 h-4 text-green-500 mb-2" />
                <p className="text-base font-bold text-gray-900">${totalCredit.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Total credits</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <TrendingDown className="w-4 h-4 text-red-400 mb-2" />
                <p className="text-base font-bold text-gray-900">${totalDebit.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Total debits</p>
              </div>
            </div>

            {/* Fund Wallet */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-4 h-4 text-green-600" />
                <h2 className="font-semibold text-gray-900 text-sm">Fund Wallet</h2>
              </div>

              <form onSubmit={openPaymentModal} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment method</label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    required
                    disabled={paymentMethods.length === 0}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {paymentMethods.length === 0 ? 'No payment methods available' : 'Choose payment method...'}
                    </option>
                    {paymentMethods.map(m => (
                      <option key={m._id} value={m.label}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to payment
                </button>
              </form>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Transaction History</h2>
                </div>
                {transactions.length > 0 && (
                  <span className="text-xs text-gray-400">{transactions.length} total</span>
                )}
              </div>

              {transactionsLoading ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <WalletIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="font-medium text-gray-900 text-sm">No transactions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your history will appear here</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedTxns.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{ borderLeftWidth: '3px', borderLeftColor: transaction.type === 'credit' ? '#10b981' : '#ef4444' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-lg p-1.5 ${transaction.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                              {transaction.type === 'credit'
                                ? <ArrowDownCircle className="w-4 h-4 text-green-600" />
                                : <ArrowUpCircle className="w-4 h-4 text-red-500" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(transaction.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">Bal: ${transaction.balanceAfter.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{transaction.reference}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(transaction.status)}
                            <span className={`text-xs font-semibold uppercase ${
                              transaction.status === 'completed' ? 'text-green-600'
                              : transaction.status === 'failed' ? 'text-red-500'
                              : 'text-yellow-500'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {txnTotalPages > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Page {txnPage} of {txnTotalPages} — {transactions.length} transactions
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTxnPage(p => Math.max(1, p - 1))}
                          disabled={txnPage === 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: txnTotalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === txnTotalPages || Math.abs(p - txnPage) <= 1)
                          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                            acc.push(p); return acc;
                          }, [])
                          .map((p, i) => p === '...'
                            ? <span key={`e-${i}`} className="px-1 text-gray-300 text-sm">…</span>
                            : <button key={p} onClick={() => setTxnPage(p as number)}
                                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${txnPage === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {p}
                              </button>
                          )}
                        <button
                          onClick={() => setTxnPage(p => Math.min(txnTotalPages, p + 1))}
                          disabled={txnPage === txnTotalPages}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !loading) closePaymentModal(); }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className={`bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ${modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gray-900 text-white p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Complete Payment</h2>
                <p className="text-gray-400 text-sm mt-0.5">Send exactly ${amount} USD to the destination below</p>
              </div>
              <button onClick={closePaymentModal} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Timer */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-medium text-gray-600">Time remaining</p>
                </div>
                <p className="text-2xl font-bold text-orange-500">{formatTime(timer)}</p>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900">{selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">${amount} USD</span>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {destinationLabel(selectedMethod?.type)}:
                </label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-xs font-mono text-gray-900 break-all mb-2 whitespace-pre-wrap">
                    {selectedMethod?.address}
                  </p>
                  {selectedMethod?.instructions && (
                    <p className="text-xs text-gray-500 mb-2">{selectedMethod.instructions}</p>
                  )}
                  <button
                    onClick={() => selectedMethod && copyToClipboard(selectedMethod.address)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  Instructions
                </h3>
                <ol className="space-y-1 text-xs text-gray-600 list-decimal list-inside">
                  <li>Send exactly ${amount} USD via {selectedCrypto}</li>
                  <li>Complete within {formatTime(timer)}</li>
                  <li>Click "I've sent the payment" below</li>
                  <li>Wallet credited within 10–30 minutes</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closePaymentModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-full font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-full font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> I've sent the payment</>
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
