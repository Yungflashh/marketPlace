import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Shield, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-white mb-4">
              <Logo size={20} className="text-white" />
              <span className="text-[17px] font-semibold tracking-tight">ShopLogs</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              The trusted marketplace for premium bank logs and financial accounts — verified, fresh, and delivered instantly.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5" />
              <span>256-bit encrypted transactions</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Store</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Logs', to: '/store' },
                { label: 'My Orders', to: '/orders' },
                { label: 'My Wallet', to: '/wallet' },
                { label: 'My Cart', to: '/cart' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Sign In', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'My Profile', to: '/profile' },
                { label: 'Forgot Password', to: '/forgot-password' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Payment */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a href="mailto:support@shoplogshere.com" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  support@shoplogshere.com
                </a>
              </li>
            </ul>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">We Accept</h4>
            <div className="flex flex-wrap gap-2">
              {['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)'].map(m => (
                <span key={m} className="px-2.5 py-1 bg-gray-900 text-gray-400 text-[11px] font-medium rounded-md border border-gray-800">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {year} ShopLogs. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>For educational &amp; research purposes only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
