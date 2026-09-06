import React, { useState } from 'react';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CONFETTI = ['🎉', '✨', '🎁', '💰', '⭐', '🎊', '💫'];
const CONFETTI_COUNT = 24;

const WelcomeBonusBanner: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const shouldShow =
    !!user &&
    !!user.welcomeBonusAwardedAt &&
    !user.welcomeBonusAcknowledged;

  if (!shouldShow) return null;

  const handleClaim = async () => {
    try {
      setClaiming(true);
      const res = await api.post('/auth/acknowledge-welcome-bonus');
      updateUser(res.data.data.user);
      toast.success('Enjoy your $5 — happy shopping!');
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#09090C]/70 backdrop-blur-sm animate-fade-in" />

      {/* Confetti layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
          const emoji = CONFETTI[i % CONFETTI.length];
          const left = (i * 4.16) % 100;
          const delay = (i % 8) * 0.15;
          const duration = 3 + ((i * 7) % 4);
          const rotate = (i * 47) % 360;
          return (
            <span
              key={i}
              className="absolute text-2xl select-none"
              style={{
                left: `${left}%`,
                top: '-40px',
                animation: `confetti-fall ${duration}s linear ${delay}s infinite`,
                transform: `rotate(${rotate}deg)`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-elevated border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-vault-lg)] overflow-hidden [animation:vault-scale-in_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <div
          className="relative px-6 pt-10 pb-6 text-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% -20%, var(--vault-primary), transparent 60%), linear-gradient(135deg, #1B1930, #0B0B10)',
          }}
        >
          <div className="absolute top-3 left-3">
            <Sparkles className="w-4 h-4 text-white/40" />
          </div>
          <div className="absolute top-3 right-3">
            <Sparkles className="w-4 h-4 text-white/40" />
          </div>

          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur mb-4 animate-bounce-soft">
            <Gift className="w-9 h-9 text-white" strokeWidth={2.2} />
          </div>

          <p className="text-[11.5px] font-semibold uppercase tracking-widest text-white/60 mb-2">
            Welcome bonus
          </p>
          <h2 className="font-display text-white text-[38px] font-bold leading-none mb-2">
            $5.00
          </h2>
          <p className="text-[13px] text-white/70 max-w-xs mx-auto">
            has been credited to your wallet — our thank-you for joining ShopLogs.
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-[var(--radius-md)]">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Ready to spend</p>
              <p className="text-[11.5px] text-ink-muted">
                Browse the store and check out — the $5 is already in your wallet.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] bg-primary text-on-primary font-semibold text-[14px] hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {claiming ? 'Saving…' : 'Awesome, let me shop!'}
            {!claiming && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-soft { animation: bounce-soft 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default WelcomeBonusBanner;
