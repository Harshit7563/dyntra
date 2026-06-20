// Verified saree Pexels photo IDs (rotated across categories)
export const SAREE_IMG_IDS = [
  15181108, 15181109, 15181110, 15181112, 15181113,
  36114630, 36114632, 36114633, 36114634, 36114635,
  36114636, 36114637, 36114638, 36114639,
];

export const sareeImg = (index, w = 600) => {
  const id = SAREE_IMG_IDS[index % SAREE_IMG_IDS.length];
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
};

export const CATEGORY_GROUPS = {
  fabric: {
    label: 'Fabric Wise',
    items: [
      'Cotton Sarees',
      'Silk Sarees',
      'Banarasi Sarees',
      'Kanjivaram Sarees',
      'Chanderi Sarees',
      'Linen Sarees',
      'Organza Sarees',
      'Georgette Sarees',
      'Chiffon Sarees',
      'Satin Sarees',
      'Crepe Sarees',
      'Net Sarees',
      'Rayon Sarees',
    ],
  },
  occasion: {
    label: 'Occasion Wise',
    items: [
      'Wedding Sarees',
      'Bridal Sarees',
      'Party Wear Sarees',
      'Festive Sarees',
      'Office Wear Sarees',
      'Daily Wear Sarees',
      'Reception Sarees',
      'Traditional Sarees',
    ],
  },
  design: {
    label: 'Design Wise',
    items: [
      'Printed Sarees',
      'Embroidered Sarees',
      'Handloom Sarees',
      'Designer Sarees',
      'Sequins Sarees',
      'Zari Work Sarees',
      'Stone Work Sarees',
      'Bandhani Sarees',
      'Leheriya Sarees',
    ],
  },
  regional: {
    label: 'Regional Sarees',
    items: [
      'Banarasi',
      'Kanjivaram',
      'Paithani',
      'Patola',
      'Bandhani',
      'Sambalpuri',
      'Tant',
      'Muga Silk',
      'Kota Doria',
    ],
  },
  color: {
    label: 'Color Wise',
    items: [
      'Red Sarees',
      'Pink Sarees',
      'Green Sarees',
      'Blue Sarees',
      'Black Sarees',
      'White Sarees',
      'Yellow Sarees',
      'Purple Sarees',
    ],
  },
};

function toSlug(name, group) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (group === 'regional' && !base.endsWith('sarees')) {
    return base;
  }
  return base;
}

let imgIndex = 0;
export const ALL_CATEGORIES = [];

for (const [groupType, { label, items }] of Object.entries(CATEGORY_GROUPS)) {
  items.forEach((name, sortOrder) => {
    ALL_CATEGORIES.push({
      name,
      slug: toSlug(name, groupType),
      group_type: groupType,
      group_label: label,
      sort_order: sortOrder + 1,
      description: `Shop ${name} at Dyntra — authentic handwoven sarees.`,
      image_url: sareeImg(imgIndex++),
    });
  });
}
