import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingCart,
  Wallet,
  Package,
  LogOut,
  User,
  Crown,
  Sun,
  Moon,
  Store,
  Search,
  ChevronDown,
} from 'lucide-react';
import Logo from './Logo';
import Dialog from './ui/Dialog';
import Button from './ui/Button';

const NAV_HEIGHT = 64;

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [elevated, setElevated] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
    setAccountSheetOpen(false);
  }, [location.pathname]);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
    setAccountOpen(false);
    setAccountSheetOpen(false);
  };

  const cartCount = getCartCount();
  const isActive = (path: string) => location.pathname === path;

  const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );

  const desktopLinks = [
    { to: '/store', label: 'Store', icon: Store, show: true },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, show: isAuthenticated, badge: cartCount > 0 ? cartCount : undefined },
    { to: '/wallet', label: 'Wallet', icon: Wallet, show: isAuthenticated, chip: user ? `$${user.walletBalance.toFixed(2)}` : undefined },
    { to: '/orders', label: 'Orders', icon: Package, show: isAuthenticated },
    { to: '/admin', label: 'Admin', icon: Crown, show: isAuthenticated && isAdmin, accent: true },
  ];

  const mobileTabs = [
    { to: '/store', label: 'Store', icon: Store },
    ...(isAuthenticated
      ? [
          { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
          { to: '/wallet', label: 'Wallet', icon: Wallet },
          { to: '/orders', label: 'Orders', icon: Package },
        ]
      : []),
  ];

  return (
    <>
      {/* ---------- Desktop / tablet top bar ---------- */}
      <nav
        className={`hidden lg:block sticky top-0 z-40 transition-shadow duration-200 ${
          elevated ? 'bg-canvas/85 backdrop-blur-md shadow-[var(--shadow-vault-sm)] border-b border-border' : 'bg-transparent border-b border-transparent'
        }`}
        style={{ height: NAV_HEIGHT }}
      >
        <div className="max-w-7xl mx-auto px-6 xl:px-10 h-full flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={26} />
            <span className="font-display text-[16px] font-bold tracking-tight text-ink">ShopLogs</span>
          </Link>

          <div className="flex items-center gap-1">
            {desktopLinks.filter((l) => l.show).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  isActive(l.to)
                    ? l.accent
                      ? 'bg-accent-soft text-accent'
                      : 'bg-primary-soft text-primary'
                    : 'text-ink-soft hover:text-ink hover:bg-surface-hover'
                }`}
              >
                <l.icon className="w-3.5 h-3.5" />
                {l.label}
                {l.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold">
                    {l.badge}
                  </span>
                )}
                {l.chip && (
                  <span className="bg-accent-soft text-accent text-[11px] px-1.5 py-0.5 rounded-md font-semibold">
                    {l.chip}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/store#products-section"
              aria-label="Search products"
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            <ThemeToggleButton />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-surface border border-border hover:border-border-strong transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                    {user?.name?.charAt(0).toUpperCase() ?? <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[13px] font-medium text-ink max-w-[110px] truncate">{user?.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-elevated border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-vault-md)] p-1.5 z-50 animate-scale-in origin-top-right">
                      <Link
                        to="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors"
                      >
                        <User className="w-4 h-4" /> My profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] text-error hover:bg-error-soft transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-2 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ---------- Mobile compact header ---------- */}
      <header className="lg:hidden sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-border">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">ShopLogs</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/store#products-section"
              aria-label="Search products"
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-elevated/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch">
          {mobileTabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-ink-muted"
            >
              <div className={`relative flex items-center justify-center ${isActive(tab.to) ? 'text-primary' : ''}`}>
                <tab.icon className="w-[19px] h-[19px]" strokeWidth={isActive(tab.to) ? 2.4 : 2} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-on-primary text-[9px] rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive(tab.to) ? 'text-primary' : ''}`}>{tab.label}</span>
            </Link>
          ))}

          <button
            onClick={() => setAccountSheetOpen(true)}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-ink-muted"
          >
            {isAuthenticated && user ? (
              <div className="w-[19px] h-[19px] rounded-full bg-primary-soft text-primary flex items-center justify-center text-[9px] font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-[19px] h-[19px]" strokeWidth={2} />
            )}
            <span className="text-[10px] font-medium">Account</span>
          </button>
        </div>
      </nav>

      {/* ---------- Mobile account bottom sheet ---------- */}
      <Dialog open={accountSheetOpen} onClose={() => setAccountSheetOpen(false)} title="Account">
        {isAuthenticated && user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-1 pb-4 mb-2 border-b border-border">
              <div className="w-11 h-11 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[15px] font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink truncate">{user.name}</p>
                <p className="text-[12px] text-ink-muted truncate">{user.email}</p>
              </div>
            </div>

            <Link to="/profile" onClick={() => setAccountSheetOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] text-[14px] text-ink hover:bg-surface-hover transition-colors">
              <User className="w-4 h-4 text-ink-muted" /> My profile
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setAccountSheetOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] text-[14px] text-accent hover:bg-accent-soft transition-colors">
                <Crown className="w-4 h-4" /> Admin dashboard
              </Link>
            )}
            <button onClick={toggle} className="w-full flex items-center justify-between px-3 py-3 rounded-[var(--radius-md)] text-[14px] text-ink hover:bg-surface-hover transition-colors">
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-ink-muted" /> : <Sun className="w-4 h-4 text-ink-muted" />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <span className="text-[12px] text-ink-muted">Tap to switch</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] text-[14px] text-error hover:bg-error-soft transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-muted px-1 mb-1">Sign in to access your cart, wallet and orders.</p>
            <Link to="/login" onClick={() => setAccountSheetOpen(false)}>
              <Button variant="secondary" fullWidth>Sign in</Button>
            </Link>
            <Link to="/register" onClick={() => setAccountSheetOpen(false)}>
              <Button fullWidth>Get started</Button>
            </Link>
            <button onClick={toggle} className="w-full flex items-center justify-between px-3 py-3 rounded-[var(--radius-md)] text-[14px] text-ink hover:bg-surface-hover transition-colors mt-2">
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-ink-muted" /> : <Sun className="w-4 h-4 text-ink-muted" />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <span className="text-[12px] text-ink-muted">Tap to switch</span>
            </button>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default Navbar;
