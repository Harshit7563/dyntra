import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, fetchCategories } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const MAX_IMAGES = 8;

const empty = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_price: '',
  image_urls: [],
  category_slugs: ['silk-sarees'],
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

  const groupedCategories = useMemo(() => {
    const groups = {};
    for (const c of categories) {
      const key = c.group_type || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [categories]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    if (isNew) return;

    setFetching(true);
    adminApi.product(id)
      .then((p) => {
        const image_urls = Array.isArray(p.image_urls) && p.image_urls.length
          ? p.image_urls
          : (p.image_url ? [p.image_url] : []);
        const category_slugs = Array.isArray(p.categories) && p.categories.length
          ? p.categories.map((c) => c.slug)
          : (p.category_slug ? [p.category_slug] : ['silk-sarees']);
        setForm({
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price,
          compare_price: p.compare_price || '',
          image_urls,
          category_slugs,
          primary_slug: p.category_slug || category_slugs[0] || 'silk-sarees',
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

  const toggleCategory = (slug) => {
    setForm((prev) => {
      const has = prev.category_slugs.includes(slug);
      let category_slugs = has
        ? prev.category_slugs.filter((s) => s !== slug)
        : [...prev.category_slugs, slug];
      if (!category_slugs.length) category_slugs = [slug];
      const primary_slug = category_slugs.includes(prev.primary_slug)
        ? prev.primary_slug
        : category_slugs[0];
      return { ...prev, category_slugs, primary_slug };
    });
  };

  const handleImageUpload = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;

    const remaining = MAX_IMAGES - form.image_urls.length;
    if (remaining <= 0) {
      setAlert({ type: 'error', message: `Maximum ${MAX_IMAGES} images allowed` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);
    clearAlert();
    try {
      const { urls } = await adminApi.uploadProductImages(toUpload);
      setForm((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...urls].slice(0, MAX_IMAGES),
      }));
      setAlert({
        type: 'success',
        message: `${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`,
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index, dir) => {
    setForm((prev) => {
      const next = [...prev.image_urls];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, image_urls: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image_urls.length) {
      setAlert({ type: 'error', message: 'Please upload at least one product image' });
      return;
    }
    if (!form.category_slugs.length) {
      setAlert({ type: 'error', message: 'Please select at least one category' });
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
          image_url: form.image_urls[0],
          image_urls: form.image_urls,
          primary_slug: form.primary_slug,
          category_slugs: form.category_slugs,
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
    <div className="max-w-3xl">
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
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
            Product Images * ({form.image_urls.length}/{MAX_IMAGES})
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageUpload}
            disabled={uploading || form.image_urls.length >= MAX_IMAGES}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-maroon file:text-white file:text-xs file:uppercase file:tracking-wider"
          />
          <p className="text-xs text-gray-500 mt-1">
            Multiple images · JPEG/PNG/WebP/GIF · Max 5 MB each · First image is main photo
          </p>
          {uploading && <p className="text-xs text-maroon mt-2">Uploading...</p>}
          {form.image_urls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.image_urls.map((url, index) => (
                <div key={`${url}-${index}`} className="border border-gold/20 p-2 bg-cream/30">
                  <img src={url} alt="" className="h-28 w-full object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      {index === 0 ? 'Main' : `#${index + 1}`}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="text-[10px] px-1 border disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.image_urls.length - 1} className="text-[10px] px-1 border disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => removeImage(index)} className="text-[10px] text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
            Categories * (select all that apply)
          </label>
          <div className="space-y-4 max-h-72 overflow-y-auto border border-gold/20 p-3">
            {Object.entries(groupedCategories).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-widest text-gold mb-2">{group}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.category_slugs.includes(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {form.category_slugs.length > 0 && (
            <div className="mt-3">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Primary Category *</label>
              <select
                required
                value={form.primary_slug}
                onChange={(e) => update('primary_slug', e.target.value)}
                className="w-full px-3 py-2 border border-gold/30 text-sm bg-white"
              >
                {form.category_slugs.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <option key={slug} value={slug}>
                      {cat?.name || slug}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Occasion</label>
          <input value={form.occasion} onChange={(e) => update('occasion', e.target.value)} className="w-full px-3 py-2 border border-gold/30 text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
