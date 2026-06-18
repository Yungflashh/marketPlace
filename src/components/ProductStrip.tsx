import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface Props {
  title: string;
  badge?: string;
  badgeClass?: string;
  products: Product[];
  icon?: React.ReactNode;
}

const ProductStrip: React.FC<Props> = ({ title, badge, badgeClass = 'bg-gray-900 text-white', products, icon }) => {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
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
    <div className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-400">({products.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="shrink-0 w-[200px] group"
          >
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
              {/* Image */}
              <div className="relative h-36 overflow-hidden bg-gray-50">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                    {badge}
                  </span>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-3 flex flex-col flex-grow">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 capitalize">{product.category}</p>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug flex-grow">{product.name}</h3>

                <div className={`inline-flex items-center gap-1 mb-2 px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${
                  product.quantity === 0 ? 'bg-red-50 text-red-600'
                  : product.quantity <= 10 ? 'bg-orange-50 text-orange-600'
                  : 'bg-green-50 text-green-700'
                }`}>
                  <Layers className="w-2.5 h-2.5" />
                  {product.quantity === 0 ? 'Out of stock' : `${product.quantity} available`}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={(e) => handleAdd(e, product)}
                    disabled={product.quantity === 0}
                    className="text-[10px] font-semibold bg-gray-900 text-white px-2.5 py-1 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add
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
