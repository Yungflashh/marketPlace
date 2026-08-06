import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { Plus } from 'lucide-react';
import Badge from './ui/Badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const inStock = product.quantity > 0;

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (inStock) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="rounded-lg border border-hairline bg-surface overflow-hidden h-full flex flex-col transition-all duration-200 ease-out group-hover:border-gold group-hover:-translate-y-1 group-hover:shadow-[0_0_0_1px_var(--color-gold),0_16px_28px_-10px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-square overflow-hidden bg-canvas-raised">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          {!inStock && (
            <div className="absolute top-3 right-3">
              <Badge tone="error">Sold out</Badge>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-md bg-gold text-canvas flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 disabled:hidden"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col flex-grow gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint truncate">{product.category}</p>
            <p className="text-[10px] font-mono text-ink-faint/70 shrink-0">#{product._id.slice(-6).toUpperCase()}</p>
          </div>
          <h3 className="text-[15px] font-medium text-ink line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="font-mono text-lg font-semibold text-ink">${product.price.toFixed(2)}</p>
            <p className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide ${inStock ? 'text-ink-faint' : 'text-danger'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-success' : 'bg-danger'}`} />
              {inStock ? `${product.quantity} left` : 'Sold out'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
