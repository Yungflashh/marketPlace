import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { ShieldCheck, ShoppingCart, ArrowRight, Check, Heart } from 'lucide-react';
import Badge from './ui/Badge';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
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
const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const inWishlist = isInWishlist(product._id);

  const handleToggleWishlist = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };
  // Tilt-effect only makes sense in the grid variant.
  const [interactive] = useState(() => variant === 'grid' && supportsTilt());
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

  if (variant === 'list') {
    return (
      <Link
        to={`/product/${product._id}`}
        className="group block rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <div className="relative bg-elevated border border-border rounded-[var(--radius-lg)] p-3 flex items-stretch gap-3 sm:gap-4 transition-colors duration-200 hover:border-primary/30 hover:shadow-[var(--shadow-vault-sm)]">
          <div className="relative shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-[var(--radius-md)] overflow-hidden bg-surface-hover flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="font-display text-3xl font-bold text-primary/40">{initial}</span>
            )}
            {product.featured && (
              <span className="absolute top-1 left-1">
                <Badge tone="accent">★</Badge>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[10px] sm:text-[10.5px] text-ink-muted uppercase tracking-wider font-medium">
                  {product.category}
                </span>
                <Badge tone={inStock ? 'success' : 'error'} dot>
                  {inStock ? 'In stock' : 'Sold out'}
                </Badge>
              </div>
              <h3 className="text-[13.5px] sm:text-[14.5px] font-semibold text-ink line-clamp-2 sm:line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="hidden sm:block text-[12px] text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0 py-0.5 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={inWishlist}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
                  inWishlist
                    ? 'bg-error-soft text-error'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-error'
                }`}
              >
                <Heart className="w-3.5 h-3.5" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={2.2} />
              </button>
              <span className="font-display text-[15px] sm:text-[17px] font-bold text-ink whitespace-nowrap">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              aria-label={`Add ${product.name} to cart`}
              className={`flex items-center gap-1 text-[11.5px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                justAdded ? 'bg-success text-white' : 'bg-primary text-on-primary hover:bg-primary-hover active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={3} />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Buy</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    );
  }

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
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-hover flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="tilt-card__image w-full h-full object-contain p-4"
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
          <span className="absolute bottom-2.5 right-2.5 z-10">
            <Badge tone={inStock ? 'success' : 'error'} dot>
              {inStock ? 'In stock' : 'Sold out'}
            </Badge>
          </span>
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={inWishlist}
            className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all active:scale-90 ${
              inWishlist
                ? 'bg-error/90 text-white border-error/60 shadow-[0_4px_12px_rgba(239,68,68,0.35)]'
                : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
            }`}
          >
            <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={2.2} />
          </button>
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto pt-1">
            <span className="font-display text-[17px] font-bold text-ink">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`tilt-card__cta relative flex items-center justify-center gap-1 text-[12px] font-semibold px-3.5 py-2 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto ${
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
                  <ShoppingCart className="w-3 h-3" strokeWidth={2.5} />
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
