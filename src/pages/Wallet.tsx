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
} from 'lucide-react';
import Card from '../components/ui/Card';
import StatTile from '../components/ui/StatTile';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import Dialog from '../components/ui/Dialog';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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
    case 'paypal': return 'PayPal email';
    case 'cashapp': return 'Cashtag';
    case 'zelle': return 'Zelle email/phone';
    case 'bank': return 'Bank details';
    case 'other': return 'Destination';
    default: return 'Wallet address';
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
  const [timer, setTimer] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const selectedMethod = paymentMethods.find((m) => m.label === selectedCrypto);

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
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
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
  };

  const closePaymentModal = (): void => {
    setShowPaymentModal(false);
    setTimerActive(false);
    setTimer(600);
    setAmount('');
    setSelectedCrypto('');
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
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case 'failed': return <XCircle className="w-3.5 h-3.5 text-error" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-warning" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-ink-muted" />;
    }
  };

  const totalCredit = transactions.filter((t) => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter((t) => t.type === 'debit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);

  const txnTotalPages = Math.ceil(transactions.length / TXN_PAGE_SIZE) || 1;
  const paginatedTxns = transactions.slice((txnPage - 1) * TXN_PAGE_SIZE, txnPage * TXN_PAGE_SIZE);

  return (
    <div className="bg-canvas py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">My wallet</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">Manage your funds and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-[var(--radius-lg)] p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--vault-primary), transparent 70%)' }} />
              <div className="relative">
                <p className="text-[12px] text-white/50 mb-1 flex items-center gap-1.5">
                  <WalletIcon className="w-3.5 h-3.5" /> Available balance
                </p>
                <p className="font-display text-[32px] font-extrabold">${user?.walletBalance.toFixed(2)}</p>
                <p className="text-[11.5px] text-white/40 mt-3">Use your balance to check out instantly — no card needed.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Total credits" value={`$${totalCredit.toFixed(2)}`} icon={<TrendingUp className="w-4 h-4" />} tone="success" />
              <StatTile label="Total debits" value={`$${totalDebit.toFixed(2)}`} icon={<TrendingDown className="w-4 h-4" />} tone="error" />
            </div>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-4 h-4 text-success" />
                <h2 className="font-display font-bold text-ink text-[14px]">Fund wallet</h2>
              </div>

              <form onSubmit={openPaymentModal} className="space-y-3.5">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Amount (USD)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Payment method</label>
                  <Select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    required
                    disabled={paymentMethods.length === 0}
                  >
                    <option value="">
                      {paymentMethods.length === 0 ? 'No payment methods available' : 'Choose payment method...'}
                    </option>
                    {paymentMethods.map((m) => (
                      <option key={m._id} value={m.label}>{m.label}</option>
                    ))}
                  </Select>
                </div>

                <Button type="submit" fullWidth icon={<CreditCard className="w-4 h-4" />}>
                  Proceed to payment
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-muted" />
                  <h2 className="font-display font-bold text-ink text-[15px]">Transaction history</h2>
                </div>
                {transactions.length > 0 && (
                  <span className="text-[11.5px] text-ink-muted">{transactions.length} total</span>
                )}
              </div>

              {transactionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-md)]" />)}
                </div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={<WalletIcon className="w-6 h-6" />}
                  title="No transactions yet"
                  description="Your funding and spending history will appear here."
                />
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedTxns.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="p-4 border border-border rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors"
                        style={{ borderLeftWidth: '3px', borderLeftColor: transaction.type === 'credit' ? 'var(--vault-success)' : 'var(--vault-error)' }}
                      >
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`rounded-[var(--radius-sm)] p-1.5 shrink-0 ${transaction.type === 'credit' ? 'bg-success-soft' : 'bg-error-soft'}`}>
                              {transaction.type === 'credit'
                                ? <ArrowDownCircle className="w-4 h-4 text-success" />
                                : <ArrowUpCircle className="w-4 h-4 text-error" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-ink text-[13px] truncate">{transaction.description}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(transaction.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-display font-bold text-[14px] ${transaction.type === 'credit' ? 'text-success' : 'text-error'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-ink-muted">Bal: ${transaction.balanceAfter.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{transaction.reference}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(transaction.status)}
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                              {transaction.status}
                            </span>
                          </div>
                        </div>

                        {transaction.status === 'failed' && transaction.rejectionReason && (
                          <div className="mt-2 border border-error/30 bg-error-soft rounded-[var(--radius-sm)] px-3 py-2">
                            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-error mb-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Reason for rejection
                            </p>
                            <p className="text-[12px] text-ink-soft whitespace-pre-wrap break-words">
                              {transaction.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {txnTotalPages > 1 && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
                      <p className="text-[11.5px] text-ink-muted">
                        Page {txnPage} of {txnTotalPages} — {transactions.length} transactions
                      </p>
                      <Pagination page={txnPage} totalPages={txnTotalPages} onChange={setTxnPage} />
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      <Dialog
        open={showPaymentModal}
        onClose={() => { if (!loading) closePaymentModal(); }}
        title="Complete payment"
        description={`Send exactly $${amount} USD to the destination below`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-warning-soft border border-warning/20 rounded-[var(--radius-md)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-warning" />
              <p className="text-[11.5px] font-medium text-ink-muted">Time remaining</p>
            </div>
            <p className="font-display text-[24px] font-bold text-warning">{formatTime(timer)}</p>
          </div>

          <div className="bg-surface-hover rounded-[var(--radius-md)] p-4 space-y-2 text-[13.5px]">
            <div className="flex justify-between">
              <span className="text-ink-muted">Method</span>
              <span className="font-medium text-ink">{selectedCrypto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Amount</span>
              <span className="font-medium text-ink">${amount} USD</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
              {destinationLabel(selectedMethod?.type)}:
            </label>
            <div className="bg-surface-hover border border-border rounded-[var(--radius-md)] p-3">
              <p className="text-[11.5px] font-mono text-ink break-all mb-2 whitespace-pre-wrap">
                {selectedMethod?.address}
              </p>
              {selectedMethod?.instructions && (
                <p className="text-[11.5px] text-ink-muted mb-2">{selectedMethod.instructions}</p>
              )}
              <Button
                onClick={() => selectedMethod && copyToClipboard(selectedMethod.address)}
                fullWidth
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-surface-hover border border-border rounded-[var(--radius-md)] p-4">
            <h3 className="font-medium text-ink text-[13px] mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-ink-muted" />
              Instructions
            </h3>
            <ol className="space-y-1 text-[11.5px] text-ink-muted list-decimal list-inside">
              <li>Send exactly ${amount} USD via {selectedCrypto}</li>
              <li>Complete within {formatTime(timer)}</li>
              <li>Click "I've sent the payment" below</li>
              <li>Wallet credited within 10–30 minutes</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={closePaymentModal} fullWidth>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              loading={loading}
              fullWidth
              className="!bg-success hover:!bg-success"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              I've sent the payment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Wallet;
