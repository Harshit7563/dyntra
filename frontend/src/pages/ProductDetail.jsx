import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct, formatPrice } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FeatureList from '../components/FeatureList';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    fetchProduct(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-serif text-xl text-maroon animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-xl text-gray-500 mb-4">Product not found</p>
        <Link to="/products" className="text-maroon underline">Back to shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <nav className="text-xs text-gray-500 mb-8">
        <Link to="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-maroon">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal truncate max-w-[40vw] sm:max-w-none inline-block align-bottom">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          {product.category_name && (
            <Link
              to={`/products?category=${product.category_slug}`}
              className="text-xs uppercase tracking-widest text-gold hover:text-maroon"
            >
              {product.category_name}
            </Link>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl text-maroon mt-2 mb-4 leading-snug">
            {product.name}
          </h1>

          <p className="text-2xl text-maroon font-medium mb-6">{formatPrice(product.price)}</p>

          {outOfStock ? (
            <p className="text-sm text-red-600 mb-4 font-medium">Out of stock</p>
          ) : product.stock <= 1 ? (
            <p className="text-sm text-maroon mb-4">Only {product.stock} left in stock</p>
          ) : null}

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-gray-500">Quantity</label>
            <div className="flex items-center border border-gold/30">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={outOfStock}
                className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                disabled={outOfStock}
                className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 py-3.5 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of Stock' : added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="px-6 py-3.5 border border-maroon text-maroon text-sm uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${inWishlist ? 'fill-current' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {inWishlist ? 'In Wishlist' : 'Wishlist'}
            </button>
          </div>

          <div className="border-t border-gold/20 pt-6">
            <FeatureList />
          </div>
        </div>
      </div>
    </div>
  );
}
