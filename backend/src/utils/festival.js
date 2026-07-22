import { FESTIVAL_PRESETS } from './festivalPresets.js';

export { FESTIVAL_PRESETS, FESTIVAL_MONTHS, getFestivalLabel } from './festivalPresets.js';

export function parseAnnouncements(text) {
  if (!text || !String(text).trim()) {
    return [
      'Free Shipping on Orders Above ₹999',
      '100% Purchase Protection',
      'WhatsApp for Quick Orders',
      'Use code FIRST10 for 10% off!',
    ];
  }
  return String(text)
    .split(/\n|·|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isFestivalActive(row) {
  if (!row?.enabled) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (row.starts_at) {
    const start = new Date(row.starts_at);
    start.setHours(0, 0, 0, 0);
    if (today < start) return false;
  }
  if (row.ends_at) {
    const end = new Date(row.ends_at);
    end.setHours(23, 59, 59, 999);
    if (today > end) return false;
  }
  return true;
}

export function toPublicFestival(row) {
  const active = isFestivalActive(row);
  const key = row.festival_key || 'none';
  const preset = FESTIVAL_PRESETS[key] || FESTIVAL_PRESETS.none;

  if (!active || key === 'none') {
    return {
      active: false,
      festival_key: 'none',
      label: '',
      tagline: '',
      badge_text: '',
      show_badge: false,
      announcements: parseAnnouncements(''),
      accent_primary: '#7B1E3A',
      accent_secondary: '#C9A84C',
      accent_bg: '#FAF7F2',
      animation: 'none',
    };
  }

  // Colours always come from the festival preset — never admin-picked
  return {
    active: true,
    festival_key: key,
    label: row.label || preset.label || '',
    tagline: row.tagline || preset.tagline || '',
    badge_text: row.badge_text || preset.badge_text || '',
    show_badge: row.show_badge !== false,
    announcements: parseAnnouncements(row.announcements || preset.announcements),
    accent_primary: preset.accent_primary || '#7B1E3A',
    accent_secondary: preset.accent_secondary || '#C9A84C',
    accent_bg: preset.accent_bg || '#FAF7F2',
    animation: preset.animation || 'shimmer',
    starts_at: row.starts_at,
    ends_at: row.ends_at,
  };
}
