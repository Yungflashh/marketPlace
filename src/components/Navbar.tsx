import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  Wallet,
  Package,
  Home,
  LogOut,
  User,
  Crown,
  Menu,
  X
} from 'lucide-react';

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-2">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ShopLogs</h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {getCartCount()}
                      </span>
                    )}
                  </div>
                  <span>Cart</span>
                </Link>

                <Link
                  to="/wallet"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                  {user && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      ${user.walletBalance.toFixed(2)}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium text-sm">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link to="/register">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-4 h-4" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {getCartCount()}
                        </span>
                      )}
                    </div>
                    <span>Cart</span>
                  </Link>

                  <Link
                    to="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4" />
                      <span>Wallet</span>
                    </div>
                    {user && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
                  >
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 bg-indigo-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium text-sm">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2.5 rounded-lg text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <button className="w-full bg-indigo-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
