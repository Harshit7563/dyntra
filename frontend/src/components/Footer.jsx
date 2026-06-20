import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { subscribeNewsletter, fetchCategoriesGrouped } from '../api';
import { COMPANY, POLICY_LINKS } from '../data/company';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [grouped, setGrouped] = useState(null);

  useEffect(() => {
    fetchCategoriesGrouped().then(setGrouped).catch(console.error);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await subscribeNewsletter(email);
      setStatus('Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl text-gold-light mb-2">{COMPANY.brand}</h3>
            <p className="text-xs text-gray-500 mb-3">A brand of {COMPANY.legalName}</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Authentic handwoven silk sarees from master weavers. Every thread tells a story of India.
            </p>
            <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
              <p>CIN: {COMPANY.cin}</p>
              <p>{COMPANY.fullAddress}</p>
              <p className="pt-2">
                <a href={COMPANY.phoneTel} className="hover:text-gold-light">{COMPANY.phone}</a>
              </p>
              <p>
                <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">
                  WhatsApp →
                </a>
              </p>
              <p className="pt-1">
                <Link to="/contact" className="text-gold hover:text-gold-light">Contact Us →</Link>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-gold-light">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-gold-light">Categories</Link></li>
              {grouped?.fabric?.items.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.slug}`} className="hover:text-gold-light">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-gold-light">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold-light">Contact Us</Link></li>
              <li><Link to="/account" className="hover:text-gold-light">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {POLICY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-gold-light">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4 max-w-md">Be the first to know about our latest collections.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded text-sm focus:outline-none focus:border-gold"
            />
            <button type="submit" className="px-4 py-2 bg-maroon hover:bg-maroon-dark rounded text-sm transition-colors">
              Join
            </button>
          </form>
          {status && <p className="text-xs text-gold-light mt-2">{status}</p>}
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
            <span className="hidden sm:inline"> · {COMPANY.brand} is a registered brand.</span>
          </p>
          <p>CIN: {COMPANY.cin} · Maharashtra, India</p>
        </div>
      </div>
    </footer>
  );
}
