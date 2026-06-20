import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api';
import { calcOrderTotals, FREE_SHIPPING_MIN } from '../utils/order';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { shipping, total: grandTotal } = calcOrderTotals(total);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-maroon mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-8">Your cart is empty</p>
        <Link
          to="/products"
          className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-serif text-3xl text-maroon mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 sm:gap-6 border-b border-gold/20 pb-6">
              <Link to={`/products/${item.slug}`} className="w-24 sm:w-32 aspect-[3/4] shrink-0 overflow-hidden bg-gray-100">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`}>
                  <h3 className="font-serif text-base sm:text-lg hover:text-maroon transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-maroon font-medium mt-2">{formatPrice(item.price)}</p>
                <p className="text-sm text-gray-600 mt-1 sm:hidden">
                  Total: {formatPrice(Number(item.price) * item.quantity)}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-gold/30">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-gray-500 hover:text-maroon underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium text-maroon hidden sm:block">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gold/20 p-6 sticky top-24 sm:top-28">
            <h2 className="font-serif text-xl text-maroon mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
            </div>
            <div className="flex justify-between font-medium text-lg border-t border-gold/20 pt-4 mb-6">
              <span>Total</span>
              <span className="text-maroon">{formatPrice(grandTotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full py-3.5 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors mb-3 text-center"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={clearCart}
              className="w-full py-2 text-xs text-gray-500 hover:text-maroon"
            >
              Clear Cart
            </button>
            {total < FREE_SHIPPING_MIN && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                Add {formatPrice(FREE_SHIPPING_MIN - total)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
