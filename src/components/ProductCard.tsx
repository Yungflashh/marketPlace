import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';
import { Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (product.quantity > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Log is out of stock');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden bg-gray-50 dark:bg-gray-950">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.quantity === 0 ? (
            <div className="absolute top-2 right-2 bg-gray-900 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide">
              Out of Stock
            </div>
          ) : product.quantity <= 10 ? (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
              Only {product.quantity} left
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
              {product.quantity} in stock
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 capitalize">
            {product.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-grow leading-relaxed">
            {product.description}
          </p>

          <div className={`inline-flex items-center gap-1 mb-3 px-2 py-1 rounded-md text-[11px] font-medium w-fit ${ product.quantity === 0 ? 'bg-red-50 text-red-600' : product.quantity <= 10 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700' }`}>
            <Layers className="w-3 h-3" />
            {product.quantity === 0 ? 'Out of stock' : `${product.quantity} logs available`}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="bg-gray-900 text-white text-xs font-medium px-3.5 py-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
