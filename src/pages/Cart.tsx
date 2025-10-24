import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
  Sparkles
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

      const response = await axios.post('http://localhost:9000/api/orders', orderData);
      
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Looks like you haven't added anything yet. Start shopping to fill your cart!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto group"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartTotal();
  const hasEnoughBalance = user ? user.walletBalance >= subtotal : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all group"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="bg-white text-gray-700 hover:bg-indigo-600 hover:text-white w-10 h-10 rounded-lg transition-all flex items-center justify-center shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900 text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="bg-white text-gray-700 hover:bg-indigo-600 hover:text-white w-10 h-10 rounded-lg transition-all flex items-center justify-center shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">
                          ${item.price.toFixed(2)} each
                        </p>
                        <p className="text-2xl font-bold text-indigo-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-24 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Items ({totalItems})
                  </span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Wallet Balance */}
              {user && (
                <div className={`mb-6 p-4 rounded-xl border-2 ${hasEnoughBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className={`w-5 h-5 ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`} />
                    <p className="text-sm font-semibold text-gray-700">Wallet Balance</p>
                  </div>
                  <p className={`text-2xl font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                    ${user.walletBalance.toFixed(2)}
                  </p>
                  {!hasEnoughBalance && (
                    <div className="flex items-start gap-2 mt-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>
                        You need ${(subtotal - user.walletBalance).toFixed(2)} more to complete this purchase.
                      </p>
                    </div>
                  )}
                  {hasEnoughBalance && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <p>Sufficient balance available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || (user && !hasEnoughBalance)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mb-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>

              {/* Trust Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;