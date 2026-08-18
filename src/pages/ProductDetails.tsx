import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Minus, ShoppingCart, Layers } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PageLoader from '../components/ui/PageLoader';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async (): Promise<void> => {
    try {
      setLoading(true);
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
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-xl font-bold text-ink">Log not found</h2>
      </div>
    );
  }

  return (
    <div className="bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          <div className="rounded-[var(--radius-xl)] overflow-hidden bg-surface-hover border border-border h-fit">
            <img src={product.imageUrl} alt={product.name} className="w-full h-72 sm:h-96 object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-ink-muted uppercase tracking-wider font-medium">
                {product.category}
              </span>
              {product.featured && <Badge tone="accent">Featured</Badge>}
            </div>

            <h1 className="font-display text-[24px] sm:text-[28px] font-bold text-ink mb-4 leading-snug">
              {product.name}
            </h1>

            <div className="mb-6">
              <span className="font-display text-[32px] font-extrabold text-ink">${product.price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-ink-soft mb-2">Description</h3>
              <p className="text-[13.5px] text-ink-muted leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              {product.quantity > 0 ? (
                <Badge tone="success" dot>In stock — {product.quantity} available</Badge>
              ) : (
                <Badge tone="error" dot>Out of stock</Badge>
              )}
            </div>

            {product.quantity > 0 ? (
              <div className="space-y-5 mt-auto">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-2">Quantity</label>
                  <div className="flex items-center border border-border rounded-full w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-hover rounded-l-full transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-[13.5px] font-semibold text-ink">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-hover rounded-r-full transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Button onClick={handleAddToCart} fullWidth size="lg" icon={<ShoppingCart className="w-4 h-4" />}>
                  Add to cart
                </Button>
              </div>
            ) : (
              <div className="mt-auto flex items-center gap-2 text-[13px] text-ink-muted">
                <Layers className="w-4 h-4" />
                Check back soon — this log will restock.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
