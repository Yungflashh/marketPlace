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
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Badge,
  Modal,
  StatCard,
  PageHeader,
  EmptyState,
  Skeleton,
  Container,
} from '../components/ui';

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

  const totalCredit = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader eyebrow="Balance" title="My wallet" description="Manage your funds and transactions" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Left Column - Balance & Fund */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Card */}
          <div className="rounded-xl border border-hairline-strong bg-canvas-raised p-6">
            <div className="flex items-center gap-2 mb-4">
              <WalletIcon className="w-4 h-4 text-gold" />
              <p className="text-[13px] font-medium text-ink-faint">Available balance</p>
            </div>
            <p className="font-display text-[40px] leading-none text-ink">${user?.walletBalance.toFixed(2)}</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<TrendingUp />} tone="success" value={`$${totalCredit.toFixed(2)}`} label="Total credits" />
            <StatCard icon={<TrendingDown />} tone="error" value={`$${totalDebit.toFixed(2)}`} label="Total debits" />
          </div>

          {/* Fund Wallet Card */}
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-5">Fund wallet</h2>

            <form onSubmit={handleInitiatePayment} className="space-y-4">
              <Input
                label="Amount to add (USD)"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                icon={<DollarSign />}
                required
              />

              <Select
                label="Payment method"
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                required
              >
                <option value="">Choose crypto…</option>
                {Object.keys(walletAddresses).map((crypto) => (
                  <option key={crypto} value={crypto}>{crypto}</option>
                ))}
              </Select>

              <Button type="submit" fullWidth icon={<CreditCard />}>
                Proceed to payment
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-6">Transaction history</h2>

            {transactionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={<WalletIcon />}
                title="No transactions yet"
                description="Your transaction history will appear here once you fund your wallet."
              />
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="rounded-lg border border-hairline bg-canvas-raised p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`rounded-lg p-2 shrink-0 ${
                            transaction.type === 'credit' ? 'bg-success-soft' : 'bg-danger-soft'
                          }`}
                        >
                          {transaction.type === 'credit' ? (
                            <ArrowDownCircle className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowUpCircle className="w-4 h-4 text-danger" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">{transaction.description}</p>
                          <div className="flex items-center gap-1.5 text-xs text-ink-faint mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-display text-lg ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-ink-faint">Balance: ${transaction.balanceAfter.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-hairline">
                      <div className="flex items-center gap-1.5 text-xs text-ink-faint font-mono min-w-0">
                        <Hash className="w-3 h-3 shrink-0" />
                        <span className="truncate">{transaction.reference}</span>
                      </div>
                      <Badge tone={statusTone(transaction.status)} icon={getStatusIcon(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={handleCloseModal}
        title="Complete payment"
        description={`Send exactly $${amount} USD to the address below`}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal} fullWidth className="sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmPayment}
              loading={loading}
              icon={<CheckCircle2 />}
              fullWidth
              className="sm:w-auto"
            >
              I've sent the payment
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Timer */}
          <div className="bg-warning-soft border border-warning/20 rounded-lg p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Timer className="w-4 h-4 text-warning" />
              <p className="text-xs font-semibold text-ink-muted">Time remaining</p>
            </div>
            <p className="font-display text-3xl text-warning">{formatTime(timer)}</p>
          </div>

          {/* Payment Details */}
          <div className="rounded-lg border border-hairline p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-faint">Payment method</span>
              <span className="font-semibold text-ink">{selectedCrypto}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-faint">Amount</span>
              <span className="font-semibold text-ink">${amount} USD</span>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-2">Send to this address</label>
            <div className="bg-canvas-raised border border-hairline rounded-lg p-3.5">
              <p className="text-sm font-mono text-ink break-all mb-3">
                {walletAddresses[selectedCrypto as keyof typeof walletAddresses]}
              </p>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Copy />}
                onClick={() => copyToClipboard(walletAddresses[selectedCrypto as keyof typeof walletAddresses])}
              >
                Copy address
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-info-soft border border-info/20 rounded-lg p-4">
            <h3 className="font-semibold text-ink mb-2.5 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-info" />
              Important instructions
            </h3>
            <ul className="space-y-1.5 text-sm text-ink-muted">
              <li>1. Send exactly ${amount} USD equivalent in {selectedCrypto}</li>
              <li>2. Complete the transaction within {formatTime(timer)}</li>
              <li>3. After sending, click "I've sent the payment" below</li>
              <li>4. Your wallet will be credited within 10-30 minutes after confirmation</li>
            </ul>
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default Wallet;
