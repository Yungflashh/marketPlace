import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import type { CartItem, Product, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Server sends { items: [{ product, quantity }] }. Flatten to the { ...product, quantity }
// shape the rest of the app already consumes.
interface ServerCartItem {
  product: Product;
  quantity: number;
}
const flattenServerItems = (items: ServerCartItem[] = []): CartItem[] =>
  items
    .filter((i) => i.product && i.product._id)
    .map((i) => ({ ...i.product, quantity: i.quantity }));

const readLocalCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readLocalCart());
  const wasAuthenticatedRef = useRef<boolean>(isAuthenticated);
  const hydratedForAuthRef = useRef<boolean>(false);

  // Persist localStorage snapshot only while the user is a guest.
  // Once logged in the server is the source of truth and we don't want a
  // stale copy on disk that could resurrect items after logout.
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Auth transitions: on login, merge guest cart into server then hydrate.
  // On logout, drop in-memory items and clear the local snapshot.
  useEffect(() => {
    if (authLoading) return;

    const justLoggedIn = isAuthenticated && !wasAuthenticatedRef.current;
    const justLoggedOut = !isAuthenticated && wasAuthenticatedRef.current;
    const firstLoadWhileAuthed = isAuthenticated && !hydratedForAuthRef.current;

    const hydrate = async () => {
      try {
        const guestItems = readLocalCart();
        if (justLoggedIn && guestItems.length > 0) {
          const payload = {
            items: guestItems.map((i) => ({ productId: i._id, quantity: i.quantity })),
          };
          const res = await api.post('/cart/merge', payload);
          setCartItems(flattenServerItems(res.data.data.cart.items));
        } else {
          const res = await api.get('/cart');
          setCartItems(flattenServerItems(res.data.data.cart.items));
        }
        localStorage.removeItem('cart');
        hydratedForAuthRef.current = true;
      } catch (err) {
        console.error('Cart hydration failed:', err);
      }
    };

    if (justLoggedIn || firstLoadWhileAuthed) {
      hydrate();
    }

    if (justLoggedOut) {
      setCartItems([]);
      localStorage.removeItem('cart');
      hydratedForAuthRef.current = false;
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, authLoading]);

  const revert = (snapshot: CartItem[], message: string) => {
    setCartItems(snapshot);
    toast.error(message);
  };

  const addToCart = (product: Product, quantity: number = 1): void => {
    const snapshot = cartItems;
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });

    if (isAuthenticated) {
      api
        .post('/cart/items', { productId: product._id, quantity })
        .then((res) => setCartItems(flattenServerItems(res.data.data.cart.items)))
        .catch(() => revert(snapshot, 'Could not add item to cart'));
    }
  };

  const removeFromCart = (productId: string): void => {
    const snapshot = cartItems;
    setCartItems((prev) => prev.filter((i) => i._id !== productId));

    if (isAuthenticated) {
      api
        .delete(`/cart/items/${productId}`)
        .then((res) => setCartItems(flattenServerItems(res.data.data.cart.items)))
        .catch(() => revert(snapshot, 'Could not remove item'));
    }
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const snapshot = cartItems;
    setCartItems((prev) => prev.map((i) => (i._id === productId ? { ...i, quantity } : i)));

    if (isAuthenticated) {
      api
        .patch(`/cart/items/${productId}`, { quantity })
        .then((res) => setCartItems(flattenServerItems(res.data.data.cart.items)))
        .catch(() => revert(snapshot, 'Could not update quantity'));
    }
  };

  const clearCart = (): void => {
    const snapshot = cartItems;
    setCartItems([]);
    localStorage.removeItem('cart');

    if (isAuthenticated) {
      api.delete('/cart').catch(() => revert(snapshot, 'Could not clear cart on server'));
    }
  };

  const getCartTotal = (): number =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = (): number =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
