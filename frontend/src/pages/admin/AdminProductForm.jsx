import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, fetchCategories } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const empty = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_price: '',
  image_url: '',
  primary_slug: 'silk-sarees',
  occasion: 'Traditional Sarees',
  stock: 5,
  is_featured: false,
  is_new: false,
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const { alert, busy, run, clearAlert, setAlert } = useAdminAction();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    if (isNew) return;

    setFetching(true);
    adminApi.product(id)
      .then((p) => {
        setForm({
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price,
          compare_price: p.compare_price || '',
          image_url: p.image_url || '',
          primary_slug: p.category_slug || 'silk-sarees',
          occasion: p.occasion || '',
          stock: p.stock,
          is_featured: !!p.is_featured,
          is_new: !!p.is_new,
        });
      })
      .catch((err) => run(() => Promise.reject(err)))
      .finally(() => setFetching(false));
  }, [id, isNew]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && isNew && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    clearAlert();
    try {
      const { url } = await adminApi.uploadProductImage(file);
      update('image_url', url);
      setAlert({ type: 'success', message: 'Image uploaded' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image_url) {
      setAlert({ type: 'error', message: 'Please upload a product image' });
      return;
    }

    try {
      await run(async () => {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description.trim(),
          price: Number(form.price),
          compare_price: form.compare_price ? Number(form.compare_price) : null,
          image_url: form.image_url,
          primary_slug: form.primary_slug,
          category_slugs: [form.primary_slug],
          occasion: form.occasion.trim(),
          stock: Number(form.stock),
          is_featured: form.is_featured,
          is_new: form.is_new,
        };

        if (isNew) await adminApi.createProduct(payload);
        else await adminApi.updateProduct(id, payload);
      }, isNew ? 'Product created' : 'Product updated');

      navigate('/admin/products');
    } catch {
      // error shown via alert
    }
  };

  if (fetching) {
    return <p className="text-gray-500">Loading product...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">{isNew ? 'Add Product' : 'Edit Product'}</h1>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <form onSubmit={handleSubmit} className="bg-white border border-gold/20 p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Name *</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Slug *</label>
          <input required value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gold/30 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Product Image *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-maroon file:text-white file:text-xs file:uppercase file:tracking-wider"
          />
          <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP or GIF · Max 5 MB</p>
          {uploading && <p className="text-xs text-maroon mt-2">Uploading...</p>}
          {form.image_url && (
            <div className="mt-3 flex items-start gap-4">
              <img src={form.image_url} alt="" className="h-32 w-24 object-cover border border-gold/20" />
              <button
                type="button"
                onClick={() => update('image_url', '')}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Remove image
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Occasion</label>
          <input value={form.occasion} onChange={(e) => update('occasion', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Price *</label>
            <input type="number" required min="1" value={form.price} onChange={(e) => update('price', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Compare Price</label>
            <input type="number" value={form.compare_price} onChange={(e) => update('compare_price', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Primary Category *</label>
            <select required value={form.primary_slug} onChange={(e) => update('primary_slug', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm bg-white">
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_new} onChange={(e) => update('is_new', e.target.checked)} />
            New Arrival
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={busy || uploading} className="px-6 py-2.5 bg-maroon text-white text-sm uppercase tracking-wider disabled:opacity-60">
            {busy ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2.5 border text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
