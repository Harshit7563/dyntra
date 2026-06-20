import { SAREE_IMG_IDS } from './categories.js';

const FABRICS = [
  { label: 'Cotton', slug: 'cotton-sarees', min: 100, max: 499, regional: 'tant' },
  { label: 'Silk', slug: 'silk-sarees', min: 500, max: 1800, regional: null },
  { label: 'Banarasi', slug: 'banarasi-sarees', min: 1200, max: 4500, regional: 'banarasi' },
  { label: 'Kanjivaram', slug: 'kanjivaram-sarees', min: 1800, max: 6000, regional: 'kanjivaram' },
  { label: 'Chanderi', slug: 'chanderi-sarees', min: 800, max: 2200, regional: null },
  { label: 'Linen', slug: 'linen-sarees', min: 600, max: 1500, regional: null },
  { label: 'Organza', slug: 'organza-sarees', min: 900, max: 2800, regional: null },
  { label: 'Georgette', slug: 'georgette-sarees', min: 450, max: 1200, regional: null },
  { label: 'Chiffon', slug: 'chiffon-sarees', min: 400, max: 1100, regional: null },
  { label: 'Satin', slug: 'satin-sarees', min: 550, max: 1400, regional: null },
  { label: 'Crepe', slug: 'crepe-sarees', min: 350, max: 950, regional: null },
  { label: 'Net', slug: 'net-sarees', min: 700, max: 2000, regional: null },
  { label: 'Rayon', slug: 'rayon-sarees', min: 250, max: 750, regional: null },
];

const COLORS = [
  { label: 'Ruby Red', slug: 'red-sarees' },
  { label: 'Blush Pink', slug: 'pink-sarees' },
  { label: 'Emerald Green', slug: 'green-sarees' },
  { label: 'Royal Blue', slug: 'blue-sarees' },
  { label: 'Classic Black', slug: 'black-sarees' },
  { label: 'Ivory White', slug: 'white-sarees' },
  { label: 'Golden Yellow', slug: 'yellow-sarees' },
  { label: 'Regal Purple', slug: 'purple-sarees' },
];

const DESIGNS = [
  { label: 'Handloom', slug: 'handloom-sarees' },
  { label: 'Printed', slug: 'printed-sarees' },
  { label: 'Embroidered', slug: 'embroidered-sarees' },
  { label: 'Zari Work', slug: 'zari-work-sarees' },
  { label: 'Designer', slug: 'designer-sarees' },
  { label: 'Sequins', slug: 'sequins-sarees' },
  { label: 'Stone Work', slug: 'stone-work-sarees' },
  { label: 'Bandhani', slug: 'bandhani-sarees' },
  { label: 'Leheriya', slug: 'leheriya-sarees' },
];

const OCCASIONS = [
  { label: 'Daily Wear', slug: 'daily-wear-sarees', minPrice: 0 },
  { label: 'Office Wear', slug: 'office-wear-sarees', minPrice: 300 },
  { label: 'Party Wear', slug: 'party-wear-sarees', minPrice: 700 },
  { label: 'Festive', slug: 'festive-sarees', minPrice: 900 },
  { label: 'Wedding', slug: 'wedding-sarees', minPrice: 1500 },
  { label: 'Bridal', slug: 'bridal-sarees', minPrice: 2500 },
  { label: 'Reception', slug: 'reception-sarees', minPrice: 2000 },
  { label: 'Traditional', slug: 'traditional-sarees', minPrice: 500 },
];

const PALLU_STYLES = [
  'Temple Border Pallu',
  'Contrast Zari Pallu',
  'Gold Brocade Pallu',
  'Silver Tissue Pallu',
  'Dual Tone Pallu',
  'Classic Plain Pallu',
  'Rich Meenakari Pallu',
  'Peacock Motif Pallu',
];

const MOTIFS = [
  'Floral Jaal',
  'Peacock Butta',
  'Temple Motif',
  'Paisley Weave',
  'Geometric Block',
  'Mango Booti',
  'Checks Pattern',
  'Striped Body',
  'Kalamkari Print',
  'Ikat Weave',
];

const REGIONAL_EXTRA = ['paithani', 'patola', 'sambalpuri', 'muga-silk', 'kota-doria', 'bandhani'];

function pickOccasion(price) {
  const eligible = OCCASIONS.filter((o) => price >= o.minPrice);
  return eligible[price % eligible.length];
}

function priceRange(price) {
  if (price < 500) return 'under-500';
  if (price < 1500) return '500-1500';
  if (price < 3000) return '1500-3000';
  return '3000-6000';
}

function roundPrice(value) {
  if (value < 500) return Math.round(value / 50) * 50 || 100;
  if (value < 2000) return Math.round(value / 100) * 100;
  return Math.round(value / 250) * 250;
}

export function generateProducts(targetCount = 260) {
  const products = [];
  const usedSlugs = new Set();
  let idx = 0;

  while (products.length < targetCount && idx < targetCount * 3) {
    const fabric = FABRICS[idx % FABRICS.length];
    const color = COLORS[Math.floor(idx / FABRICS.length) % COLORS.length];
    const design = DESIGNS[Math.floor(idx / (FABRICS.length * COLORS.length)) % DESIGNS.length];
    const pallu = PALLU_STYLES[idx % PALLU_STYLES.length];
    const motif = MOTIFS[Math.floor(idx / PALLU_STYLES.length) % MOTIFS.length];
    const series = Math.floor(idx / (FABRICS.length * COLORS.length * DESIGNS.length)) + 1;

    const name = `${fabric.label} ${color.label} ${design.label} Saree – ${motif}, ${pallu} #${series}`;
    const slugBase = `${fabric.slug}-${color.slug.replace('-sarees', '')}-${design.slug.replace('-sarees', '')}-${motif}-${series}-${idx}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (usedSlugs.has(slugBase)) {
      idx++;
      continue;
    }
    usedSlugs.add(slugBase);

    const spread = fabric.max - fabric.min;
    const price = roundPrice(fabric.min + ((idx * 47 + series * 13) % (spread + 1)));
    const occasion = pickOccasion(price);

    const tags = new Set([
      fabric.slug,
      color.slug,
      design.slug,
      occasion.slug,
    ]);

    if (fabric.regional) tags.add(fabric.regional);
    if (price >= 900) tags.add('festive-sarees');
    if (price >= 700) tags.add('party-wear-sarees');
    if (price < 600) tags.add('daily-wear-sarees');
    if (design.slug === 'handloom-sarees') tags.add('handloom-sarees');
    if (idx % 11 === 0) tags.add(REGIONAL_EXTRA[idx % REGIONAL_EXTRA.length]);

    products.push({
      name,
      slug: slugBase,
      price,
      primary: fabric.slug,
      tags: [...tags],
      image: SAREE_IMG_IDS[idx % SAREE_IMG_IDS.length],
      stock: 1 + (idx % 20),
      is_featured: idx % 18 === 0,
      is_new: idx % 9 === 0,
      occasion: occasion.label,
      price_range: priceRange(price),
    });

    idx++;
  }

  return products;
}

export function productImageUrl(imageId, w = 800) {
  return `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}
