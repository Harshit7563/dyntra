/** Festival presets + month grouping for Dyntra admin */

function base(announcements, colors = {}) {
  return {
    announcements:
      announcements ||
      'Festive silk collection · Free shipping above ₹999 · Use code FIRST10 for 10% off',
    accent_primary: colors.primary || '#7B1E3A',
    accent_secondary: colors.secondary || '#C9A84C',
    accent_bg: colors.bg || '#FAF7F2',
  };
}

export const FESTIVAL_MONTHS = [
  {
    month: 'January',
    keys: ['new_year', 'lohri', 'makar_sankranti', 'pongal', 'magh_bihu', 'republic_day', 'vasant_panchami'],
  },
  {
    month: 'February',
    keys: ['vasant_panchami', 'maha_shivratri', 'losar'],
  },
  {
    month: 'March',
    keys: ['holika_dahan', 'holi', 'chaitra_navratri', 'ugadi', 'gudi_padwa', 'ram_navami'],
  },
  {
    month: 'April',
    keys: ['mahavir_jayanti', 'baisakhi', 'vishu', 'puthandu', 'bihu', 'hanuman_jayanti', 'good_friday', 'easter'],
  },
  {
    month: 'May',
    keys: ['buddha_purnima', 'akshaya_tritiya'],
  },
  {
    month: 'June',
    keys: ['eid_al_adha', 'rath_yatra'],
  },
  {
    month: 'July',
    keys: ['guru_purnima', 'bonalu', 'muharram'],
  },
  {
    month: 'August',
    keys: ['rakhi', 'nag_panchami', 'janmashtami', 'onam', 'independence_day', 'parsi_new_year'],
  },
  {
    month: 'September',
    keys: ['ganesh_chaturthi', 'vishwakarma_puja', 'milad_un_nabi', 'nuakhai'],
  },
  {
    month: 'October',
    keys: ['navratri', 'durga_puja', 'dussehra', 'karwa_chauth', 'valmiki_jayanti'],
  },
  {
    month: 'November',
    keys: [
      'dhanteras',
      'naraka_chaturdashi',
      'diwali',
      'govardhan_puja',
      'bhai_dooj',
      'chhath_puja',
      'guru_nanak_jayanti',
      'childrens_day',
    ],
  },
  {
    month: 'December',
    keys: ['christmas', 'hornbill', 'new_year_eve'],
  },
];

