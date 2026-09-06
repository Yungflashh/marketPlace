import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Package,
  Wallet,
  Gift,
  Users,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Check,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import type { UserNotificationType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageLoader from '../components/ui/PageLoader';

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove, clearAll } = useNotifications();
  const navigate = useNavigate();

  if (loading && notifications.length === 0) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">Notifications</h1>
          </div>
          <p className="text-[13px] text-ink-muted">
            {notifications.length === 0
              ? 'No notifications yet.'
              : `${notifications.length} total${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={markAllRead} icon={<Check className="w-3.5 h-3.5" />}>
                Mark all read
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (window.confirm('Clear all notifications? This cannot be undone.')) clearAll();
              }}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications yet"
          description="Order updates, funding approvals, and referral rewards will show up here."
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n._id} className={`p-4 sm:p-5 flex gap-3 hover:bg-surface-hover transition-colors ${n.read ? '' : 'bg-primary-soft/5'}`}>
                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${toneFor(n.type)}`}>
                  {iconFor(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
                    <p className={`text-[13.5px] leading-snug ${n.read ? 'text-ink-soft font-medium' : 'text-ink font-semibold'}`}>
                      {n.title}
                    </p>
                  </div>
                  {n.body && <p className="text-[12px] text-ink-muted leading-relaxed">{n.body}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-muted">
                    <span>{formatDate(n.createdAt)}</span>
                    {n.link && (
                      <button
                        onClick={() => {
                          if (!n.read) markRead(n._id);
                          navigate(n.link!);
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Open →
                      </button>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="hover:text-ink"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => remove(n._id)}
                      className="hover:text-error ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
