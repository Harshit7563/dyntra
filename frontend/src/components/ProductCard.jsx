import { Link } from 'react-router-dom';
import { formatPrice } from '../api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] uppercase tracking-wider px-2 py-1">
            Out of Stock
          </span>
        )}
        {!outOfStock && product.stock <= 1 && (
          <span className="absolute top-3 left-3 bg-maroon text-white text-[10px] uppercase tracking-wider px-2 py-1">
            Only {product.stock} left
          </span>
        )}
        {product.is_new && (
          <span className="absolute top-3 right-3 bg-gold text-charcoal text-[10px] uppercase tracking-wider px-2 py-1">
            New
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-4 h-4 ${inWishlist ? 'fill-maroon text-maroon' : 'fill-none text-charcoal'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <Link to={`/products/${product.slug}`}>
        <h3 className="font-serif text-sm sm:text-base leading-snug hover:text-maroon transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
      </Link>

      <p className="text-maroon font-medium mb-3">{formatPrice(product.price)}</p>

      <button
        onClick={() => addToCart(product)}
        disabled={outOfStock}
        className="w-full py-2.5 border border-maroon text-maroon text-xs uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-maroon"
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}
