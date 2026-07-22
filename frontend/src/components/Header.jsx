import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategoriesGrouped } from '../api';
import { useFestival } from '../context/FestivalContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [grouped, setGrouped] = useState(null);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isLoggedIn, user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme } = useFestival();

  useEffect(() => {
    fetchCategoriesGrouped().then(setGrouped).catch(console.error);
  }, []);

  const navLinks = [
    { to: '/products', label: 'Shop All' },
    { to: '/categories', label: 'Categories' },
    { to: '/products?new=true', label: 'New Arrivals' },
    { to: '/about', label: 'Our Story' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="flex flex-col items-center lg:items-start">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-maroon tracking-wide">
              Dyntra
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold hidden sm:block">
              Pure Silk Sarees
            </span>
            {theme?.active && theme?.show_badge && theme?.badge_text ? (
              <span className="mt-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-maroon/80 bg-gold/20 px-1.5 py-0.5">
                {theme.badge_text}
              </span>
            ) : null}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm tracking-wide uppercase hover:text-maroon transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('dyntra-open-ai'))}
              className="text-sm tracking-wide uppercase text-maroon hover:text-maroon/80 transition-colors"
            >
              Shop with AI
            </button>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:text-maroon transition-colors"
                  aria-label="Account menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gold/20 shadow-lg py-1 z-50">
                    <p className="px-4 py-2 text-xs text-gray-500 border-b border-gold/10 truncate">{user?.name}</p>
                    <Link to="/account" className="block px-4 py-2 text-sm hover:bg-cream hover:text-maroon" onClick={() => setUserMenuOpen(false)}>
                      My Account
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-cream hover:text-maroon"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-xs uppercase tracking-wider hover:text-maroon transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="hidden sm:block px-3 py-1.5 border border-maroon text-maroon text-xs uppercase tracking-wider hover:bg-maroon hover:text-white transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            <Link to="/wishlist" className="relative p-2 hover:text-maroon transition-colors" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 hover:text-maroon transition-colors" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden pb-4 border-t border-gold/10 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 text-sm tracking-wide uppercase hover:text-maroon"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="block py-3 text-sm tracking-wide uppercase text-maroon w-full text-left"
              onClick={() => {
                setMenuOpen(false);
                window.dispatchEvent(new Event('dyntra-open-ai'));
              }}
            >
              Shop with AI
            </button>
            {!isLoggedIn && (
              <div className="pt-3 mt-3 border-t border-gold/10 flex gap-4">
                <Link to="/login" className="text-sm tracking-wide uppercase hover:text-maroon" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="text-sm tracking-wide uppercase text-maroon hover:underline" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <Link to="/account" className="block py-3 text-sm tracking-wide uppercase hover:text-maroon" onClick={() => setMenuOpen(false)}>
                My Account
              </Link>
            )}
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="block py-3 text-sm tracking-wide uppercase hover:text-maroon w-full text-left"
            >
              Browse Categories {catMenuOpen ? '−' : '+'}
            </button>
            {catMenuOpen && grouped && (
              <div className="pl-4 pb-2 max-h-64 overflow-y-auto space-y-4">
                {Object.entries(grouped).map(([key, { label, items }]) => (
                  <div key={key}>
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">{label}</p>
                    {items.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        className="block py-1 text-xs text-gray-600 hover:text-maroon"
                        onClick={() => setMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link to="/categories" className="text-xs text-maroon underline" onClick={() => setMenuOpen(false)}>
                  View all categories →
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
