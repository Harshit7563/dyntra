import { useEffect, useState, useRef } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const fileRefs = useRef({});
  const { alert, run, clearAlert, setAlert } = useAdminAction();

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

  const updateLocal = (index, patch) => {
    setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const save = async (cat) => {
    await run(async () => {
      const updated = await adminApi.updateCategory(cat.id, {
        name: cat.name.trim(),
        description: cat.description,
        sort_order: Number(cat.sort_order),
        image_url: cat.image_url || null,
      });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, ...updated } : c)));
    }, `"${cat.name}" saved`);
  };

  const uploadImage = async (cat, index, file) => {
    if (!file) return;
    setUploadingId(cat.id);
    clearAlert();
    try {
      const { url } = await adminApi.uploadProductImage(file);
      updateLocal(index, { image_url: url });
      await adminApi.updateCategory(cat.id, {
        name: cat.name.trim(),
        description: cat.description,
        sort_order: Number(cat.sort_order),
        image_url: url,
      });
      setAlert({ type: 'success', message: `"${cat.name}" image updated` });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Image upload failed' });
    } finally {
      setUploadingId(null);
      if (fileRefs.current[cat.id]) fileRefs.current[cat.id].value = '';
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Categories ({categories.length})</h1>
      <p className="text-sm text-gray-500 mb-6">
        Change category image, name, or sort order. Image updates save automatically.
      </p>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="bg-white border border-gold/20 p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 w-8">#{cat.id}</span>
                <div className="w-20 h-16 border border-gold/20 bg-gray-100 overflow-hidden shrink-0">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <input
                  value={cat.name}
                  onChange={(e) => updateLocal(i, { name: e.target.value })}
                  className="w-full px-3 py-2 border text-sm"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={(el) => { fileRefs.current[cat.id] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingId === cat.id}
                    onChange={(e) => uploadImage(cat, i, e.target.files?.[0])}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:border-0 file:bg-maroon file:text-white file:text-[10px] file:uppercase"
                  />
                  {uploadingId === cat.id && <span className="text-xs text-maroon">Uploading...</span>}
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">{cat.group_type}</span>
                </div>
              </div>

              <input
                type="number"
                value={cat.sort_order}
                onChange={(e) => updateLocal(i, { sort_order: Number(e.target.value) })}
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
