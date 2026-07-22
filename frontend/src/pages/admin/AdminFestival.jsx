import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function AdminFestival() {
  const [enabled, setEnabled] = useState(false);
  const [festivalKey, setFestivalKey] = useState('none');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
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
      setEnabled(Boolean(s.enabled));
      setFestivalKey(s.festival_key || 'none');
      setStartsAt(toDateInput(s.starts_at));
      setEndsAt(toDateInput(s.ends_at));
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPickFestival = (key) => {
    setFestivalKey(key);
    if (key === 'none') setEnabled(false);
    else setEnabled(true);
  };

  const save = async (e) => {
    e.preventDefault();
    await run(async () => {
      const updated = await adminApi.updateFestivalSettings({
        enabled,
        festival_key: festivalKey,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      });
      setEnabled(Boolean(updated.enabled));
      setFestivalKey(updated.festival_key || 'none');
      setStartsAt(toDateInput(updated.starts_at));
      setEndsAt(toDateInput(updated.ends_at));
    }, 'Festival theme saved');
  };

  const preset = presets[festivalKey] || {};

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-2">Festival Theme</h1>
      <p className="text-sm text-gray-500 mb-6">
        Choose a festival and dates. Colours, badge, announcements and animation apply automatically.
      </p>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      <form onSubmit={save} className="bg-white border border-gold/20 p-5 sm:p-6 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-maroon w-4 h-4"
          />
          <span className="text-sm font-medium">Enable on store</span>
        </label>

        <div>
          <label className="block text-xs uppercase text-gray-500 mb-1">Festival</label>
          <select
            value={festivalKey}
            onChange={(e) => onPickFestival(e.target.value)}
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

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Start date</label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">End date</label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-3 py-2 border text-sm"
            />
          </div>
        </div>

        {festivalKey !== 'none' && preset.label && (
          <div
            className="border p-4 text-sm"
            style={{
              background: preset.accent_bg || '#FAF7F2',
              borderColor: `${preset.accent_secondary || '#C9A84C'}55`,
            }}
          >
            <p
              className="font-serif text-xl"
              style={{ color: preset.accent_primary || '#7B1E3A' }}
            >
              {preset.label}
            </p>
            <p className="text-xs mt-1 opacity-70">{preset.tagline}</p>
            <p className="text-[11px] mt-2 text-gray-500">
              Animation: {preset.animation}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 bg-maroon text-white text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
