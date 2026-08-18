import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ShieldCheck, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'Store',
      links: [
        { label: 'Browse logs', to: '/store' },
        { label: 'My orders', to: '/orders' },
        { label: 'My wallet', to: '/wallet' },
        { label: 'My cart', to: '/cart' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign in', to: '/login' },
        { label: 'Register', to: '/register' },
        { label: 'My profile', to: '/profile' },
        { label: 'Forgot password', to: '/forgot-password' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0B0B10] text-[#8B899A] mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2.5 text-white mb-4">
              <Logo size={24} />
              <span className="font-display text-[16px] font-bold tracking-tight">ShopLogs</span>
            </Link>
            <p className="text-[13.5px] leading-relaxed text-[#79778A] mb-5 max-w-xs">
              A trusted vault for premium bank logs and financial accounts — verified, fresh, and delivered instantly.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[#8579FF] bg-[#1B1930] px-2.5 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              256-bit encrypted transactions
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-[12px] font-semibold mb-4 uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-[13.5px] text-[#8B899A] hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-white text-[12px] font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <a href="mailto:support@shoplogshere.com" className="flex items-center gap-2 text-[13.5px] text-[#8B899A] hover:text-white transition-colors mb-6">
              <Mail className="w-3.5 h-3.5" />
              support@shoplogshere.com
            </a>
            <h4 className="text-white text-[12px] font-semibold mb-3 uppercase tracking-wider">We accept</h4>
            <div className="flex flex-wrap gap-1.5">
              {['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)'].map((m) => (
                <span key={m} className="px-2.5 py-1 bg-[#151420] text-[#8B899A] text-[10.5px] font-medium rounded-md border border-[#232132]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1B1930] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-[#5E5C6C]">&copy; {year} ShopLogs. All rights reserved.</p>
          <p className="text-[11.5px] text-[#5E5C6C]">For educational &amp; research purposes only</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
