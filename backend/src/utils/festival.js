export const FESTIVAL_PRESETS = {
  none: {
    label: '',
    tagline: '',
    badge_text: '',
    announcements: '',
    accent_primary: '#7B1E3A',
    accent_secondary: '#C9A84C',
    accent_bg: '#FAF7F2',
  },
  diwali: {
    label: 'Diwali',
    tagline: 'Light up your festive wardrobe',
    badge_text: 'Diwali Special',
    announcements:
      'Diwali collection is live · Free shipping above ₹999 · Gift-ready packaging · Use code FIRST10 for 10% off',
    accent_primary: '#8B1A1A',
    accent_secondary: '#E8B923',
    accent_bg: '#FFF8E7',
  },
  rakhi: {
    label: 'Raksha Bandhan',
    tagline: 'Sarees for the sister who deserves the best',
    badge_text: 'Rakhi Special',
    announcements:
      'Rakhi gifts that feel personal · Free shipping above ₹999 · Same-week dispatch · Use code FIRST10 for 10% off',
    accent_primary: '#9B1B4A',
    accent_secondary: '#D4A017',
    accent_bg: '#FFF5F8',
  },
  holi: {
    label: 'Holi',
    tagline: 'Colourful silks for a joyful Holi',
    badge_text: 'Holi Edit',
    announcements:
      'Holi colours, silk elegance · Free shipping above ₹999 · Easy returns · Use code FIRST10 for 10% off',
    accent_primary: '#6B2D8B',
    accent_secondary: '#F4A261',
    accent_bg: '#F8F0FF',
  },
  eid: {
    label: 'Eid',
    tagline: 'Graceful weaves for Eid celebrations',
    badge_text: 'Eid Collection',
    announcements:
      'Eid-ready silk sarees · Free shipping above ₹999 · Gift wrapping on request · Use code FIRST10 for 10% off',
    accent_primary: '#0F5C4C',
    accent_secondary: '#C9A84C',
    accent_bg: '#F3FAF7',
  },
  navratri: {
    label: 'Navratri',
    tagline: 'Nine nights, timeless silk',
    badge_text: 'Navratri Special',
    announcements:
      'Navratri festive weaves · Free shipping above ₹999 · WhatsApp for quick orders · Use code FIRST10 for 10% off',
    accent_primary: '#A51C30',
    accent_secondary: '#F0C14B',
    accent_bg: '#FFF9F0',
  },
  dussehra: {
    label: 'Dussehra',
    tagline: 'Celebrate victory in pure silk',
    badge_text: 'Dussehra Offer',
    announcements:
      'Dussehra festive picks · Free shipping above ₹999 · 100% purchase protection · Use code FIRST10 for 10% off',
    accent_primary: '#7B1E3A',
    accent_secondary: '#D4AF37',
    accent_bg: '#FAF7F2',
  },
  christmas: {
    label: 'Christmas',
    tagline: 'Winter glam in silk & gold',
    badge_text: 'Holiday Edit',
    announcements:
      'Holiday party sarees · Free shipping above ₹999 · Gift-ready packaging · Use code FIRST10 for 10% off',
    accent_primary: '#6B1528',
    accent_secondary: '#C9A84C',
    accent_bg: '#F7F4EF',
  },
  new_year: {
    label: 'New Year',
    tagline: 'Step into the new year in silk',
    badge_text: 'New Year Special',
    announcements:
      'New Year party looks · Free shipping above ₹999 · Limited festive stock · Use code FIRST10 for 10% off',
    accent_primary: '#4A0E2B',
    accent_secondary: '#E0C068',
    accent_bg: '#FBF8F2',
  },
  custom: {
    label: 'Custom Festival',
    tagline: '',
    badge_text: 'Special Offer',
    announcements: 'Free Shipping on Orders Above ₹999 · Use code FIRST10 for 10% off',
    accent_primary: '#7B1E3A',
    accent_secondary: '#C9A84C',
    accent_bg: '#FAF7F2',
  },
};

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
    };
  }
  return {
    active: true,
    festival_key: key,
    label: row.label || '',
    tagline: row.tagline || '',
    badge_text: row.badge_text || '',
    show_badge: row.show_badge !== false,
    announcements: parseAnnouncements(row.announcements),
    accent_primary: row.accent_primary || '#7B1E3A',
    accent_secondary: row.accent_secondary || '#C9A84C',
    accent_bg: row.accent_bg || '#FAF7F2',
    starts_at: row.starts_at,
    ends_at: row.ends_at,
  };
}
