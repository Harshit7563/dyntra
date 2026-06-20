import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const empty = { title: '', subtitle: '', image_url: '', cta_text: 'Shop Now', cta_link: '/products', sort_order: 0 };

export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { alert, busy, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      setSlides(await adminApi.hero());
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image_url: form.image_url.trim(),
      cta_text: form.cta_text.trim() || 'Shop Now',
      cta_link: form.cta_link.trim() || '/products',
      sort_order: Number(form.sort_order) || 0,
    };

    await run(async () => {
      if (editId) await adminApi.updateHero(editId, payload);
      else await adminApi.createHero(payload);
      resetForm();
      await load();
    }, editId ? 'Slide updated' : 'Slide added');
  };

  const remove = async (slideId) => {
    if (!window.confirm('Delete this slide?')) return;
    await run(async () => {
      await adminApi.deleteHero(slideId);
      if (editId === slideId) resetForm();
      await load();
    }, 'Slide deleted');
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">Hero Slides</h1>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <form onSubmit={save} className="bg-white border border-gold/20 p-4 sm:p-6 space-y-3 mb-8 max-w-xl">
        <p className="text-sm text-maroon font-medium">{editId ? `Editing slide #${editId}` : 'Add new slide'}</p>
        {Object.keys(empty).map((key) => (
          <div key={key}>
            <label className="block text-xs uppercase text-gray-500 mb-1">{key.replace('_', ' ')}</label>
            <input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: key === 'sort_order' ? Number(e.target.value) : e.target.value })}
              className="w-full px-3 py-2 border text-sm"
              required={key === 'title' || key === 'image_url'}
            />
          </div>
        ))}
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="px-4 py-2 bg-maroon text-white text-sm uppercase disabled:opacity-60">
            {busy ? 'Saving...' : editId ? 'Update Slide' : 'Add Slide'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="px-4 py-2 border text-sm">Cancel Edit</button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : slides.length === 0 ? (
        <p className="text-gray-500">No hero slides yet.</p>
      ) : (
        <div className="space-y-4">
          {slides.map((s) => (
            <div key={s.id} className="bg-white border border-gold/20 p-4 flex flex-col sm:flex-row gap-4">
              <img src={s.image_url} alt="" className="w-full sm:w-40 h-24 object-cover bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-gray-500">{s.subtitle}</p>
                <p className="text-xs text-gray-400 mt-1">Order: {s.sort_order}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button type="button" onClick={() => { setEditId(s.id); setForm({ title: s.title, subtitle: s.subtitle || '', image_url: s.image_url, cta_text: s.cta_text, cta_link: s.cta_link, sort_order: s.sort_order }); }} className="text-maroon text-sm">Edit</button>
                <button type="button" onClick={() => remove(s.id)} className="text-red-500 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
