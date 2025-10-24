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
  X,
  Sparkles
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
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-2.5 group-hover:scale-110 transition-transform shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Marketplace
              </h2>
              <p className="text-xs text-gray-500 -mt-1">Shop with confidence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-all group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link 
                  to="/cart" 
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-all group"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {getCartCount()}
                      </span>
                    )}
                  </div>
                  <span>Cart</span>
                </Link>
                
                {/* Wallet */}
                <Link 
                  to="/wallet" 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 font-semibold transition-all group"
                >
                  <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Wallet</span>
                  {user && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                      ${user.walletBalance.toFixed(2)}
                    </span>
                  )}
                </Link>
                
                {/* Orders */}
                <Link 
                  to="/orders" 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-semibold transition-all group"
                >
                  <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Orders</span>
                </Link>
                
                {/* Admin Button */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-4 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl group"
                  >
                    <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Admin</span>
                  </Link>
                )}
                
                {/* User Profile & Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-100">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-1.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-900 font-bold text-sm">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl group"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link to="/register">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl group">
                    <Sparkles className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-down">
            <div className="space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/cart" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-all"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {getCartCount()}
                        </span>
                      )}
                    </div>
                    <span>Cart</span>
                  </Link>
                  
                  <Link 
                    to="/wallet" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 font-semibold transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5" />
                      <span>Wallet</span>
                    </div>
                    {user && (
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    to="/orders" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-semibold transition-all"
                  >
                    <Package className="w-5 h-5" />
                    <span>Orders</span>
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-3 rounded-xl font-bold transition-all"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-indigo-50 rounded-xl">
                      <User className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-900 font-bold">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold transition-all">
                      <Sparkles className="w-4 h-4" />
                      <span>Register</span>
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