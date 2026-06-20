import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategoriesGrouped } from '../api';
import CategorySidebar from '../components/CategorySidebar';

export default function Categories() {
  const [grouped, setGrouped] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesGrouped()
      .then(setGrouped)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-serif text-xl text-maroon animate-pulse">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-2">Shop by Category</h1>
        <p className="text-gray-500 text-sm mt-2">Browse sarees by fabric, occasion, design, region & colour</p>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="space-y-16">
        {Object.entries(grouped || {}).map(([key, { label, items }]) => (
          <section key={key} id={key}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-maroon">{label}</h2>
              <span className="text-xs text-gray-400">{items.length} categories</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {items.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group border border-gold/20 bg-white hover:border-maroon transition-all overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-serif text-sm text-charcoal group-hover:text-maroon leading-snug">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 p-6 bg-white border border-gold/20 lg:hidden">
        <h3 className="font-serif text-lg text-maroon mb-4">All Categories</h3>
        <CategorySidebar grouped={grouped} />
      </div>
    </div>
  );
}
