import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import type { UserNotification } from '../types';

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const POLL_MS = 30000;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<number | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/inbox/me?limit=30');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get('/inbox/me/unread-count');
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    fetchList();
    pollRef.current = window.setInterval(fetchUnread, POLL_MS);
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isAuthenticated, authLoading, fetchList, fetchUnread]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.patch(`/inbox/me/${id}/read`);
    } catch {
      fetchList();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch('/inbox/me/read-all');
    } catch {
      fetchList();
    }
  };

  const remove = async (id: string) => {
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.delete(`/inbox/me/${id}`);
      fetchUnread();
    } catch {
      setNotifications(snapshot);
    }
  };

  const clearAll = async () => {
    const snapshot = notifications;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await api.delete('/inbox/me');
    } catch {
      setNotifications(snapshot);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, refresh: fetchList, markRead, markAllRead, remove, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
