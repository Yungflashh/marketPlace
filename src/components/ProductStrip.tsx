import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Badge from './ui/Badge';
import { useReveal } from '../hooks/useReveal';

interface Props {
  title: string;
  badge?: string;
  badgeClass?: string;
  products: Product[];
  icon?: React.ReactNode;
}

const ProductStrip: React.FC<Props> = ({ title, badge, products, icon }) => {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLDivElement>();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [products, updateEdges]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (product.quantity > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Out of stock');
    }
  };

  if (products.length === 0) return null;

  return (
    <div ref={revealRef} className="reveal mb-12">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h2 className="font-display text-[16px] font-bold text-ink">{title}</h2>
          <span className="text-[13px] text-ink-muted">({products.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            disabled={atStart}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:border-border-strong transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={atEnd}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-ink-soft hover:bg-surface-hover hover:border-border-strong transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
      >
        {products.map((product, i) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="stagger-item shrink-0 w-[190px] group"
            style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
          >
            <div className="bg-surface rounded-[var(--radius-lg)] border border-border overflow-hidden transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-vault-glow)]">
              <div className="relative h-32 overflow-hidden bg-surface-hover">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {badge && (
                  <span className="absolute top-2 left-2">
                    <Badge tone="accent">{badge}</Badge>
                  </span>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-[#09090C]/50 flex items-center justify-center">
                    <span className="text-white text-[11px] font-semibold">Out of stock</span>
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col flex-grow">
                <p className="text-[9.5px] text-ink-muted uppercase tracking-wider mb-1 font-medium">{product.category}</p>
                <h3 className="text-[12px] font-semibold text-ink mb-2.5 line-clamp-2 leading-snug flex-grow">{product.name}</h3>

                <div className="flex items-center justify-between mt-auto">
                  <span className="font-display text-[13.5px] font-bold text-ink">${product.price.toFixed(2)}</span>
                  <button
                    onClick={(e) => handleAdd(e, product)}
                    disabled={product.quantity === 0}
                    className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary rounded-full hover:bg-primary-hover active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductStrip;
