import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, formatPrice } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

export default function AdminProducts() {
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { alert, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    clearAlert();
    try {
      const result = await adminApi.products({ page, limit: 20, ...(search ? { search } : {}) });
      setData(result);
    } catch (err) {
      setData({ products: [], total: 0, page: 1, pages: 1 });
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await run(async () => {
      await adminApi.deleteProduct(id);
      await load();
    }, 'Product deleted');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl text-maroon">Products ({data.total})</h1>
        <Link to="/admin/products/new" className="px-4 py-2 bg-maroon text-white text-sm uppercase tracking-wider hover:bg-maroon-dark text-center">
          Add Product
        </Link>
      </div>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search products..."
        className="w-full max-w-md px-4 py-2 border border-gold/30 mb-4 text-sm"
      />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data.products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="bg-white border border-gold/20 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Flags</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id} className="border-t border-gold/10">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt="" className="w-10 h-12 object-cover bg-gray-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{formatPrice(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3 text-xs">
                      {p.is_featured && <span className="text-gold">Featured </span>}
                      {p.is_new && <span className="text-maroon">New</span>}
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap">
                      <Link to={`/admin/products/${p.id}`} className="text-maroon hover:underline">Edit</Link>
                      <button type="button" onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {data.pages}</span>
              <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
