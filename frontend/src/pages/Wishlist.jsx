import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api';

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-maroon mb-4">Wishlist</h1>
        <p className="text-gray-500 mb-8">Your wishlist is empty</p>
        <Link
          to="/products"
          className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors"
        >
          Explore Sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-serif text-3xl text-maroon mb-8">Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <div key={item.id} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
              <Link to={`/products/${item.slug}`}>
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                aria-label="Remove from wishlist"
              >
                <svg className="w-4 h-4 fill-maroon text-maroon" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <Link to={`/products/${item.slug}`}>
              <h3 className="font-serif text-sm leading-snug hover:text-maroon line-clamp-2 mb-2">{item.name}</h3>
            </Link>
            <p className="text-maroon font-medium mb-3">{formatPrice(item.price)}</p>
            <button
              onClick={() => addToCart(item)}
              className="w-full py-2 border border-maroon text-maroon text-xs uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
