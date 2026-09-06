import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (productId: string) => {
    const item = wishlistItems.find((i) => i.product._id === productId);
    if (!item) return;
    if (item.product.quantity <= 0) {
      toast.error('Log is out of stock');
      return;
    }
    addToCart(item.product, 1);
    removeFromWishlist(productId);
    toast.success(`${item.product.name} moved to cart`);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className="w-5 h-5 text-error" fill="currentColor" />
            <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">Wishlist</h1>
          </div>
          <p className="text-[13px] text-ink-muted">
            {wishlistItems.length === 0
              ? 'Save logs you love and come back to them later.'
              : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} saved.`}
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (window.confirm('Clear your entire wishlist?')) clearWishlist();
            }}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear wishlist
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6" />}
          title="Your wishlist is empty"
          description="Tap the heart on any log to save it here."
          action={
            <Link to="/store">
              <Button icon={<ArrowRight className="w-4 h-4" />}>Browse the store</Button>
            </Link>
          }
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map(({ product, addedAt }) => {
            const inStock = product.quantity > 0;
            return (
              <Card key={product._id} padded={false} className="overflow-hidden flex flex-col">
                <Link to={`/product/${product._id}`} className="block relative aspect-[4/3] bg-surface-hover">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-5xl font-bold text-primary/40">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="absolute top-2.5 right-2.5">
                    <Badge tone={inStock ? 'success' : 'error'} dot>
                      {inStock ? 'In stock' : 'Sold out'}
                    </Badge>
                  </span>
                </Link>

                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-[10.5px] text-ink-muted uppercase tracking-wider mb-1 font-medium">
                    {product.category}
                  </p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-[14px] font-semibold text-ink line-clamp-2 leading-snug hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-ink-muted mt-1">Saved {formatDate(addedAt)}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="font-display text-[18px] font-bold text-ink">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      aria-label="Remove from wishlist"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-error-soft hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    fullWidth
                    className="mt-3"
                    disabled={!inStock}
                    onClick={() => handleMoveToCart(product._id)}
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                  >
                    {inStock ? 'Move to cart' : 'Sold out'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
