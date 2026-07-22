import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/hero', label: 'Hero Slides' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/payment', label: 'Payment Gateway' },
  { to: '/admin/festival', label: 'Festival Theme' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="lg:hidden bg-charcoal text-white px-4 py-3 flex items-center justify-between">
        <span className="font-serif text-lg">Dyntra Admin</span>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="text-sm uppercase tracking-wider">
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <aside className={`${menuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-charcoal text-white shrink-0`}>
        <div className="p-6 border-b border-white/10 hidden lg:block">
          <p className="font-serif text-xl text-gold-light">Dyntra Admin</p>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded text-sm ${isActive ? 'bg-maroon text-white' : 'text-gray-300 hover:bg-white/10'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/" className="block px-4 py-2.5 rounded text-sm text-gray-300 hover:bg-white/10">
            View Store →
          </Link>
          <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded text-sm text-gray-300 hover:bg-white/10">
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
