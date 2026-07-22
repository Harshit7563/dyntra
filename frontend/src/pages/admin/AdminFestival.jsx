import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const FESTIVAL_OPTIONS = [
  { id: 'none', label: 'None (default Dyntra)' },
  { id: 'diwali', label: 'Diwali' },
  { id: 'rakhi', label: 'Raksha Bandhan' },
  { id: 'holi', label: 'Holi' },
  { id: 'eid', label: 'Eid' },
  { id: 'navratri', label: 'Navratri' },
  { id: 'dussehra', label: 'Dussehra' },
  { id: 'christmas', label: 'Christmas' },
  { id: 'new_year', label: 'New Year' },
  { id: 'custom', label: 'Custom' },
];

const empty = {
  enabled: false,
  festival_key: 'none',
  label: '',
  tagline: '',
  badge_text: '',
  show_badge: true,
  announcements: '',
  accent_primary: '#7B1E3A',
  accent_secondary: '#C9A84C',
  accent_bg: '#FAF7F2',
  starts_at: '',
  ends_at: '',
};

function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function AdminFestival() {
  const [form, setForm] = useState(empty);
  const [presets, setPresets] = useState({});
  const [loading, setLoading] = useState(true);
  const { alert, busy, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.festivalSettings();
      const s = data.settings || {};
      setPresets(data.presets || {});
      setForm({
        enabled: Boolean(s.enabled),
        festival_key: s.festival_key || 'none',
        label: s.label || '',
        tagline: s.tagline || '',
        badge_text: s.badge_text || '',
        show_badge: s.show_badge !== false,
        announcements: s.announcements || '',
        accent_primary: s.accent_primary || '#7B1E3A',
        accent_secondary: s.accent_secondary || '#C9A84C',
        accent_bg: s.accent_bg || '#FAF7F2',
        starts_at: toDateInput(s.starts_at),
        ends_at: toDateInput(s.ends_at),
      });
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyPreset = (key) => {
    const preset = presets[key] || {};
    setForm((prev) => ({
      ...prev,
      festival_key: key,
      label: preset.label ?? prev.label,
      tagline: preset.tagline ?? prev.tagline,
      badge_text: preset.badge_text ?? prev.badge_text,
      announcements: preset.announcements ?? prev.announcements,
      accent_primary: preset.accent_primary || prev.accent_primary,
      accent_secondary: preset.accent_secondary || prev.accent_secondary,
      accent_bg: preset.accent_bg || prev.accent_bg,
      enabled: key === 'none' ? false : prev.enabled || true,
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    await run(async () => {
      const updated = await adminApi.updateFestivalSettings({
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      });
      setForm((prev) => ({
        ...prev,
        ...updated,
        starts_at: toDateInput(updated.starts_at),
        ends_at: toDateInput(updated.ends_at),
      }));
    }, 'Festival theme saved — refresh the store to see it');
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Festival Theme</h1>
      <p className="text-sm text-gray-500 mb-6">
        Turn on Diwali, Rakhi, Holi, Eid and more. Changes announcement bar, colours, and a store badge.
      </p>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <form onSubmit={save} className="bg-white border border-gold/20 p-5 sm:p-6 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="accent-maroon w-4 h-4"
          />
          <span className="text-sm font-medium">Enable festival theme on store</span>
        </label>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Festival</label>
          <select
            value={form.festival_key}
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full px-3 py-2 border text-sm"
          >
            {FESTIVAL_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">Selecting a festival fills colours & copy — you can still edit.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Display name</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
              placeholder="Diwali"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Badge text</label>
            <input
              value={form.badge_text}
              onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
              placeholder="Diwali Special"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Tagline</label>
          <input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-3 py-2 border text-sm"
            placeholder="Light up your festive wardrobe"
          />
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Announcement bar (one per line or · separated)</label>
          <textarea
            value={form.announcements}
            onChange={(e) => setForm({ ...form, announcements: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border text-sm"
            placeholder={'Diwali collection is live\nFree shipping above ₹999'}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Primary</label>
            <input
              type="color"
              value={form.accent_primary}
              onChange={(e) => setForm({ ...form, accent_primary: e.target.value })}
              className="w-full h-10 border cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Gold / accent</label>
            <input
              type="color"
              value={form.accent_secondary}
              onChange={(e) => setForm({ ...form, accent_secondary: e.target.value })}
              className="w-full h-10 border cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Background</label>
            <input
              type="color"
              value={form.accent_bg}
              onChange={(e) => setForm({ ...form, accent_bg: e.target.value })}
              className="w-full h-10 border cursor-pointer"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Starts (optional)</label>
            <input
              type="date"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Ends (optional)</label>
            <input
              type="date"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.show_badge}
            onChange={(e) => setForm({ ...form, show_badge: e.target.checked })}
            className="accent-maroon w-4 h-4"
          />
          <span className="text-sm">Show festival badge in header</span>
        </label>

        <div
          className="border p-4 text-sm"
          style={{ background: form.accent_bg, borderColor: `${form.accent_secondary}55` }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: form.accent_secondary }}>
            Preview
          </p>
          <p className="font-serif text-xl" style={{ color: form.accent_primary }}>
            {form.label || 'Dyntra'} — {form.badge_text || 'Theme'}
          </p>
          <p className="text-xs mt-1 opacity-70">{form.tagline || 'Tagline appears here'}</p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 bg-maroon text-white text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save Festival Theme'}
        </button>
      </form>
    </div>
  );
}
