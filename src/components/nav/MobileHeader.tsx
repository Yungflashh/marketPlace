import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, User } from 'lucide-react';

const MobileHeader: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <header className="lg:hidden sticky top-0 z-40 h-14 bg-canvas/95 backdrop-blur border-b border-hairline flex items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-gold flex items-center justify-center font-display font-semibold text-canvas text-sm">
          S
        </span>
        <span className="font-display text-[15px] font-medium text-ink">ShopLogs</span>
      </Link>

      <div className="flex items-center gap-1">
        {isAuthenticated ? (
          <>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-gold text-canvas text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-full bg-gold-soft text-gold flex items-center justify-center text-[11px] font-bold ml-1 select-none">
              {initials}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            aria-label="Sign in"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted"
          >
            <User className="w-[18px] h-[18px]" />
          </Link>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
