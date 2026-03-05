import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Sparkles,
  PiggyBank,
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
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
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
      let interval: ReturnType<typeof setInterval>;     if (timerActive && timer > 0) {
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
      const response = await axios.get('https://marketplc-be-c2a5.onrender.com/api/wallet/transactions');
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
      await axios.post('https://marketplc-be-c2a5.onrender.com/api/wallet/fund', { 
        amount: fundAmount,
        paymentMethod: selectedCrypto,
        walletAddress: walletAddresses[selectedCrypto as keyof typeof walletAddresses],
        status: 'pending' // Set initial status as pending
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
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalCredit = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebit = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600">Manage your funds and transactions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance & Fund */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <PiggyBank className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-semibold text-gray-600">Available Balance</p>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-6 h-6 opacity-80" />
                    <WalletIcon className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-5xl font-extrabold mb-1">
                    ${user?.walletBalance.toFixed(2)}
                  </p>
                  <p className="text-indigo-100 text-sm">Your total balance</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 rounded-lg p-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalCredit.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Credits</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-100 rounded-lg p-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalDebit.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Debits</p>
              </div>
            </div>

            {/* Fund Wallet Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Fund Wallet</h2>
              </div>
              
              <form onSubmit={handleInitiatePayment}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amount to Add (USD)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all text-gray-700 placeholder-gray-400 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Crypto Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-700 font-semibold"
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
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-8">
                <Clock className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              </div>

              {transactionsLoading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <WalletIcon className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <WalletIcon className="w-12 h-12 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">No transactions yet</p>
                  <p className="text-gray-500 text-lg">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-l-4 hover:shadow-lg transition-all"
                      style={{
                        borderLeftColor: transaction.type === 'credit' ? '#10b981' : '#ef4444'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowDownCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <ArrowUpCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg mb-1">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold mb-1 ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Balance: ${transaction.balanceAfter.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{transaction.reference}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`text-xs font-bold uppercase tracking-wide ${
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl">
              <h2 className="text-3xl font-bold mb-2">Complete Payment</h2>
              <p className="text-indigo-100">Send exactly ${amount} USD to the address below</p>
            </div>

            <div className="p-8">
              {/* Timer */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Timer className="w-6 h-6 text-orange-600" />
                  <p className="text-sm font-semibold text-gray-700">Time Remaining</p>
                </div>
                <p className="text-4xl font-extrabold text-center text-orange-600">
                  {formatTime(timer)}
                </p>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Complete payment within this time
                </p>
              </div>

              {/* Payment Details */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-600 rounded-xl p-2">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Payment Method</p>
                    <p className="text-xl font-bold text-gray-900">{selectedCrypto}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-xl p-2">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Amount</p>
                    <p className="text-xl font-bold text-gray-900">${amount} USD</p>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Send to this address:
                </label>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-mono text-gray-900 break-all mb-3">
                    {walletAddresses[selectedCrypto as keyof typeof walletAddresses]}
                  </p>
                  <button
                    onClick={() => copyToClipboard(walletAddresses[selectedCrypto as keyof typeof walletAddresses])}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Address
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Important Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Send exactly ${amount} USD equivalent in {selectedCrypto}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Complete the transaction within {formatTime(timer)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>After sending, click "I've Sent the Payment" below</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Your wallet will be credited within 10-30 minutes after confirmation</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
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
