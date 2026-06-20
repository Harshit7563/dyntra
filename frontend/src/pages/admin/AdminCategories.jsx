import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alert, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await adminApi.categories());
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (cat) => {
    await run(async () => {
      await adminApi.updateCategory(cat.id, {
        name: cat.name.trim(),
        description: cat.description,
        sort_order: Number(cat.sort_order),
      });
    }, `"${cat.name}" saved`);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Categories ({categories.length})</h1>
      <p className="text-sm text-gray-500 mb-6">Edit name and sort order, then click Save on each row.</p>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat, i) => (
            <div key={cat.id} className="bg-white border border-gold/20 p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <span className="text-xs text-gray-400 w-8 shrink-0">#{cat.id}</span>
              <input
                value={cat.name}
                onChange={(e) => setCategories((prev) => prev.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))}
                className="flex-1 px-3 py-2 border text-sm min-w-0"
              />
              <input
                type="number"
                value={cat.sort_order}
                onChange={(e) => setCategories((prev) => prev.map((c, idx) => idx === i ? { ...c, sort_order: Number(e.target.value) } : c))}
                className="w-20 px-3 py-2 border text-sm shrink-0"
                title="Sort order"
              />
              <button type="button" onClick={() => save(categories[i])} className="px-4 py-2 bg-maroon text-white text-xs uppercase shrink-0">
                Save
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
