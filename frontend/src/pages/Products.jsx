import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import { fetchProducts, fetchCategoriesGrouped } from '../api';

const PRICE_FILTERS = [
  { label: 'All Prices', value: '' },
  { label: 'Under ₹500', value: 'under-500' },
  { label: '₹500 – ₹1,500', value: '500-1500' },
  { label: '₹1,500 – ₹3,000', value: '1500-3000' },
  { label: '₹3,000 – ₹6,000', value: '3000-6000' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [grouped, setGrouped] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const category = searchParams.get('category') || '';
  const priceRange = searchParams.get('price_range') || '';
  const isNew = searchParams.get('new') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  useEffect(() => {
    fetchCategoriesGrouped().then(setGrouped).catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = { page, limit: 24 };
    if (category) params.category = category;
    if (priceRange) params.price_range = priceRange;
    if (isNew) params.new = isNew;
    if (search) params.search = search;

    fetchProducts(params)
      .then(setData)
      .catch((err) => {
        setError(err.message);
        setData({ products: [], total: 0, page: 1, pages: 1 });
      })
      .finally(() => setLoading(false));
  }, [category, priceRange, isNew, search, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setSearch('');
  };

  const activeCategory = grouped
    ? Object.values(grouped).flatMap((g) => g.items).find((c) => c.slug === category)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-4xl text-maroon mb-2">
          {activeCategory?.name || (isNew ? 'New Arrivals' : 'All Products')}
        </h1>
        {activeCategory?.group_type && grouped?.[activeCategory.group_type] && (
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
            {grouped[activeCategory.group_type].label}
          </p>
        )}
        <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <input
              type="text"
              placeholder="Search sarees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gold/30 bg-white text-sm focus:outline-none focus:border-maroon"
            />
            <select value={priceRange} onChange={(e) => updateFilter('price_range', e.target.value)} className="w-full px-4 py-2 border border-gold/30 bg-white text-sm">
              {PRICE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isNew === 'true'} onChange={(e) => updateFilter('new', e.target.checked ? 'true' : '')} />
              New Arrivals only
            </label>
            <button type="button" onClick={() => updateFilter('category', '')} className={`text-sm hover:text-maroon ${!category ? 'text-maroon font-medium' : 'text-gray-600'}`}>
              All Products
            </button>
            <CategorySidebar grouped={grouped} activeSlug={category} onSelect={(slug) => updateFilter('category', slug)} />
            {(category || priceRange || isNew || search) && (
              <button type="button" onClick={clearFilters} className="text-xs text-maroon underline hover:no-underline">Clear all filters</button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-6 space-y-3">
            <input
              type="text"
              placeholder="Search sarees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-gold/30 bg-white text-sm focus:outline-none focus:border-maroon"
            />
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="w-full px-4 py-2.5 border border-maroon text-maroon text-sm uppercase tracking-wider">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {showFilters && (
              <div className="space-y-3 p-4 border border-gold/20 bg-white">
                <select value={category} onChange={(e) => updateFilter('category', e.target.value)} className="w-full px-4 py-2.5 border border-gold/30 bg-white text-sm">
                  <option value="">All Categories</option>
                  {grouped && Object.entries(grouped).map(([key, { label, items }]) => (
                    <optgroup key={key} label={label}>
                      {items.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <select value={priceRange} onChange={(e) => updateFilter('price_range', e.target.value)} className="w-full px-4 py-2.5 border border-gold/30 bg-white text-sm">
                  {PRICE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isNew === 'true'} onChange={(e) => updateFilter('new', e.target.checked ? 'true' : '')} />
                  New Arrivals only
                </label>
                {(category || priceRange || isNew || search) && (
                  <button type="button" onClick={clearFilters} className="text-xs text-maroon underline">Clear all filters</button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
              <button type="button" onClick={() => window.location.reload()} className="block mx-auto mt-2 text-maroon underline">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 font-serif text-maroon animate-pulse">Loading products...</div>
          ) : data.products.length === 0 && !error ? (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-gray-500 mb-4">No products found</p>
              <button type="button" onClick={clearFilters} className="text-maroon underline text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 sm:mb-6">{data.total} products</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border border-maroon text-maroon text-sm disabled:opacity-40">Previous</button>
                  <span className="text-sm text-gray-500">Page {page} of {data.pages}</span>
                  <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-4 py-2 border border-maroon text-maroon text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
