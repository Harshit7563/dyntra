import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

function CtaLink({ href, children, className }) {
  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href || '/products'} className={className}>
      {children}
    </Link>
  );
}

export default function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides?.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides?.length) return null;

  const slide = slides[current];
  const ctaClass = 'inline-block px-8 py-3 bg-maroon hover:bg-maroon-dark text-white text-sm uppercase tracking-widest transition-colors';

  return (
    <section className="relative h-[60vh] sm:h-[75vh] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-lg text-white">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium mb-4 leading-tight">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
            <CtaLink href={slide.cta_link || '/products'} className={ctaClass}>
              {slide.cta_text || 'Shop Now'}
            </CtaLink>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? 'bg-gold' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
