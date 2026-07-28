import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Home,
  ShoppingCart,
  Wallet as WalletIcon,
  Package,
  LayoutGrid,
  ArrowLeftRight,
  Bell,
  Crown,
  LogOut,
  Store,
  LogIn,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { type NavItem, isPathActive } from './navTypes';

const Tab: React.FC<{ item: NavItem; active: boolean }> = ({ item, active }) => {
  const Icon = item.icon;
  return (
    <Link to={item.to} className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full">
      <span className="relative">
        <Icon className={`w-5 h-5 ${active ? 'text-gold' : 'text-ink-faint'}`} />
        {!!item.badge && (
          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-gold text-canvas text-[9px] font-bold flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>
      <span className={`text-[10px] font-medium ${active ? 'text-gold' : 'text-ink-faint'}`}>{item.label}</span>
    </Link>
  );
};

const MoreTab: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button onClick={onClick} className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full">
    <MoreHorizontal className={`w-5 h-5 ${active ? 'text-gold' : 'text-ink-faint'}`} />
    <span className={`text-[10px] font-medium ${active ? 'text-gold' : 'text-ink-faint'}`}>More</span>
  </button>
);

const barClass =
  'lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-surface border-t border-hairline flex pb-[env(safe-area-inset-bottom)]';

const sheetLinkClass =
  'flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium text-ink hover:bg-surface-hover transition-colors';

const BottomTabBar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdminSection = pathname.startsWith('/admin');

  const handleLogout = (): void => {
    setMoreOpen(false);
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    const items: NavItem[] = [
      { to: '/', label: 'Home', icon: Home, exact: true },
      { to: '/login', label: 'Sign in', icon: LogIn },
      { to: '/register', label: 'Register', icon: UserPlus },
    ];
    return (
      <nav className={barClass}>
        {items.map((item) => (
          <Tab key={item.to} item={item} active={isPathActive(pathname, item)} />
        ))}
      </nav>
    );
  }

  if (isAdminSection) {
    const items: NavItem[] = [
      { to: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/wallet', label: 'Wallets', icon: WalletIcon },
    ];
    return (
      <>
        <nav className={barClass}>
          {items.map((item) => (
            <Tab key={item.to} item={item} active={isPathActive(pathname, item)} />
          ))}
          <MoreTab active={moreOpen} onClick={() => setMoreOpen(true)} />
        </nav>

        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Admin menu" size="sm">
          <div className="space-y-1">
            <Link to="/admin/transactions" onClick={() => setMoreOpen(false)} className={sheetLinkClass}>
              <ArrowLeftRight className="w-[18px] h-[18px] text-ink-faint" /> Transactions
            </Link>
            <Link to="/admin/notifications" onClick={() => setMoreOpen(false)} className={sheetLinkClass}>
              <Bell className="w-[18px] h-[18px] text-ink-faint" /> Notifications
            </Link>
            <Link to="/" onClick={() => setMoreOpen(false)} className={sheetLinkClass}>
              <Store className="w-[18px] h-[18px] text-ink-faint" /> Exit to store
            </Link>
            <div className="pt-2 mt-1 border-t border-hairline">
              <Button variant="secondary" fullWidth icon={<LogOut />} onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  const items: NavItem[] = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: getCartCount() },
    { to: '/wallet', label: 'Wallet', icon: WalletIcon },
    { to: '/orders', label: 'Orders', icon: Package },
  ];

  return (
    <>
      <nav className={barClass}>
        {items.map((item) => (
          <Tab key={item.to} item={item} active={isPathActive(pathname, item)} />
        ))}
        <MoreTab active={moreOpen} onClick={() => setMoreOpen(true)} />
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Account" size="sm">
        <div className="space-y-1">
          {isAdmin && (
            <Link to="/admin" onClick={() => setMoreOpen(false)} className={sheetLinkClass}>
              <Crown className="w-[18px] h-[18px] text-ink-faint" /> Admin panel
            </Link>
          )}
          <div className="pt-2 mt-1 border-t border-hairline">
            <Button variant="secondary" fullWidth icon={<LogOut />} onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BottomTabBar;
