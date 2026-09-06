import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Package,
  Wallet,
  Gift,
  Users,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import type { UserNotification, UserNotificationType } from '../types';

const iconFor = (type: UserNotificationType) => {
  switch (type) {
    case 'order_status': return <Package className="w-4 h-4" />;
    case 'funding_approved': return <Wallet className="w-4 h-4" />;
    case 'funding_rejected': return <AlertTriangle className="w-4 h-4" />;
    case 'welcome_bonus': return <Gift className="w-4 h-4" />;
    case 'referral_reward': return <Users className="w-4 h-4" />;
    case 'wishlist_restock': return <CheckCircle2 className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
};

const toneFor = (type: UserNotificationType) => {
  switch (type) {
    case 'funding_approved':
    case 'referral_reward':
    case 'welcome_bonus':
      return 'bg-success-soft text-success';
    case 'funding_rejected':
      return 'bg-error-soft text-error';
    case 'order_status':
    case 'wishlist_restock':
      return 'bg-primary-soft text-primary';
    default:
      return 'bg-surface-hover text-ink-muted';
  }
};

const relativeTime = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleClick = (n: UserNotification) => {
    if (!n.read) markRead(n._id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  const preview = notifications.slice(0, 6);

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:text-ink transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-elevated border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-vault-lg)] z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-ink-muted" />
              <span className="font-semibold text-ink text-[13px]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-primary bg-primary-soft px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] text-ink-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto vault-scroll">
            {preview.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-40" />
                <p className="text-[12px] text-ink-muted">You're all caught up.</p>
              </div>
            ) : (
              preview.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors flex gap-3 ${
                    n.read ? '' : 'bg-primary-soft/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${toneFor(n.type)}`}>
                    {iconFor(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <p className={`text-[12.5px] leading-tight truncate ${n.read ? 'text-ink-soft font-medium' : 'text-ink font-semibold'}`}>
                        {n.title}
                      </p>
                    </div>
                    {n.body && (
                      <p className="text-[11px] text-ink-muted line-clamp-2 leading-snug">{n.body}</p>
                    )}
                    <p className="text-[10px] text-ink-muted mt-1">{relativeTime(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-[12px] text-primary hover:bg-surface-hover font-medium py-3 border-t border-border transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
