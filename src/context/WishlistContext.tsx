import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import type { Product, WishlistItem, WishlistContextType } from '../types';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};

interface Props { children: ReactNode }

interface ServerWishlistItem { product: Product; addedAt: string }
const normalize = (items: ServerWishlistItem[] = []): WishlistItem[] =>
  items
    .filter((i) => i.product && i.product._id)
    .map((i) => ({ product: i.product, addedAt: i.addedAt }));

const readLocal = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem('wishlist');
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => readLocal());
  const wasAuthedRef = useRef<boolean>(isAuthenticated);
  const hydratedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    const justLoggedIn = isAuthenticated && !wasAuthedRef.current;
    const justLoggedOut = !isAuthenticated && wasAuthedRef.current;
    const firstLoadAuthed = isAuthenticated && !hydratedRef.current;

    const hydrate = async () => {
      try {
        const guestItems = readLocal();
        if (justLoggedIn && guestItems.length > 0) {
          const res = await api.post('/wishlist/merge', {
            productIds: guestItems.map((i) => i.product._id),
          });
          setWishlistItems(normalize(res.data.data.wishlist.items));
        } else {
          const res = await api.get('/wishlist');
          setWishlistItems(normalize(res.data.data.wishlist.items));
        }
        localStorage.removeItem('wishlist');
        hydratedRef.current = true;
      } catch (err) {
        console.error('Wishlist hydration failed:', err);
      }
    };

    if (justLoggedIn || firstLoadAuthed) hydrate();
    if (justLoggedOut) {
      setWishlistItems([]);
      localStorage.removeItem('wishlist');
      hydratedRef.current = false;
    }

    wasAuthedRef.current = isAuthenticated;
  }, [isAuthenticated, authLoading]);

  const isInWishlist = (productId: string): boolean =>
    wishlistItems.some((i) => i.product._id === productId);

  const revert = (snapshot: WishlistItem[], message: string) => {
    setWishlistItems(snapshot);
    toast.error(message);
  };

  const addLocal = (product: Product) => {
    setWishlistItems((prev) =>
      prev.some((i) => i.product._id === product._id)
        ? prev
        : [{ product, addedAt: new Date().toISOString() }, ...prev]
    );
  };

  const removeLocal = (productId: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const toggleWishlist = (product: Product): void => {
    const snapshot = wishlistItems;
    const currentlyIn = isInWishlist(product._id);

    if (currentlyIn) {
      removeLocal(product._id);
      if (isAuthenticated) {
        api
          .delete(`/wishlist/items/${product._id}`)
          .then((res) => setWishlistItems(normalize(res.data.data.wishlist.items)))
          .catch(() => revert(snapshot, 'Could not update wishlist'));
      }
    } else {
      addLocal(product);
      toast.success(`Added to wishlist`);
      if (isAuthenticated) {
        api
          .post('/wishlist/items', { productId: product._id })
          .then((res) => setWishlistItems(normalize(res.data.data.wishlist.items)))
          .catch(() => revert(snapshot, 'Could not update wishlist'));
      }
    }
  };

  const removeFromWishlist = (productId: string): void => {
    const snapshot = wishlistItems;
    removeLocal(productId);

    if (isAuthenticated) {
      api
        .delete(`/wishlist/items/${productId}`)
        .then((res) => setWishlistItems(normalize(res.data.data.wishlist.items)))
        .catch(() => revert(snapshot, 'Could not remove item'));
    }
  };

  const clearWishlist = (): void => {
    const snapshot = wishlistItems;
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
    if (isAuthenticated) {
      api.delete('/wishlist').catch(() => revert(snapshot, 'Could not clear wishlist on server'));
    }
  };

  const getWishlistCount = (): number => wishlistItems.length;

  const value: WishlistContextType = {
    wishlistItems,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
