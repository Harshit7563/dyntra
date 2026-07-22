import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const empty = {
  enabled: false,
  festival_key: 'none',
  label: '',
  tagline: '',
  badge_text: '',
  show_badge: true,
  announcements: '',
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
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alert, busy, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.festivalSettings();
      const s = data.settings || {};
      setPresets(data.presets || {});
      setMonths(data.months || []);
      setForm({
        enabled: Boolean(s.enabled),
        festival_key: s.festival_key || 'none',
        label: s.label || '',
        tagline: s.tagline || '',
        badge_text: s.badge_text || '',
        show_badge: s.show_badge !== false,
        announcements: s.announcements || '',
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
      enabled: key === 'none' ? false : true,
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
        festival_key: updated.festival_key || prev.festival_key,
        label: updated.label ?? prev.label,
        tagline: updated.tagline ?? prev.tagline,
        badge_text: updated.badge_text ?? prev.badge_text,
        announcements: updated.announcements ?? prev.announcements,
        enabled: Boolean(updated.enabled),
        show_badge: updated.show_badge !== false,
        starts_at: toDateInput(updated.starts_at),
        ends_at: toDateInput(updated.ends_at),
      }));
    }, 'Festival theme saved — store colours + animation update automatically');
  };

  const preset = presets[form.festival_key] || {};
  const animHint = preset.animation || 'shimmer';
  const primary = preset.accent_primary || '#7B1E3A';
  const secondary = preset.accent_secondary || '#C9A84C';
  const bg = preset.accent_bg || '#FAF7F2';

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Festival Theme</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pick a festival — colours and animation apply automatically from its theme.
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
          <label className="block text-xs uppercase text-gray-500 mb-1">Festival (by month)</label>
          <select
            value={form.festival_key}
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full px-3 py-2 border text-sm"
          >
            <option value="none">None (default Dyntra)</option>
            {months.map((m) => (
              <optgroup key={m.month} label={m.month}>
                {(m.keys || []).map((key) => (
                  <option key={`${m.month}-${key}`} value={key}>
                    {presets[key]?.label || key}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {form.festival_key !== 'none' && (
          <div className="flex flex-wrap items-center gap-3 text-sm border border-gold/20 bg-cream/40 px-3 py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Theme colours</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-5 border border-black/10" style={{ background: primary }} title="Primary" />
              <span className="w-5 h-5 border border-black/10" style={{ background: secondary }} title="Accent" />
              <span className="w-5 h-5 border border-black/10" style={{ background: bg }} title="Background" />
            </span>
            <span className="text-xs text-gray-500">
              Animation: <span className="text-maroon font-medium">{animHint}</span>
            </span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Display name</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Badge text</label>
            <input
              value={form.badge_text}
              onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Tagline</label>
          <input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-3 py-2 border text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Announcement bar</label>
          <textarea
            value={form.announcements}
            onChange={(e) => setForm({ ...form, announcements: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border text-sm"
          />
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
          className="border p-4 text-sm relative overflow-hidden"
          style={{ background: bg, borderColor: `${secondary}55` }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: secondary }}>
            Preview · {animHint}
          </p>
          <p className="font-serif text-xl" style={{ color: primary }}>
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
