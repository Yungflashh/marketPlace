import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, ShoppingCart, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Dialog from './ui/Dialog';
import Button from './ui/Button';

const SESSION_FLAG = 'cartReminderShownAt';
const COUNTDOWN_SECONDS = 15 * 60;
const HYDRATION_DELAY_MS = 900;

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CartReminderModal: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const wasAuthedRef = useRef<boolean>(isAuthenticated);
  const timerRef = useRef<number | null>(null);

  // Reset the once-per-session flag on logout so the next login re-arms it.
  useEffect(() => {
    if (!authLoading && !isAuthenticated && wasAuthedRef.current) {
      sessionStorage.removeItem(SESSION_FLAG);
    }
    wasAuthedRef.current = isAuthenticated;
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    // Never surface on the cart/checkout screens themselves.
    if (location.pathname === '/cart') return;

    // CartProvider hydrates from the server after auth resolves; give it a
    // beat, then decide based on the hydrated cart. If still empty we simply
    // don't show — and we don't burn the session flag either, so a later
    // add-to-cart won't cause a stale trigger.
    const t = window.setTimeout(() => {
      if (cartItems.length > 0) {
        setOpen(true);
        setSecondsLeft(COUNTDOWN_SECONDS);
        sessionStorage.setItem(SESSION_FLAG, Date.now().toString());
      }
    }, HYDRATION_DELAY_MS);

    return () => window.clearTimeout(t);
    // Intentionally does not depend on cartItems — we sample once after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!open) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [open]);

  const close = () => setOpen(false);

  const handleCheckout = () => {
    close();
    navigate('/cart');
  };

  const total = getCartTotal();
  const count = getCartCount();
  const preview = cartItems.slice(0, 3);
  const remaining = cartItems.length - preview.length;
  const urgent = secondsLeft <= 60;

  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      title={
        <span className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-error" />
          Your cart is waiting
        </span>
      }
      description="Complete your order before your items are released."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Later
          </Button>
          <Button onClick={handleCheckout} icon={<ArrowRight className="w-4 h-4" />}>
            Complete order
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className={`flex items-center gap-3 p-4 rounded-[var(--radius-md)] border ${
            urgent
              ? 'bg-error-soft border-error/30'
              : 'bg-surface-hover border-border'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              urgent ? 'bg-error text-white' : 'bg-elevated text-ink'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] uppercase tracking-wide text-ink-muted font-medium">
              Time remaining
            </p>
            <p
              className={`font-display text-[26px] font-bold tabular-nums leading-none mt-0.5 ${
                urgent ? 'text-error' : 'text-ink'
              }`}
            >
              {formatTime(secondsLeft)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11.5px] text-ink-muted">Total</p>
            <p className="font-display text-[18px] font-bold text-ink">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>
                {count} {count === 1 ? 'item' : 'items'} in your cart
              </span>
            </div>
          </div>

          <ul className="space-y-2">
            {preview.map((item) => (
              <li
                key={item._id}
                className="flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] bg-surface border border-border"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-11 h-11 rounded-[var(--radius-sm)] object-contain bg-surface-hover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {item.name}
                  </p>
                  <p className="text-[11.5px] text-ink-muted">
                    Qty {item.quantity} · ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-display text-[13.5px] font-bold text-ink shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-[12px] text-ink-muted text-center py-1">
                + {remaining} more {remaining === 1 ? 'item' : 'items'}
              </li>
            )}
          </ul>
        </div>
      </div>
    </Dialog>
  );
};

export default CartReminderModal;
