import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async (): Promise<void> => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching log');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (): void => {
    if (product && product.quantity >= quantity) {
      addToCart(product, quantity);
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } else {
      toast.error('Insufficient stock');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading log...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Log not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 capitalize">
              {product.category}
            </p>

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 leading-snug">
              {product.name}
            </h1>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              {product.quantity > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  In stock — {product.quantity} available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Out of stock
                </span>
              )}
            </div>

            {product.quantity > 0 && (
              <div className="space-y-4 mt-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                  <div className="flex items-center gap-0 border border-gray-200 dark:border-gray-700 rounded-full w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 rounded-l-full transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 rounded-r-full transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
