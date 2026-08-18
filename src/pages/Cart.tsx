import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Wallet,
  CreditCard,
  Package,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number): void => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async (): Promise<void> => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const total = getCartTotal();
    if (user && user.walletBalance < total) {
      toast.error(`Insufficient balance. You need $${(total - user.walletBalance).toFixed(2)} more`);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/orders', orderData);
      toast.success('Order placed successfully!');

      if (user) {
        updateUser({ walletBalance: user.walletBalance - total });
      }

      clearCart();
      navigate(`/order/${response.data.data.order._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-canvas flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Your cart is empty"
            description="Add some logs to get started."
            action={
              <Button onClick={() => navigate('/')} icon={<ShoppingBag className="w-4 h-4" />}>
                Browse logs <ArrowRight className="w-4 h-4" />
              </Button>
            }
            className="bg-surface border border-border rounded-[var(--radius-xl)]"
          />
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartTotal();
  const hasEnoughBalance = user ? user.walletBalance >= subtotal : false;

  return (
    <div className="bg-canvas py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">Shopping cart</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <Card key={item._id} padded={false} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-[var(--radius-md)] bg-surface-hover shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="min-w-0">
                        <h3 className="font-medium text-ink text-[13.5px] truncate">{item.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3 text-ink-muted" />
                          <span className="text-[11.5px] text-ink-muted capitalize">{item.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-ink-muted hover:text-error p-1 rounded transition-colors shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-surface-hover rounded-full border border-border p-0.5">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full text-ink-soft hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-[13px] font-semibold text-ink">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full text-ink-soft hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-ink-muted">${item.price.toFixed(2)} each</p>
                        <p className="font-display text-[15px] font-bold text-ink">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24" elevated>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-ink-muted" />
                <h2 className="font-display font-bold text-ink text-[15px]">Order summary</h2>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-border text-[13.5px]">
                <div className="flex justify-between text-ink-muted">
                  <span>Items ({totalItems})</span>
                  <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-success">Free · Instant</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="font-medium text-ink-soft text-[13.5px]">Total</span>
                <span className="font-display text-[22px] font-bold text-ink">${subtotal.toFixed(2)}</span>
              </div>

              {user && (
                <div className={`mb-4 p-3.5 rounded-[var(--radius-md)] border ${hasEnoughBalance ? 'bg-success-soft border-success/20' : 'bg-error-soft border-error/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className={`w-4 h-4 ${hasEnoughBalance ? 'text-success' : 'text-error'}`} />
                    <p className="text-[11.5px] font-medium text-ink-muted">Wallet balance</p>
                  </div>
                  <p className={`text-[17px] font-bold ${hasEnoughBalance ? 'text-success' : 'text-error'}`}>
                    ${user.walletBalance.toFixed(2)}
                  </p>
                  {!hasEnoughBalance ? (
                    <div className="flex items-start gap-1.5 mt-2 text-[11.5px] text-error">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <p>Need ${(subtotal - user.walletBalance).toFixed(2)} more</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <p>Sufficient balance</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={!!(user && !hasEnoughBalance)}
                loading={loading}
                fullWidth
                icon={<CreditCard className="w-4 h-4" />}
                className="mb-2"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                fullWidth
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                Continue shopping
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
