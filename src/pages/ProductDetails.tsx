import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import { ArrowLeft, Minus, Plus, ShoppingCart, PackageX } from 'lucide-react';
import { Button, Badge, Skeleton, Container, ErrorState } from '../components/ui';

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
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (): void => {
    if (product && product.quantity >= quantity) {
      addToCart(product, quantity);
      toast.success(`${quantity} ${product.name}(s) added to cart!`);
    } else {
      toast.error('Insufficient stock');
    }
  };

  if (loading) {
    return (
      <Container className="py-8 sm:py-12">
        <Skeleton className="h-4 w-20 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <ErrorState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          onRetry={() => navigate('/')}
        />
      </Container>
    );
  }

  const inStock = product.quantity > 0;

  return (
    <Container className="py-8 sm:py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-7 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-canvas-raised border border-hairline">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          {!inStock && (
            <div className="absolute top-4 right-4">
              <Badge tone="error">Sold out</Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold mb-3">{product.category}</p>

          <h1 className="font-display text-[30px] sm:text-[36px] font-medium text-ink tracking-tight leading-tight mb-4">
            {product.name}
          </h1>

          <p className="font-display text-3xl text-ink mb-6">${product.price.toFixed(2)}</p>

          <p className="text-[15px] text-ink-faint leading-relaxed mb-6">{product.description}</p>

          <div className="mb-7">
            {inStock ? (
              <Badge tone="success">{product.quantity} available</Badge>
            ) : (
              <Badge tone="error" icon={<PackageX />}>
                Out of stock
              </Badge>
            )}
          </div>

          {inStock && (
            <div className="mt-auto space-y-4 bg-surface rounded-xl border border-hairline p-5">
              <div>
                <label className="block text-[13px] font-medium text-ink-muted mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-hairline-strong bg-canvas-raised flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-faint transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                    className="w-16 h-10 text-center rounded-lg border border-hairline-strong bg-canvas-raised text-ink font-semibold outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-hairline-strong bg-canvas-raised flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-faint transition-colors disabled:opacity-30"
                    disabled={quantity >= product.quantity}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button onClick={handleAddToCart} fullWidth size="lg" icon={<ShoppingCart />}>
                Add to cart — ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ProductDetails;
