import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeftRight,
  Wallet,
  Users,
  Bell,
  Mail,
  CreditCard,
  Store,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../Logo';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Catalog', items: [{ to: '/admin/products', label: 'Logs', icon: Package }] },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/wallet', label: 'Wallets', icon: Wallet },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/emails', label: 'Email campaigns', icon: Mail },
    ],
  },
  { label: 'Settings', items: [{ to: '/admin/payment-methods', label: 'Payment methods', icon: CreditCard }] },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const isActive = (to: string) => (to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to));

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavLinks: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
    <nav className="flex-1 overflow-y-auto vault-scroll px-3 py-4 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13.5px] font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary-soft text-primary'
                    : 'text-ink-soft hover:bg-surface-hover hover:text-ink'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="w-[17px] h-[17px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-border bg-elevated sticky top-0 h-screen transition-[width] duration-200 ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className={`flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
          <Logo size={26} />
          {!collapsed && <span className="font-display text-[15px] font-bold text-ink truncate">Admin</span>}
        </div>

        <NavLinks />

        <div className="border-t border-border p-3 space-y-1 shrink-0">
          <Link
            to="/"
            title="View store"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <Store className="w-[17px] h-[17px] shrink-0" />
            {!collapsed && 'View store'}
          </Link>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <PanelLeftOpen className="w-[17px] h-[17px]" /> : <PanelLeftClose className="w-[17px] h-[17px]" />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-[#09090C]/55 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-elevated flex flex-col [animation:vault-fade-up_0.25s_ease_both]">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <Logo size={24} />
                <span className="font-display text-[15px] font-bold text-ink">Admin</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-hover">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-border p-3 shrink-0">
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium text-ink-soft hover:bg-surface-hover">
                <Store className="w-[17px] h-[17px]" /> View store
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-canvas/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover">
            <Menu className="w-5 h-5" />
          </button>
          <span className="hidden lg:block text-[13px] text-ink-muted">Signed in as <span className="text-ink font-medium">{user?.name}</span></span>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 h-9 rounded-full text-[12.5px] font-medium text-ink-soft hover:bg-error-soft hover:text-error transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