export const FESTIVAL_PRESETS = {
  none: {
    label: '',
    tagline: '',
    badge_text: '',
    announcements: '',
    accent_primary: '#7B1E3A',
    accent_secondary: '#C9A84C',
    accent_bg: '#FAF7F2',
    animation: 'none',
  },
  custom: {
    label: 'Custom Festival',
    tagline: '',
    badge_text: 'Special Offer',
    ...base('Free Shipping on Orders Above ₹999 · Use code FIRST10 for 10% off'),
    animation: 'shimmer',
  },

  // January
  new_year: {
    label: "New Year's Day",
    tagline: 'Step into the year in pure silk',
    badge_text: 'New Year Special',
    ...base('New Year party looks · Free shipping above ₹999 · Use code FIRST10', {
      primary: '#4A0E2B',
      secondary: '#E0C068',
      bg: '#FBF8F2',
    }),
    animation: 'sparkle',
  },
  lohri: {
    label: 'Lohri',
    tagline: 'Warm silk for Lohri nights',
    badge_text: 'Lohri Edit',
    ...base(null, { primary: '#B45309', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'embers',
  },
  makar_sankranti: {
    label: 'Makar Sankranti',
    tagline: 'Kite-bright colours, silk grace',
    badge_text: 'Sankranti Special',
    ...base(null, { primary: '#C2410C', secondary: '#FACC15', bg: '#FFFBEB' }),
    animation: 'kites',
  },
  pongal: {
    label: 'Pongal',
    tagline: 'Harvest joy in handloom silk',
    badge_text: 'Pongal Special',
    ...base(null, { primary: '#B45309', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'harvest',
  },
  magh_bihu: {
    label: 'Magh Bihu',
    tagline: 'Assamese warmth, silk elegance',
    badge_text: 'Bihu Special',
    ...base(null, { primary: '#9A3412', secondary: '#F59E0B', bg: '#FFF7ED' }),
    animation: 'harvest',
  },
  republic_day: {
    label: 'Republic Day',
    tagline: 'Celebrate India in regal silk',
    badge_text: '26 January',
    ...base(null, { primary: '#9F1239', secondary: '#15803D', bg: '#FFF1F2' }),
    animation: 'tricolor',
  },
  vasant_panchami: {
    label: 'Vasant Panchami',
    tagline: 'Yellow silk for Saraswati’s blessing',
    badge_text: 'Basant Special',
    ...base(null, { primary: '#A16207', secondary: '#FDE047', bg: '#FEFCE8' }),
    animation: 'petals',
  },

  // February
  maha_shivratri: {
    label: 'Maha Shivratri',
    tagline: 'Serene weaves for a sacred night',
    badge_text: 'Shivratri',
    ...base(null, { primary: '#1E3A5F', secondary: '#94A3B8', bg: '#F1F5F9' }),
    animation: 'glow',
  },
  losar: {
    label: 'Losar',
    tagline: 'Tibetan New Year elegance',
    badge_text: 'Losar',
    ...base(null, { primary: '#7F1D1D', secondary: '#FBBF24', bg: '#FEF3C7' }),
    animation: 'sparkle',
  },

  // March
  holika_dahan: {
    label: 'Holika Dahan',
    tagline: 'Eve of colour — dress in glow',
    badge_text: 'Holika Dahan',
    ...base(null, { primary: '#9A3412', secondary: '#FB923C', bg: '#FFF7ED' }),
    animation: 'embers',
  },
  holi: {
    label: 'Holi',
    tagline: 'Colourful silks for a joyful Holi',
    badge_text: 'Holi Edit',
    ...base('Holi colours, silk elegance · Free shipping above ₹999 · Use code FIRST10', {
      primary: '#6B2D8B',
      secondary: '#F4A261',
      bg: '#F8F0FF',
    }),
    animation: 'colors',
  },
  chaitra_navratri: {
    label: 'Chaitra Navratri',
    tagline: 'Nine nights of spring devotion',
    badge_text: 'Chaitra Navratri',
    ...base(null, { primary: '#BE123C', secondary: '#FBBF24', bg: '#FFF1F2' }),
    animation: 'petals',
  },
  ugadi: {
    label: 'Ugadi',
    tagline: 'Telugu New Year in silk',
    badge_text: 'Ugadi',
    ...base(null, { primary: '#9F1239', secondary: '#F59E0B', bg: '#FFFBEB' }),
    animation: 'harvest',
  },
  gudi_padwa: {
    label: 'Gudi Padwa',
    tagline: 'Maharashtrian New Year glam',
    badge_text: 'Gudi Padwa',
    ...base(null, { primary: '#B91C1C', secondary: '#FACC15', bg: '#FEF2F2' }),
    animation: 'sparkle',
  },
  ram_navami: {
    label: 'Ram Navami',
    tagline: 'Devotional grace in pure silk',
    badge_text: 'Ram Navami',
    ...base(null, { primary: '#9F1239', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'glow',
  },

  // April
  mahavir_jayanti: {
    label: 'Mahavir Jayanti',
    tagline: 'Peaceful elegance for the day',
    badge_text: 'Mahavir Jayanti',
    ...base(null, { primary: '#1D4ED8', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'glow',
  },
  baisakhi: {
    label: 'Baisakhi',
    tagline: 'Harvest celebration in silk',
    badge_text: 'Baisakhi',
    ...base(null, { primary: '#B45309', secondary: '#FACC15', bg: '#FFFBEB' }),
    animation: 'harvest',
  },
  vishu: {
    label: 'Vishu',
    tagline: 'Kerala New Year colours',
    badge_text: 'Vishu',
    ...base(null, { primary: '#15803D', secondary: '#FACC15', bg: '#F0FDF4' }),
    animation: 'harvest',
  },
  puthandu: {
    label: 'Puthandu',
    tagline: 'Tamil New Year silk edit',
    badge_text: 'Puthandu',
    ...base(null, { primary: '#B91C1C', secondary: '#FBBF24', bg: '#FEF2F2' }),
    animation: 'sparkle',
  },
  bihu: {
    label: 'Bihu',
    tagline: 'Assamese festivity in silk',
    badge_text: 'Bihu',
    ...base(null, { primary: '#C2410C', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'harvest',
  },
  hanuman_jayanti: {
    label: 'Hanuman Jayanti',
    tagline: 'Strength & devotion in silk',
    badge_text: 'Hanuman Jayanti',
    ...base(null, { primary: '#C2410C', secondary: '#FB923C', bg: '#FFF7ED' }),
    animation: 'glow',
  },
  good_friday: {
    label: 'Good Friday',
    tagline: 'Quiet elegance for the day',
    badge_text: 'Good Friday',
    ...base(null, { primary: '#44403C', secondary: '#A8A29E', bg: '#FAFAF9' }),
    animation: 'glow',
  },
  easter: {
    label: 'Easter',
    tagline: 'Soft pastels & festive silk',
    badge_text: 'Easter',
    ...base(null, { primary: '#9D174D', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'petals',
  },

  // May
  buddha_purnima: {
    label: 'Buddha Purnima',
    tagline: 'Calm weaves under the full moon',
    badge_text: 'Buddha Purnima',
    ...base(null, { primary: '#5B21B6', secondary: '#FDE68A', bg: '#F5F3FF' }),
    animation: 'glow',
  },
  akshaya_tritiya: {
    label: 'Akshaya Tritiya',
    tagline: 'Auspicious gold & silk',
    badge_text: 'Akshaya Tritiya',
    ...base(null, { primary: '#92400E', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'sparkle',
  },

  // June
  eid_al_adha: {
    label: 'Eid al-Adha (Bakrid)',
    tagline: 'Graceful weaves for Eid',
    badge_text: 'Eid Special',
    ...base(null, { primary: '#0F5C4C', secondary: '#C9A84C', bg: '#F3FAF7' }),
    animation: 'crescent',
  },
  rath_yatra: {
    label: 'Rath Yatra',
    tagline: 'Devotion on the move — in silk',
    badge_text: 'Rath Yatra',
    ...base(null, { primary: '#B45309', secondary: '#FDE047', bg: '#FEFCE8' }),
    animation: 'petals',
  },

  // July
  guru_purnima: {
    label: 'Guru Purnima',
    tagline: 'Honour wisdom in silk',
    badge_text: 'Guru Purnima',
    ...base(null, { primary: '#6D28D9', secondary: '#FBBF24', bg: '#F5F3FF' }),
    animation: 'glow',
  },
  bonalu: {
    label: 'Bonalu',
    tagline: 'Hyderabad’s festive colours',
    badge_text: 'Bonalu',
    ...base(null, { primary: '#BE123C', secondary: '#FACC15', bg: '#FFF1F2' }),
    animation: 'colors',
  },
  muharram: {
    label: 'Muharram',
    tagline: 'Reflective elegance',
    badge_text: 'Muharram',
    ...base(null, { primary: '#1F2937', secondary: '#9CA3AF', bg: '#F9FAFB' }),
    animation: 'glow',
  },

  // August
  rakhi: {
    label: 'Raksha Bandhan',
    tagline: 'Sarees for the sister who deserves the best',
    badge_text: 'Rakhi Special',
    ...base('Rakhi gifts that feel personal · Free shipping above ₹999 · Use code FIRST10', {
      primary: '#9B1B4A',
      secondary: '#D4A017',
      bg: '#FFF5F8',
    }),
    animation: 'ribbon',
  },
  nag_panchami: {
    label: 'Nag Panchami',
    tagline: 'Sacred hues for Nag Panchami',
    badge_text: 'Nag Panchami',
    ...base(null, { primary: '#166534', secondary: '#A3E635', bg: '#F0FDF4' }),
    animation: 'glow',
  },
  janmashtami: {
    label: 'Janmashtami',
    tagline: 'Celebrate Krishna in peacock silk',
    badge_text: 'Janmashtami',
    ...base(null, { primary: '#1D4ED8', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'sparkle',
  },
  onam: {
    label: 'Onam',
    tagline: 'Kerala’s harvest, silk celebration',
    badge_text: 'Onam Special',
    ...base(null, { primary: '#15803D', secondary: '#FACC15', bg: '#F0FDF4' }),
    animation: 'petals',
  },
  independence_day: {
    label: 'Independence Day',
    tagline: 'Proud colours, proud silk',
    badge_text: '15 August',
    ...base(null, { primary: '#9F1239', secondary: '#15803D', bg: '#FFF7ED' }),
    animation: 'tricolor',
  },
  parsi_new_year: {
    label: 'Parsi New Year',
    tagline: 'Navroz elegance in silk',
    badge_text: 'Navroz',
    ...base(null, { primary: '#9F1239', secondary: '#F59E0B', bg: '#FFFBEB' }),
    animation: 'sparkle',
  },

  // September
  ganesh_chaturthi: {
    label: 'Ganesh Chaturthi',
    tagline: 'Begin anew in festive silk',
    badge_text: 'Ganesh Chaturthi',
    ...base(null, { primary: '#C2410C', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'sparkle',
  },
  vishwakarma_puja: {
    label: 'Vishwakarma Puja',
    tagline: 'Craft & creation in silk',
    badge_text: 'Vishwakarma Puja',
    ...base(null, { primary: '#1E40AF', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'glow',
  },
  milad_un_nabi: {
    label: 'Milad-un-Nabi',
    tagline: 'Graceful silks for the occasion',
    badge_text: 'Milad-un-Nabi',
    ...base(null, { primary: '#0F766E', secondary: '#C9A84C', bg: '#F0FDFA' }),
    animation: 'crescent',
  },
  nuakhai: {
    label: 'Nuakhai',
    tagline: 'Odisha’s harvest in silk',
    badge_text: 'Nuakhai',
    ...base(null, { primary: '#B45309', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'harvest',
  },

  // October
  navratri: {
    label: 'Sharadiya Navratri',
    tagline: 'Nine nights, timeless silk',
    badge_text: 'Navratri Special',
    ...base('Navratri festive weaves · Free shipping above ₹999 · Use code FIRST10', {
      primary: '#A51C30',
      secondary: '#F0C14B',
      bg: '#FFF9F0',
    }),
    animation: 'petals',
  },
  durga_puja: {
    label: 'Durga Puja',
    tagline: 'Bengali festivity in pure silk',
    badge_text: 'Durga Puja',
    ...base(null, { primary: '#BE123C', secondary: '#FBBF24', bg: '#FFF1F2' }),
    animation: 'petals',
  },
  dussehra: {
    label: 'Dussehra (Vijayadashami)',
    tagline: 'Celebrate victory in pure silk',
    badge_text: 'Dussehra Offer',
    ...base(null, { primary: '#7B1E3A', secondary: '#D4AF37', bg: '#FAF7F2' }),
    animation: 'embers',
  },
  karwa_chauth: {
    label: 'Karwa Chauth',
    tagline: 'Moonlit glam for Karwa Chauth',
    badge_text: 'Karwa Chauth',
    ...base(null, { primary: '#9F1239', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'moon',
  },
  valmiki_jayanti: {
    label: 'Maharishi Valmiki Jayanti',
    tagline: 'Literary grace in silk',
    badge_text: 'Valmiki Jayanti',
    ...base(null, { primary: '#7C2D12', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'glow',
  },

  // November
  dhanteras: {
    label: 'Dhanteras',
    tagline: 'Auspicious gold & silk shopping',
    badge_text: 'Dhanteras',
    ...base(null, { primary: '#92400E', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'sparkle',
  },
  naraka_chaturdashi: {
    label: 'Naraka Chaturdashi',
    tagline: 'Choti Diwali glow',
    badge_text: 'Choti Diwali',
    ...base(null, { primary: '#9F1239', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'lights',
  },
  diwali: {
    label: 'Diwali',
    tagline: 'Light up your festive wardrobe',
    badge_text: 'Diwali Special',
    ...base('Diwali collection is live · Free shipping above ₹999 · Gift-ready packaging · Use code FIRST10', {
      primary: '#8B1A1A',
      secondary: '#E8B923',
      bg: '#FFF8E7',
    }),
    animation: 'lights',
  },
  govardhan_puja: {
    label: 'Govardhan Puja',
    tagline: 'Day after Diwali — still glowing',
    badge_text: 'Govardhan Puja',
    ...base(null, { primary: '#166534', secondary: '#FBBF24', bg: '#F0FDF4' }),
    animation: 'lights',
  },
  bhai_dooj: {
    label: 'Bhai Dooj',
    tagline: 'Gifts of love in silk',
    badge_text: 'Bhai Dooj',
    ...base(null, { primary: '#9B1B4A', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'ribbon',
  },
  chhath_puja: {
    label: 'Chhath Puja',
    tagline: 'Sun-blessed silk for Chhath',
    badge_text: 'Chhath Puja',
    ...base(null, { primary: '#C2410C', secondary: '#FDBA74', bg: '#FFF7ED' }),
    animation: 'glow',
  },
  guru_nanak_jayanti: {
    label: 'Guru Nanak Jayanti',
    tagline: 'Peace & grace in silk',
    badge_text: 'Gurpurab',
    ...base(null, { primary: '#1E3A8A', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'glow',
  },
  childrens_day: {
    label: "Children's Day",
    tagline: 'Joyful colours for the family',
    badge_text: "Children's Day",
    ...base(null, { primary: '#0369A1', secondary: '#FBBF24', bg: '#F0F9FF' }),
    animation: 'colors',
  },

  // December
  christmas: {
    label: 'Christmas',
    tagline: 'Winter glam in silk & gold',
    badge_text: 'Holiday Edit',
    ...base(null, { primary: '#6B1528', secondary: '#C9A84C', bg: '#F7F4EF' }),
    animation: 'snow',
  },
  hornbill: {
    label: 'Hornbill Festival',
    tagline: 'Northeast pride in silk',
    badge_text: 'Hornbill',
    ...base(null, { primary: '#9A3412', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'colors',
  },
  new_year_eve: {
    label: "New Year's Eve",
    tagline: 'Party silk for the countdown',
    badge_text: "New Year's Eve",
    ...base(null, { primary: '#4A0E2B', secondary: '#E0C068', bg: '#FBF8F2' }),
    animation: 'sparkle',
  },

  // alias used earlier
  eid: {
    label: 'Eid',
    tagline: 'Graceful weaves for Eid celebrations',
    badge_text: 'Eid Collection',
    ...base(null, { primary: '#0F5C4C', secondary: '#C9A84C', bg: '#F3FAF7' }),
    animation: 'crescent',
  },
};

export function getFestivalLabel(key) {
  return FESTIVAL_PRESETS[key]?.label || key;
}
