import React, { useState } from 'react';
import { Package, Wallet, ShoppingBag, CheckCircle2, Plus } from 'lucide-react';

type Tab = 'browse' | 'wallet' | 'orders';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'browse', label: 'Browse', icon: Package },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
];

const MOCK_LOGS = [
  { name: 'Chase Business', category: 'Bank log', price: '129.00' },
  { name: 'PayPal Verified', category: 'PayPal log', price: '64.00' },
  { name: 'Wells Fargo Premier', category: 'Bank log', price: '210.00' },
];

const BrowsePreview: React.FC = () => (
  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
    {MOCK_LOGS.map((log, i) => (
      <div
        key={log.name}
        className="animate-card-float bg-canvas border border-border rounded-[var(--radius-md)] overflow-hidden"
        style={{ animationDelay: `${i * 0.5}s` }}
      >
        <div
          className="aspect-square"
          style={{ background: `color-mix(in srgb, var(--vault-primary) ${10 + i * 6}%, var(--vault-surface-hover))` }}
        />
        <div className="p-2 sm:p-2.5">
          <p className="text-[9px] text-ink-muted uppercase tracking-wide truncate">{log.category}</p>
          <p className="text-[10.5px] sm:text-[11.5px] font-semibold text-ink truncate mb-1">{log.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] sm:text-[12px] font-bold text-ink">${log.price}</span>
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Plus className="w-2.5 h-2.5" strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const WalletPreview: React.FC = () => (
  <div>
    <div className="rounded-[var(--radius-lg)] p-4 sm:p-5 text-white mb-3" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
      <p className="text-[10px] text-white/45 mb-1">Available balance</p>
      <p className="font-display text-[22px] sm:text-[26px] font-extrabold">$2,480.00</p>
    </div>
    <div className="space-y-2">
      {[
        { label: 'Wallet funded', amount: '+$500.00', tone: 'text-success' },
        { label: 'Chase Business log', amount: '-$129.00', tone: 'text-error' },
      ].map((row) => (
        <div key={row.label} className="flex items-center justify-between px-3 py-2.5 bg-canvas border border-border rounded-[var(--radius-md)]">
          <span className="text-[11px] sm:text-[12px] text-ink-soft">{row.label}</span>
          <span className={`text-[11px] sm:text-[12px] font-bold ${row.tone}`}>{row.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const OrdersPreview: React.FC = () => (
  <div className="space-y-2.5">
    {[
      { id: '#SL-8821', item: 'Chase Business — 1 log', status: 'Delivered' },
      { id: '#SL-8804', item: 'PayPal Verified — 1 log', status: 'Delivered' },
    ].map((order) => (
      <div key={order.id} className="p-3 sm:p-3.5 bg-canvas border border-border rounded-[var(--radius-md)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] font-mono text-ink-muted">{order.id}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success-soft px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> {order.status}
          </span>
        </div>
        <p className="text-[11.5px] sm:text-[12.5px] font-medium text-ink">{order.item}</p>
      </div>
    ))}
  </div>
);

const ProductPreview: React.FC = () => {
  const [tab, setTab] = useState<Tab>('browse');

  return (
    <div className="bg-surface border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-vault-lg)] overflow-hidden">
      <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 sm:pt-4 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[12px] sm:text-[13px] font-medium transition-colors ${
              tab === t.id ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {tab === t.id && <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-primary rounded-full" />}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-6 bg-surface-hover/40">
        {tab === 'browse' && <BrowsePreview />}
        {tab === 'wallet' && <WalletPreview />}
        {tab === 'orders' && <OrdersPreview />}
      </div>
    </div>
  );
};

export default ProductPreview;
