import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Wallet,
  Package,
  LogOut,
  User,
  Crown,
  Menu,
  X
} from 'lucide-react';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-gray-900 shrink-0">
            <Logo size={22} className="text-gray-900" />
            <span className="text-[17px] font-semibold tracking-tight">ShopLogs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/store"
              className="px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              Store
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  className="relative px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <div className="relative">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                        {getCartCount()}
                      </span>
                    )}
                  </div>
                  Cart
                </Link>

                <Link
                  to="/wallet"
                  className="px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Wallet
                  {user && (
                    <span className="bg-gray-100 text-gray-700 text-[11px] px-1.5 py-0.5 rounded-md font-medium">
                      ${user.walletBalance.toFixed(2)}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className="px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  Orders
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[13px] font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3">
            <div className="space-y-0.5">
              <Link
                to="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Store
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Cart</span>
                    </div>
                    {getCartCount() > 0 && (
                      <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4" />
                      <span>Wallet</span>
                    </div>
                    {user && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md font-medium">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="pt-3 mt-2 border-t border-gray-100 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[15px] text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2 px-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-gray-900 text-white py-2.5 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
