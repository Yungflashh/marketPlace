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
  CheckCircle2
} from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-gray-200 p-10">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 mb-6">Start shopping to fill your cart!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartTotal();
  const hasEnoughBalance = user ? user.walletBalance >= subtotal : false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="bg-white text-gray-700 hover:bg-indigo-600 hover:text-white w-8 h-8 rounded-md transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="bg-white text-gray-700 hover:bg-indigo-600 hover:text-white w-8 h-8 rounded-md transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        <p className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({totalItems})</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 text-sm">Total</span>
                <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              {user && (
                <div className={`mb-4 p-3 rounded-lg border text-sm ${hasEnoughBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className={`w-4 h-4 ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`} />
                    <p className="font-medium text-gray-700 text-xs">Wallet Balance</p>
                  </div>
                  <p className={`text-lg font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                    ${user.walletBalance.toFixed(2)}
                  </p>
                  {!hasEnoughBalance && (
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <p>Need ${(subtotal - user.walletBalance).toFixed(2)} more</p>
                    </div>
                  )}
                  {hasEnoughBalance && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <p>Sufficient balance</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || !!(user && !hasEnoughBalance)}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Checkout</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
