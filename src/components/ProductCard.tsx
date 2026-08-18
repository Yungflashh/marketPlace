import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';
import Badge from './ui/Badge';

interface ProductCardProps {
  product: Product;
}

const MAX_TILT = 8; // degrees, each axis

const supportsTilt = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Pointer-tracked tilt card for the storefront grid. `--rx`/`--ry` (tilt) and
 * `--mx`/`--my` (pointer position, for the glow/glare) are written directly to the
 * DOM via a rAF-throttled mousemove handler rather than React state, so the 60fps
 * tracking never touches the render cycle. All of it — tilt, glow, glare, the
 * spinning conic border — is gated behind `.tilt-card--interactive`, which is only
 * applied when the device has a fine pointer and doesn't prefer reduced motion; see
 * the matching CSS guard in index.css for the touch/reduced-motion fallback.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [interactive] = useState(supportsTilt);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!interactive) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const ry = (px - 0.5) * MAX_TILT * 2;
      const rx = (0.5 - py) * MAX_TILT * 2;
      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  }, [interactive]);

  const handlePointerLeave = useCallback(() => {
    if (!interactive) return;
    const el = cardRef.current;
    if (!el) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  }, [interactive]);

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (product.quantity > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } else {
      toast.error('Log is out of stock');
    }
  };

  const initial = product.name?.charAt(0)?.toUpperCase() || '?';
  const inStock = product.quantity > 0;

  return (
    <Link
      ref={cardRef}
      to={`/product/${product._id}`}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={`tilt-card group h-full rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
        interactive ? 'tilt-card--interactive' : ''
      }`}
      style={{ '--rx': '0deg', '--ry': '0deg', '--mx': '50%', '--my': '50%' } as React.CSSProperties}
    >
      <div className="tilt-card__glow" aria-hidden="true" />

      <div className="tilt-card__body relative bg-elevated border border-border rounded-[var(--radius-lg)] overflow-hidden h-full flex flex-col hover:border-primary/30 hover:shadow-[var(--shadow-vault-md)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-hover">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="tilt-card__image w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-soft">
              <span className="font-display text-5xl font-bold text-primary/40">{initial}</span>
            </div>
          )}

          <div className="tilt-card__glare" aria-hidden="true" />
          <div className="tilt-card__shine" aria-hidden="true" />

          {product.featured && (
            <span className="absolute top-2.5 left-2.5 z-10">
              <Badge tone="accent">Featured</Badge>
            </span>
          )}
          <span className="absolute bottom-2.5 left-2.5 z-10">
            <Badge tone="primary">
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          </span>
          <span className="absolute top-2.5 right-2.5 z-10">
            <Badge tone={inStock ? 'success' : 'error'} dot>
              {inStock ? 'In stock' : 'Sold out'}
            </Badge>
          </span>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <p className="text-[10.5px] text-ink-muted uppercase tracking-wider mb-1 font-medium">
            {product.category}
          </p>
          <h3 className="tilt-card__title text-[13.5px] font-semibold text-ink mb-1.5 line-clamp-2 leading-snug transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-[12px] text-ink-muted mb-3 line-clamp-2 flex-grow leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-1">
            <span className="font-display text-[17px] font-bold text-ink">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`tilt-card__cta relative flex items-center gap-1 text-[11.5px] font-semibold px-3.5 py-2 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                justAdded ? 'bg-success text-white' : 'bg-primary text-on-primary hover:bg-primary-hover active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3 h-3 animate-check-in" strokeWidth={3} />
                  Added
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" strokeWidth={2.5} />
                  Buy
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="tilt-card__border" aria-hidden="true" />
    </Link>
  );
};

export default ProductCard;
