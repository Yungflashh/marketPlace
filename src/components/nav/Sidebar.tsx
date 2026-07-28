import React from 'react';
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
} from 'lucide-react';
import { type NavItem, isPathActive } from './navTypes';

const RailLink: React.FC<{ item: NavItem; active: boolean }> = ({ item, active }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      className={`group relative flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
        active ? 'bg-gold-soft text-gold' : 'text-ink-faint hover:text-ink hover:bg-surface-hover'
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      {!!item.badge && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gold text-canvas text-[10px] font-bold flex items-center justify-center">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-elevated border border-hairline-strong px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-lg">
        {item.label}
      </span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const isAdminSection = pathname.startsWith('/admin');

  const shopItems: NavItem[] = isAuthenticated
    ? [
        { to: '/', label: 'Home', icon: Home, exact: true },
        { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: getCartCount() },
        { to: '/wallet', label: 'Wallet', icon: WalletIcon },
        { to: '/orders', label: 'Orders', icon: Package },
      ]
    : [{ to: '/', label: 'Home', icon: Home, exact: true }];

  const adminItems: NavItem[] = [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/wallet', label: 'Wallets', icon: WalletIcon },
    { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];

  const items = isAdminSection ? adminItems : shopItems;

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-20 bg-surface border-r border-hairline flex-col items-center py-5 z-40">
      <Link
        to="/"
        aria-label="ShopLogs home"
        className="relative w-10 h-10 rounded-lg bg-gold flex items-center justify-center font-display font-semibold text-canvas text-lg mb-6 shrink-0"
      >
        S
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface" />
      </Link>

      <nav className="flex flex-col items-center gap-1 flex-1">
        {items.map((item) => (
          <RailLink key={item.to} item={item} active={isPathActive(pathname, item)} />
        ))}

        {isAdminSection ? (
          <>
            <div className="w-8 h-px bg-hairline my-2" />
            <RailLink item={{ to: '/', label: 'Exit to store', icon: Store }} active={false} />
          </>
        ) : (
          isAdmin && (
            <>
              <div className="w-8 h-px bg-hairline my-2" />
              <RailLink item={{ to: '/admin', label: 'Admin panel', icon: Crown }} active={false} />
            </>
          )
        )}
      </nav>

      <div className="flex flex-col items-center gap-2 shrink-0">
        {isAuthenticated ? (
          <>
            <div
              title={user?.name}
              className="w-9 h-9 rounded-full bg-gold-soft text-gold flex items-center justify-center text-[11px] font-bold select-none"
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="w-11 h-11 rounded-lg flex items-center justify-center text-ink-faint hover:text-danger hover:bg-danger-soft transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </>
        ) : (
          <>
            <RailLink item={{ to: '/login', label: 'Sign in', icon: LogIn }} active={pathname === '/login'} />
            <RailLink item={{ to: '/register', label: 'Register', icon: UserPlus }} active={pathname === '/register'} />
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
