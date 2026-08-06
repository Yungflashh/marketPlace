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
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, EmptyState, PageHeader, Container } from '../components/ui';

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
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      };

      const response = await api.post('/orders', orderData);

      toast.success('Order placed successfully!');

      // Update user wallet balance
      if (user) {
        updateUser({ walletBalance: user.walletBalance - total });
      }

      clearCart();
      navigate(`/order/${response.data.data.order._id}`);
    } catch (error: any) {

      console.log(error);

      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-16">
        <div className="rounded-xl border border-hairline bg-surface max-w-md mx-auto">
          <EmptyState
            icon={<ShoppingCart />}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Start shopping to fill your cart."
            action={
              <Button icon={<ShoppingBag />} onClick={() => navigate('/')}>
                Start shopping
              </Button>
            }
          />
        </div>
      </Container>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartTotal();
  const hasEnoughBalance = user ? user.walletBalance >= subtotal : false;

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Checkout"
        title="Your cart"
        description={`${totalItems} ${totalItems === 1 ? 'item' : 'items'} ready to go`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
              <div className="flex gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shrink-0 bg-canvas-raised"
                />

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink truncate">{item.name}</h3>
                      <p className="text-xs uppercase tracking-wide text-ink-faint mt-1">{item.category}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-ink-faint hover:text-danger hover:bg-danger-soft p-2 rounded-lg transition-colors shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-canvas-raised rounded-lg p-1 border border-hairline">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-ink text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-ink-faint">${item.price.toFixed(2)} each</p>
                      <p className="font-display text-lg text-ink">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6 lg:sticky lg:top-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint mb-5">Order summary</h2>

            <div className="space-y-3 mb-5 pb-5 border-b border-hairline text-sm">
              <div className="flex justify-between text-ink-faint">
                <span>Items ({totalItems})</span>
                <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-faint">
                <span>Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between text-ink-faint">
                <span>Tax</span>
                <span className="font-medium text-ink">$0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-5">
              <span className="text-ink font-medium">Total</span>
              <span className="font-display text-2xl text-ink">${subtotal.toFixed(2)}</span>
            </div>

            {/* Wallet Balance */}
            {user && (
              <div
                className={`mb-5 p-4 rounded-lg border ${
                  hasEnoughBalance ? 'bg-success-soft border-success/20' : 'bg-danger-soft border-danger/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className={`w-4 h-4 ${hasEnoughBalance ? 'text-success' : 'text-danger'}`} />
                  <p className="text-xs font-semibold text-ink-muted">Wallet balance</p>
                </div>
                <p className={`text-lg font-semibold ${hasEnoughBalance ? 'text-success' : 'text-danger'}`}>
                  ${user.walletBalance.toFixed(2)}
                </p>
                {!hasEnoughBalance && (
                  <p className="flex items-start gap-1.5 mt-2 text-xs text-danger">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    You need ${(subtotal - user.walletBalance).toFixed(2)} more to complete this purchase.
                  </p>
                )}
                {hasEnoughBalance && (
                  <p className="flex items-center gap-1.5 mt-2 text-xs text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sufficient balance available
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={loading || !!(user && !hasEnoughBalance)}
              loading={loading}
              fullWidth
              size="lg"
              icon={<CreditCard />}
              className="mb-2"
            >
              {loading ? 'Processing…' : 'Proceed to checkout'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" fullWidth onClick={() => navigate('/')} icon={<ShoppingBag />}>
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Cart;
