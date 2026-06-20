import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const empty = { name: '', initials: '', rating: 5, review: '', verified: true, source: 'Google Review', review_date: '' };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { alert, busy, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminApi.testimonials());
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
      name: form.name.trim(),
      initials: form.initials.trim().slice(0, 5),
      rating: Number(form.rating) || 5,
      review: form.review.trim(),
      verified: form.verified !== false,
      source: form.source.trim() || 'Google Review',
      review_date: form.review_date.trim(),
    };

    await run(async () => {
      if (editId) await adminApi.updateTestimonial(editId, payload);
      else await adminApi.createTestimonial(payload);
      resetForm();
      await load();
    }, editId ? 'Testimonial updated' : 'Testimonial added');
  };

  const remove = async (itemId) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await run(async () => {
      await adminApi.deleteTestimonial(itemId);
      if (editId === itemId) resetForm();
      await load();
    }, 'Testimonial deleted');
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">Testimonials</h1>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <form onSubmit={save} className="bg-white border border-gold/20 p-4 sm:p-6 space-y-3 mb-8 max-w-xl">
        <p className="text-sm text-maroon font-medium">{editId ? `Editing #${editId}` : 'Add new testimonial'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Initials</label>
            <input value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} className="w-full px-3 py-2 border text-sm" maxLength={5} />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Rating (1-5)</label>
          <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-24 px-3 py-2 border text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Review *</label>
          <textarea required value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} rows={3} className="w-full px-3 py-2 border text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Source</label>
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Date label</label>
            <input value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} placeholder="2 weeks ago" className="w-full px-3 py-2 border text-sm" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="px-4 py-2 bg-maroon text-white text-sm uppercase disabled:opacity-60">
            {busy ? 'Saving...' : editId ? 'Update' : 'Add'}
          </button>
          {editId && <button type="button" onClick={resetForm} className="px-4 py-2 border text-sm">Cancel Edit</button>}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-white border border-gold/20 p-4">
              <p className="font-medium">{t.name} · {t.rating}★</p>
              <p className="text-sm text-gray-600 mt-1">{t.review}</p>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setEditId(t.id); setForm({ name: t.name, initials: t.initials, rating: t.rating, review: t.review, verified: t.verified, source: t.source, review_date: t.review_date || '' }); }} className="text-maroon text-sm">Edit</button>
                <button type="button" onClick={() => remove(t.id)} className="text-red-500 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
