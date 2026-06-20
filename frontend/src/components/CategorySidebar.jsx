import { Link } from 'react-router-dom';

export default function CategorySidebar({ grouped, activeSlug, onSelect, compact = false }) {
  if (!grouped) return null;

  return (
    <div className={`space-y-6 ${compact ? '' : 'max-h-[70vh] overflow-y-auto pr-2'}`}>
      {Object.entries(grouped).map(([key, { label, items }]) => (
        <div key={key}>
          <h3 className="text-xs uppercase tracking-widest text-maroon mb-2 font-medium">{label}</h3>
          <ul className="space-y-1.5">
            {items.map((cat) => (
              <li key={cat.id}>
                {onSelect ? (
                  <button
                    onClick={() => onSelect(cat.slug)}
                    className={`text-sm text-left hover:text-maroon transition-colors ${
                      activeSlug === cat.slug ? 'text-maroon font-medium' : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ) : (
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className={`text-sm hover:text-maroon transition-colors ${
                      activeSlug === cat.slug ? 'text-maroon font-medium' : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
