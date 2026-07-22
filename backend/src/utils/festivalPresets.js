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
    ...base("Special festive silk collection · Free shipping above ₹999 · Use code FIRST10 for 10% off"),
    animation: 'shimmer',
  },

  // January
  new_year: {
    label: "New Year's Day",
    tagline: 'Step into the year in pure silk',
    badge_text: 'New Year Special',
    ...base("Step into the new year in pure silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", {
      primary: '#4A0E2B',
      secondary: '#E0C068',
      bg: '#FBF8F2',
    }),
    animation: 'confetti',
  },
  lohri: {
    label: 'Lohri',
    tagline: 'Warm silk for Lohri nights',
    badge_text: 'Lohri Edit',
    ...base("Warm silk looks for Lohri nights · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B45309', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'bonfire',
  },
  makar_sankranti: {
    label: 'Makar Sankranti',
    tagline: 'Kite-bright colours, silk grace',
    badge_text: 'Sankranti Special',
    ...base("Kite-bright colours for Sankranti celebrations · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#C2410C', secondary: '#FACC15', bg: '#FFFBEB' }),
    animation: 'kites',
  },
  pongal: {
    label: 'Pongal',
    tagline: 'Harvest joy in handloom silk',
    badge_text: 'Pongal Special',
    ...base("Harvest joy woven in handloom silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B45309', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'rice_grain',
  },
  magh_bihu: {
    label: 'Magh Bihu',
    tagline: 'Assamese warmth, silk elegance',
    badge_text: 'Bihu Special',
    ...base("Assamese warmth meets silk elegance · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9A3412', secondary: '#F59E0B', bg: '#FFF7ED' }),
    animation: 'bihu_fire',
  },
  republic_day: {
    label: 'Republic Day',
    tagline: 'Celebrate India in regal silk',
    badge_text: '26 January',
    ...base("Celebrate India in regal silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#15803D', bg: '#FFF1F2' }),
    animation: 'tricolor',
  },
  vasant_panchami: {
    label: 'Vasant Panchami',
    tagline: 'Yellow silk for Saraswati’s blessing',
    badge_text: 'Basant Special',
    ...base("Yellow silk for Saraswati’s blessing · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#A16207', secondary: '#FDE047', bg: '#FEFCE8' }),
    animation: 'yellow_petals',
  },

  // February
  maha_shivratri: {
    label: 'Maha Shivratri',
    tagline: 'Serene weaves for a sacred night',
    badge_text: 'Shivratri',
    ...base("Serene weaves for a sacred Shivratri night · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1E3A5F', secondary: '#94A3B8', bg: '#F1F5F9' }),
    animation: 'bilva_glow',
  },
  losar: {
    label: 'Losar',
    tagline: 'Tibetan New Year elegance',
    badge_text: 'Losar',
    ...base("Tibetan New Year elegance in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#7F1D1D', secondary: '#FBBF24', bg: '#FEF3C7' }),
    animation: 'prayer_flags',
  },

  // March
  holika_dahan: {
    label: 'Holika Dahan',
    tagline: 'Eve of colour — dress in glow',
    badge_text: 'Holika Dahan',
    ...base("Glow-ready silks for Holika Dahan · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9A3412', secondary: '#FB923C', bg: '#FFF7ED' }),
    animation: 'holika_fire',
  },
  holi: {
    label: 'Holi',
    tagline: 'Colourful silks for a joyful Holi',
    badge_text: 'Holi Edit',
    ...base("Colourful silks for a joyful Holi · Free shipping above ₹999 · Use code FIRST10 for 10% off", {
      primary: '#6B2D8B',
      secondary: '#F4A261',
      bg: '#F8F0FF',
    }),
    animation: 'gulal',
  },
  chaitra_navratri: {
    label: 'Chaitra Navratri',
    tagline: 'Nine nights of spring devotion',
    badge_text: 'Chaitra Navratri',
    ...base("Nine nights of spring devotion in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#BE123C', secondary: '#FBBF24', bg: '#FFF1F2' }),
    animation: 'garba',
  },
  ugadi: {
    label: 'Ugadi',
    tagline: 'Telugu New Year in silk',
    badge_text: 'Ugadi',
    ...base("Telugu New Year looks in pure silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#F59E0B', bg: '#FFFBEB' }),
    animation: 'mango_leaf',
  },
  gudi_padwa: {
    label: 'Gudi Padwa',
    tagline: 'Maharashtrian New Year glam',
    badge_text: 'Gudi Padwa',
    ...base("Maharashtrian New Year glam in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B91C1C', secondary: '#FACC15', bg: '#FEF2F2' }),
    animation: 'gudi',
  },
  ram_navami: {
    label: 'Ram Navami',
    tagline: 'Devotional grace in pure silk',
    badge_text: 'Ram Navami',
    ...base("Devotional grace in pure silk for Ram Navami · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'saffron_glow',
  },

  // April
  mahavir_jayanti: {
    label: 'Mahavir Jayanti',
    tagline: 'Peaceful elegance for the day',
    badge_text: 'Mahavir Jayanti',
    ...base("Peaceful elegance for Mahavir Jayanti · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1D4ED8', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'lotus_blue',
  },
  baisakhi: {
    label: 'Baisakhi',
    tagline: 'Harvest celebration in silk',
    badge_text: 'Baisakhi',
    ...base("Harvest celebration silks for Baisakhi · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B45309', secondary: '#FACC15', bg: '#FFFBEB' }),
    animation: 'wheat',
  },
  vishu: {
    label: 'Vishu',
    tagline: 'Kerala New Year colours',
    badge_text: 'Vishu',
    ...base("Kerala New Year colours in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#15803D', secondary: '#FACC15', bg: '#F0FDF4' }),
    animation: 'vishu_kani',
  },
  puthandu: {
    label: 'Puthandu',
    tagline: 'Tamil New Year silk edit',
    badge_text: 'Puthandu',
    ...base("Tamil New Year silk edit is live · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B91C1C', secondary: '#FBBF24', bg: '#FEF2F2' }),
    animation: 'kolam',
  },
  bihu: {
    label: 'Bihu',
    tagline: 'Assamese festivity in silk',
    badge_text: 'Bihu',
    ...base("Assamese festivity woven in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#C2410C', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'bihu_dance',
  },
  hanuman_jayanti: {
    label: 'Hanuman Jayanti',
    tagline: 'Strength & devotion in silk',
    badge_text: 'Hanuman Jayanti',
    ...base("Strength and devotion in silk for Hanuman Jayanti · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#C2410C', secondary: '#FB923C', bg: '#FFF7ED' }),
    animation: 'saffron_ember',
  },
  good_friday: {
    label: 'Good Friday',
    tagline: 'Quiet elegance for the day',
    badge_text: 'Good Friday',
    ...base("Quiet elegance for a reflective day · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#44403C', secondary: '#A8A29E', bg: '#FAFAF9' }),
    animation: 'solemn',
  },
  easter: {
    label: 'Easter',
    tagline: 'Soft pastels & festive silk',
    badge_text: 'Easter',
    ...base("Soft pastels and festive silk for Easter · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9D174D', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'pastel_egg',
  },

  // May
  buddha_purnima: {
    label: 'Buddha Purnima',
    tagline: 'Calm weaves under the full moon',
    badge_text: 'Buddha Purnima',
    ...base("Calm weaves under the full moon · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#5B21B6', secondary: '#FDE68A', bg: '#F5F3FF' }),
    animation: 'lotus_moon',
  },
  akshaya_tritiya: {
    label: 'Akshaya Tritiya',
    tagline: 'Auspicious gold & silk',
    badge_text: 'Akshaya Tritiya',
    ...base("Auspicious gold and silk for Akshaya Tritiya · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#92400E', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'gold_coins',
  },

  // June
  eid_al_adha: {
    label: 'Eid al-Adha (Bakrid)',
    tagline: 'Graceful weaves for Eid',
    badge_text: 'Eid Special',
    ...base("Graceful weaves for Eid celebrations · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#0F5C4C', secondary: '#C9A84C', bg: '#F3FAF7' }),
    animation: 'crescent',
  },
  rath_yatra: {
    label: 'Rath Yatra',
    tagline: 'Devotion on the move — in silk',
    badge_text: 'Rath Yatra',
    ...base("Devotion on the move — dress in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B45309', secondary: '#FDE047', bg: '#FEFCE8' }),
    animation: 'chariot',
  },

  // July
  guru_purnima: {
    label: 'Guru Purnima',
    tagline: 'Honour wisdom in silk',
    badge_text: 'Guru Purnima',
    ...base("Honour wisdom in silk this Guru Purnima · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#6D28D9', secondary: '#FBBF24', bg: '#F5F3FF' }),
    animation: 'wisdom_glow',
  },
  bonalu: {
    label: 'Bonalu',
    tagline: 'Hyderabad’s festive colours',
    badge_text: 'Bonalu',
    ...base("Hyderabad’s festive colours in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#BE123C', secondary: '#FACC15', bg: '#FFF1F2' }),
    animation: 'pot_colors',
  },
  muharram: {
    label: 'Muharram',
    tagline: 'Reflective elegance',
    badge_text: 'Muharram',
    ...base("Reflective elegance for Muharram · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1F2937', secondary: '#9CA3AF', bg: '#F9FAFB' }),
    animation: 'solemn_soft',
  },

  // August
  rakhi: {
    label: 'Raksha Bandhan',
    tagline: 'Sarees for the sister who deserves the best',
    badge_text: 'Rakhi Special',
    ...base("Rakhi gifts that feel personal · Free shipping above ₹999 · Use code FIRST10 for 10% off", {
      primary: '#9B1B4A',
      secondary: '#D4A017',
      bg: '#FFF5F8',
    }),
    animation: 'rakhi_ribbon',
  },
  nag_panchami: {
    label: 'Nag Panchami',
    tagline: 'Sacred hues for Nag Panchami',
    badge_text: 'Nag Panchami',
    ...base("Sacred hues for Nag Panchami · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#166534', secondary: '#A3E635', bg: '#F0FDF4' }),
    animation: 'serpent_green',
  },
  janmashtami: {
    label: 'Janmashtami',
    tagline: 'Celebrate Krishna in peacock silk',
    badge_text: 'Janmashtami',
    ...base("Celebrate Krishna in peacock silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1D4ED8', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'peacock',
  },
  onam: {
    label: 'Onam',
    tagline: 'Kerala’s harvest, silk celebration',
    badge_text: 'Onam Special',
    ...base("Kerala’s harvest celebration in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#15803D', secondary: '#FACC15', bg: '#F0FDF4' }),
    animation: 'pookalam',
  },
  independence_day: {
    label: 'Independence Day',
    tagline: 'Proud colours, proud silk',
    badge_text: '15 August',
    ...base("Proud colours, proud silk for 15 August · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#15803D', bg: '#FFF7ED' }),
    animation: 'tricolor_wave',
  },
  parsi_new_year: {
    label: 'Parsi New Year',
    tagline: 'Navroz elegance in silk',
    badge_text: 'Navroz',
    ...base("Navroz elegance in pure silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#F59E0B', bg: '#FFFBEB' }),
    animation: 'navroz_spark',
  },

  // September
  ganesh_chaturthi: {
    label: 'Ganesh Chaturthi',
    tagline: 'Begin anew in festive silk',
    badge_text: 'Ganesh Chaturthi',
    ...base("Begin anew in festive silk for Ganesh Chaturthi · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#C2410C', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'ganesh_modak',
  },
  vishwakarma_puja: {
    label: 'Vishwakarma Puja',
    tagline: 'Craft & creation in silk',
    badge_text: 'Vishwakarma Puja',
    ...base("Craft and creation celebrated in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1E40AF', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'craft_sparks',
  },
  milad_un_nabi: {
    label: 'Milad-un-Nabi',
    tagline: 'Graceful silks for the occasion',
    badge_text: 'Milad-un-Nabi',
    ...base("Graceful silks for Milad-un-Nabi · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#0F766E', secondary: '#C9A84C', bg: '#F0FDFA' }),
    animation: 'crescent_teal',
  },
  nuakhai: {
    label: 'Nuakhai',
    tagline: 'Odisha’s harvest in silk',
    badge_text: 'Nuakhai',
    ...base("Odisha’s harvest joy in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#B45309', secondary: '#84CC16', bg: '#FEFCE8' }),
    animation: 'nuakhai_grain',
  },

  // October
  navratri: {
    label: 'Sharadiya Navratri',
    tagline: 'Nine nights, timeless silk',
    badge_text: 'Navratri Special',
    ...base("Nine nights of timeless silk for Navratri · Free shipping above ₹999 · Use code FIRST10 for 10% off", {
      primary: '#A51C30',
      secondary: '#F0C14B',
      bg: '#FFF9F0',
    }),
    animation: 'garba_night',
  },
  durga_puja: {
    label: 'Durga Puja',
    tagline: 'Bengali festivity in pure silk',
    badge_text: 'Durga Puja',
    ...base("Bengali festivity in pure silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#BE123C', secondary: '#FBBF24', bg: '#FFF1F2' }),
    animation: 'dhak_petals',
  },
  dussehra: {
    label: 'Dussehra (Vijayadashami)',
    tagline: 'Celebrate victory in pure silk',
    badge_text: 'Dussehra Offer',
    ...base("Celebrate victory in pure silk this Dussehra · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#7B1E3A', secondary: '#D4AF37', bg: '#FAF7F2' }),
    animation: 'victory_flame',
  },
  karwa_chauth: {
    label: 'Karwa Chauth',
    tagline: 'Moonlit glam for Karwa Chauth',
    badge_text: 'Karwa Chauth',
    ...base("Moonlit glam for Karwa Chauth · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'moonrise',
  },
  valmiki_jayanti: {
    label: 'Maharishi Valmiki Jayanti',
    tagline: 'Literary grace in silk',
    badge_text: 'Valmiki Jayanti',
    ...base("Literary grace in silk for Valmiki Jayanti · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#7C2D12', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'soft_quill',
  },

  // November
  dhanteras: {
    label: 'Dhanteras',
    tagline: 'Auspicious gold & silk shopping',
    badge_text: 'Dhanteras',
    ...base("Auspicious gold and silk shopping for Dhanteras · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#92400E', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'dhanteras_gold',
  },
  naraka_chaturdashi: {
    label: 'Naraka Chaturdashi',
    tagline: 'Choti Diwali glow',
    badge_text: 'Choti Diwali',
    ...base("Choti Diwali glow in silk · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9F1239', secondary: '#FBBF24', bg: '#FFFBEB' }),
    animation: 'diya_small',
  },
  diwali: {
    label: 'Diwali',
    tagline: 'Light up your festive wardrobe',
    badge_text: 'Diwali Special',
    ...base("Light up your festive wardrobe for Diwali · Free shipping above ₹999 · Gift-ready packaging · Use code FIRST10 for 10% off", {
      primary: '#8B1A1A',
      secondary: '#E8B923',
      bg: '#FFF8E7',
    }),
    animation: 'diya_lights',
  },
  govardhan_puja: {
    label: 'Govardhan Puja',
    tagline: 'Day after Diwali — still glowing',
    badge_text: 'Govardhan Puja',
    ...base("Still glowing after Diwali — silk for Govardhan Puja · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#166534', secondary: '#FBBF24', bg: '#F0FDF4' }),
    animation: 'mountain_glow',
  },
  bhai_dooj: {
    label: 'Bhai Dooj',
    tagline: 'Gifts of love in silk',
    badge_text: 'Bhai Dooj',
    ...base("Gifts of love in silk for Bhai Dooj · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9B1B4A', secondary: '#F9A8D4', bg: '#FDF2F8' }),
    animation: 'sibling_ribbon',
  },
  chhath_puja: {
    label: 'Chhath Puja',
    tagline: 'Sun-blessed silk for Chhath',
    badge_text: 'Chhath Puja',
    ...base("Sun-blessed silk for Chhath Puja · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#C2410C', secondary: '#FDBA74', bg: '#FFF7ED' }),
    animation: 'sun_rays',
  },
  guru_nanak_jayanti: {
    label: 'Guru Nanak Jayanti',
    tagline: 'Peace & grace in silk',
    badge_text: 'Gurpurab',
    ...base("Peace and grace in silk for Gurpurab · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#1E3A8A', secondary: '#FBBF24', bg: '#EFF6FF' }),
    animation: 'nishan_glow',
  },
  childrens_day: {
    label: "Children's Day",
    tagline: 'Joyful colours for the family',
    badge_text: "Children's Day",
    ...base("Joyful colours for the family this Children’s Day · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#0369A1', secondary: '#FBBF24', bg: '#F0F9FF' }),
    animation: 'balloons',
  },

  // December
  christmas: {
    label: 'Christmas',
    tagline: 'Winter glam in silk & gold',
    badge_text: 'Holiday Edit',
    ...base("Winter glam in silk and gold for Christmas · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#6B1528', secondary: '#C9A84C', bg: '#F7F4EF' }),
    animation: 'snow_pine',
  },
  hornbill: {
    label: 'Hornbill Festival',
    tagline: 'Northeast pride in silk',
    badge_text: 'Hornbill',
    ...base("Northeast pride woven in silk for Hornbill · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#9A3412', secondary: '#FBBF24', bg: '#FFF7ED' }),
    animation: 'tribal_feather',
  },
  new_year_eve: {
    label: "New Year's Eve",
    tagline: 'Party silk for the countdown',
    badge_text: "New Year's Eve",
    ...base("Party silk for the New Year countdown · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#4A0E2B', secondary: '#E0C068', bg: '#FBF8F2' }),
    animation: 'fireworks',
  },

  // alias used earlier
  eid: {
    label: 'Eid',
    tagline: 'Graceful weaves for Eid celebrations',
    badge_text: 'Eid Collection',
    ...base("Graceful weaves for Eid celebrations · Free shipping above ₹999 · Use code FIRST10 for 10% off", { primary: '#0F5C4C', secondary: '#C9A84C', bg: '#F3FAF7' }),
    animation: 'crescent_gold',
  },
};

export function getFestivalLabel(key) {
  return FESTIVAL_PRESETS[key]?.label || key;
}
