import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import FeaturesBar from '../components/FeaturesBar';
import ProductCard from '../components/ProductCard';
import { fetchHeroSlides, fetchProducts, fetchCategoriesGrouped, fetchTestimonials } from '../api';
import { COMPANY } from '../data/company';

const priceRanges = [
  { slug: 'under-500', label: 'Under ₹500', desc: 'Budget Picks' },
  { slug: '500-1500', label: '₹500 – ₹1,500', desc: 'Everyday Silks' },
  { slug: '1500-3000', label: '₹1,500 – ₹3,000', desc: 'Festive Favourites' },
  { slug: '3000-6000', label: '₹3,000 – ₹6,000', desc: 'Premium Collection' },
];

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [products, setProducts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchHeroSlides(),
      fetchProducts({ new: 'true', limit: 8 }).then((r) => r.products),
      fetchCategoriesGrouped(),
      fetchTestimonials(),
    ])
      .then(([s, p, c, t]) => {
        setSlides(s);
        setProducts(p);
        setGrouped(c);
        setTestimonials(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-serif text-xl text-maroon animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm text-center py-3 px-4">
          Some content failed to load. Please refresh the page.
        </div>
      )}
      <HeroCarousel slides={slides} />
      <FeaturesBar />

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-2">New Arrival</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/products?new=true"
            className="inline-block px-10 py-3 border border-maroon text-maroon text-sm uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Shop by Category */}
      {Object.entries(grouped).map(([key, { label, items }]) => (
        <section key={key} className={key === 'fabric' || key === 'occasion' ? 'bg-white py-16 sm:py-20' : 'max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20'}>
          <div className={key === 'fabric' || key === 'occasion' ? 'max-w-7xl mx-auto px-4 sm:px-6' : ''}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-maroon mb-1">{label}</h2>
                <div className="w-12 h-0.5 bg-gold" />
              </div>
              <Link to={`/categories#${key}`} className="text-xs text-maroon uppercase tracking-widest hover:underline hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {items.slice(0, key === 'regional' || key === 'color' ? 8 : 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group border border-gold/20 bg-cream hover:border-maroon transition-all overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="p-2.5 font-serif text-xs sm:text-sm text-center text-charcoal group-hover:text-maroon leading-snug">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6 sm:hidden">
              <Link to={`/categories#${key}`} className="text-xs text-maroon uppercase tracking-widest hover:underline">
                View All {label} →
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* Shop by Price */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-2">Shop by Price</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {priceRanges.map((range) => (
            <Link
              key={range.slug}
              to={`/products?price_range=${range.slug}`}
              className="border border-gold/30 p-6 text-center hover:border-maroon hover:bg-white transition-all group"
            >
              <h3 className="font-serif text-lg text-maroon group-hover:text-maroon-dark">{range.label}</h3>
              <p className="text-xs text-gray-500 mt-2">{range.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-maroon text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <p className="text-gold text-sm tracking-widest uppercase mb-2">Rated 4.9/5 on Google · 66 reviews</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-2">What Our Customers Say</h2>
            <p className="text-white/70 text-sm">Real reviews from real customers across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {testimonials.slice(0, 6).map((t) => (
              <div key={t.id} className="bg-white/10 backdrop-blur-sm p-6 rounded-sm">
                <div className="flex gap-1 text-gold mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-white/90 leading-relaxed mb-4">{t.review}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-medium">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-white/50">
                      {t.verified && '✓ Verified Purchase · '}{t.source} · {t.review_date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">MAHARASHTRA · INDIA</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-6 leading-tight">
              Every thread tells a story of India
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Dyntra, we partner with master weavers from Kanchipuram and beyond to bring you pure,
              handwoven silk sarees. Every piece celebrates tradition, craftsmanship, and the timeless
              beauty of Indian silk.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              We believe in authenticity, fair practices, and sarees that become heirlooms.
            </p>
            <Link
              to="/about"
              className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors"
            >
              Our Story
            </Link>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/36114637/pexels-photo-36114637.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Handwoven silk saree"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Registered Office */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">VISIT US</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-6">Registered Office</h2>
          <p className="text-gray-600 mb-2 max-w-2xl mx-auto leading-relaxed">
            {COMPANY.address.line1}<br />
            {COMPANY.address.line2}<br />
            {COMPANY.address.city}, {COMPANY.address.state} – {COMPANY.address.pincode}
          </p>
          <p className="text-gray-500 text-sm mb-6">Mon – Sat: 10:00 AM to 7:00 PM</p>
          <p className="text-gray-600 mb-2">
            <a href={COMPANY.phoneTel} className="hover:text-maroon">{COMPANY.phone}</a>
            {' · '}
            <a href={`mailto:${COMPANY.email}`} className="hover:text-maroon">{COMPANY.email}</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href={COMPANY.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-maroon text-maroon text-sm uppercase tracking-widest hover:bg-maroon hover:text-white transition-colors"
            >
              Get Directions
            </a>
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
