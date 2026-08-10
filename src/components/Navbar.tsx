import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const ThemeToggleButton: React.FC = () => (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );

  return (
    <>
      <nav className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5 text-gray-900 dark:text-white shrink-0">
              <Logo size={22} className="text-gray-900 dark:text-white" />
              <span className="text-[17px] font-semibold tracking-tight">ShopLogs</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link to="/store" className="px-3 py-2 text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                Store
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/cart" className="relative px-3 py-2 text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1.5">
                    <div className="relative">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                          {getCartCount()}
                        </span>
                      )}
                    </div>
                    Cart
                  </Link>

                  <Link to="/wallet" className="px-3 py-2 text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Wallet
                    {user && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] px-1.5 py-0.5 rounded-md font-medium">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    )}
                  </Link>

                  <Link to="/orders" className="px-3 py-2 text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Orders
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" className="px-3 py-2 text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggleButton />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    <span className="text-[13px] font-medium">{user?.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    Get started
                  </Link>
                </>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-1">
              <ThemeToggleButton />
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div onClick={closeDrawer} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-xs bg-white dark:bg-gray-950 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <Link to="/" onClick={closeDrawer} className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Logo size={20} className="text-gray-900 dark:text-white" />
              <span className="text-base font-semibold tracking-tight">ShopLogs</span>
            </Link>
            <button onClick={closeDrawer} aria-label="Close menu" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isAuthenticated && user && (
            <Link
              to="/profile"
              onClick={closeDrawer}
              className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </Link>
          )}

          <nav className="flex-1 overflow-y-auto py-3 px-3">
            <Link to="/store" onClick={closeDrawer} className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <span className="w-5" />
              Store
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/cart" onClick={closeDrawer} className="flex items-center justify-between px-3 py-3 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </span>
                  {getCartCount() > 0 && (
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {getCartCount()}
                    </span>
                  )}
                </Link>

                <Link to="/wallet" onClick={closeDrawer} className="flex items-center justify-between px-3 py-3 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="flex items-center gap-3">
                    <Wallet className="w-4 h-4" />
                    Wallet
                  </span>
                  {user && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-md font-medium">
                      ${user.walletBalance.toFixed(2)}
                    </span>
                  )}
                </Link>

                <Link to="/orders" onClick={closeDrawer} className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <Package className="w-4 h-4" />
                  Orders
                </Link>

                {isAdmin && (
                  <Link to="/admin" onClick={closeDrawer} className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <Crown className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-gray-100 dark:border-gray-800 p-4 shrink-0 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <button
                onClick={toggle}
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label="Toggle theme"
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-white' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                    theme === 'dark' ? 'bg-gray-900 translate-x-5' : 'bg-white translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={closeDrawer} className="w-full text-center py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" onClick={closeDrawer} className="w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-full text-[15px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
