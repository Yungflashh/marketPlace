export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  isActive: boolean;
  isBanned?: boolean;
  banExpiresAt?: string | null;
  banReason?: string;
  failedTransactionCount?: number;
  lastWarningEmailAt?: string | null;
  welcomeBonusAwardedAt?: string | null;
  welcomeBonusAcknowledged?: boolean;
  referralCode?: string;
  referredBy?: string | null;
  referralRewardCount?: number;
  pendingEmail?: string | null;
  phone?: string;
  address?: string;
  lastLoginAt?: string | null;
  lastLoginCountry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusChange {
  status: Order['status'];
  changedAt: string;
  changedBy?: string | User;
  reason?: string;
}

export type UserNotificationType =
  | 'order_status'
  | 'funding_approved'
  | 'funding_rejected'
  | 'welcome_bonus'
  | 'referral_reward'
  | 'wishlist_restock'
  | 'admin_message'
  | 'system';

export interface UserNotification {
  _id: string;
  user: string;
  type: UserNotificationType;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  featured: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  product: string | Product;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'in-review' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'wallet';
  rejectionReason?: string;
  refunded?: boolean;
  statusHistory?: OrderStatusChange[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  user: string | User;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;  // Add this
  walletAddress?: string;  // Add this
  rejectionReason?: string;
  relatedOrder?: string | Order;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    results: T[]; // generic list
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}


export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  referralCode?: string;
}