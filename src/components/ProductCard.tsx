import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import type { Product } from '../types';

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
      toast.error('Product is out of stock');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.quantity === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2 capitalize">
            {product.category}
          </p>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="btn btn-primary text-sm"
            >
              Add to Cart
            </button>
          </div>
          
          <div className="text-xs text-right">
            {product.quantity > 0 ? (
              <span className="text-green-600 font-semibold">
                In Stock: {product.quantity}
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;