import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const MAX_MESSAGES = 20;
const MAX_CONTENT_LEN = 800;
const CATALOG_LIMIT = 150;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 40;
const LIVE_CATALOG_BASE = (process.env.CATALOG_API_BASE || 'https://dyntra.in').replace(/\/$/, '');

const rateMap = new Map();
let catalogCache = { at: 0, rows: null };
const CATALOG_CACHE_MS = 60_000;

const FABRICS = [
  ['banarasi', ['banarasi']],
  ['kanjivaram', ['kanjivaram', 'kanjeevaram', 'kanchipuram']],
  ['silk', ['silk', 'pure silk']],
  ['cotton', ['cotton']],
  ['linen', ['linen']],
  ['organza', ['organza']],
  ['georgette', ['georgette']],
  ['chiffon', ['chiffon']],
  ['satin', ['satin']],
  ['crepe', ['crepe', 'crape']],
  ['net', ['net']],
  ['rayon', ['rayon']],
  ['chanderi', ['chanderi']],
];

const OCCASIONS = [
  ['Wedding', ['wedding', 'shaadi', 'bridal', 'bride', 'baraat', 'reception']],
  ['Festive', ['festive', 'festival', 'diwali', 'navratri', 'puja', 'pooja', 'eid']],
  ['Party', ['party', 'cocktail', 'sangeet', 'mehendi', 'mehndi']],
  ['Daily Wear', ['daily', 'casual', 'office', 'everyday', 'simple', 'roz']],
  ['Gift', ['gift', 'present', 'mom', 'mummy', 'mother', 'wife', 'gift']],
];

const COLORS = [
  ['red', ['red', 'lal', 'maroon', 'wine', 'burgundy']],
  ['pink', ['pink', 'rose', 'magenta']],
  ['blue', ['blue', 'neela', 'navy', 'royal blue']],
  ['green', ['green', 'hara', 'emerald', 'olive']],
  ['gold', ['gold', 'golden', 'zari']],
  ['yellow', ['yellow', 'mustard', 'haldi']],
  ['orange', ['orange', 'peach', 'coral']],
  ['purple', ['purple', 'violet', 'lavender']],
  ['black', ['black', 'kala']],
  ['white', ['white', 'off white', 'ivory', 'cream']],
];

function clientIp(req) {
  return req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
}

function rateLimit(ip) {
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    entry = { start: now, count: 0 };
    rateMap.set(ip, entry);
  }
  entry.count += 1;
  return entry.count <= RATE_MAX;
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_MESSAGES)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_CONTENT_LEN),
    }))
    .filter((m) => m.content.length > 0);
}

async function loadCatalogFromLive() {
  const all = [];
  const pageSize = 100;
  const maxPages = Math.ceil(CATALOG_LIMIT / pageSize);
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${LIVE_CATALOG_BASE}/api/products?limit=${pageSize}&page=${page}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Live catalog HTTP ${res.status}`);
    const data = await res.json();
    const batch = Array.isArray(data) ? data : (data.products || []);
    for (const p of batch) {
      if (Number(p.stock) <= 0) continue;
      let image = p.image_url || '';
      if (image.startsWith('/')) image = `${LIVE_CATALOG_BASE}${image}`;
      all.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        occasion: p.occasion,
        price_range: p.price_range,
        image_url: image,
        stock: p.stock,
        is_featured: p.is_featured,
        is_new: p.is_new,
        category_name: p.category_name,
        product_url: `${LIVE_CATALOG_BASE}/products/${encodeURIComponent(p.slug)}`,
      });
      if (all.length >= CATALOG_LIMIT) break;
    }
    const pages = data.pages || 1;
    if (page >= pages || all.length >= CATALOG_LIMIT || !batch.length) break;
  }
  return all;
}

async function loadCatalogFromDb() {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.slug, p.price, p.occasion, p.price_range,
            p.image_url, p.stock, p.is_featured, p.is_new, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE COALESCE(p.stock, 0) > 0
     ORDER BY p.is_featured DESC, p.is_new DESC, p.id DESC
     LIMIT $1`,
    [CATALOG_LIMIT]
  );
  return rows.map((p) => ({
    ...p,
    product_url: `/products/${p.slug}`,
  }));
}

async function loadCatalog() {
  const now = Date.now();
  if (catalogCache.rows && now - catalogCache.at < CATALOG_CACHE_MS) {
    return catalogCache.rows;
  }

  // Production / cPanel: always use local DB (same products as the live store).
  // Local Mac only: set USE_LIVE_CATALOG=true to pull from https://dyntra.in
  const useRemoteCatalog = process.env.USE_LIVE_CATALOG === 'true';
  if (useRemoteCatalog) {
    try {
      const live = await loadCatalogFromLive();
      if (live.length) {
        catalogCache = { at: now, rows: live };
        return live;
      }
    } catch (err) {
      console.warn('Remote catalog fetch failed, using local DB:', err.message);
    }
  }

  const local = await loadCatalogFromDb();
  catalogCache = { at: now, rows: local };
  return local;
}

function parseIntent(text) {
  const q = text.toLowerCase();
  const intent = {
    fabrics: [],
    occasions: [],
    colors: [],
    maxPrice: null,
    minPrice: null,
    gift: false,
  };

  for (const [fabric, keys] of FABRICS) {
    if (keys.some((k) => q.includes(k))) intent.fabrics.push(fabric);
  }
  for (const [occ, keys] of OCCASIONS) {
    if (keys.some((k) => q.includes(k))) intent.occasions.push(occ);
  }
  for (const [color, keys] of COLORS) {
    if (keys.some((k) => q.includes(k))) intent.colors.push(color);
  }
  if (intent.occasions.includes('Gift') || /\bgift\b|\bmom\b|\bmummy\b|\bmother\b/.test(q)) {
    intent.gift = true;
  }

  const under = q.match(/(?:under|below|budget|within|max|se kam|tak)\s*₹?\s*(\d{3,6})/i)
    || q.match(/₹\s*(\d{3,6})\s*(?:tak|se kam|below|under)?/i)
    || q.match(/(\d{3,6})\s*(?:rs|inr|rupees)?\s*(?:tak|se kam|budget)/i);
  if (under) intent.maxPrice = Number(under[1]);

  const range = q.match(/(\d{3,6})\s*[-–to]+\s*(\d{3,6})/);
  if (range) {
    intent.minPrice = Number(range[1]);
    intent.maxPrice = Number(range[2]);
  }

  if (/\bunder\s*3000\b|\b3000\b/.test(q) && !intent.maxPrice) intent.maxPrice = 3000;
  if (/\bunder\s*5000\b/.test(q) && !intent.maxPrice) intent.maxPrice = 5000;
  if (/\bunder\s*1000\b/.test(q) && !intent.maxPrice) intent.maxPrice = 1000;

  return intent;
}

function scoreProduct(p, intent) {
  const name = `${p.name} ${p.category_name || ''} ${p.occasion || ''}`.toLowerCase();
  const price = Number(p.price);
  let score = 0;
  const reasons = [];

  if (intent.maxPrice != null) {
    if (price > intent.maxPrice) return { score: -1, reasons };
    score += 8;
    reasons.push(`within ₹${intent.maxPrice}`);
  }
  if (intent.minPrice != null && price < intent.minPrice) return { score: -1, reasons };

  for (const fabric of intent.fabrics) {
    if (name.includes(fabric)) {
      score += 20;
      reasons.push(fabric);
    }
  }
  for (const occ of intent.occasions) {
    const occL = occ.toLowerCase();
    if ((p.occasion || '').toLowerCase().includes(occL.split(' ')[0]) || name.includes(occL) || name.includes('wedding') && occ === 'Wedding') {
      score += 15;
      reasons.push(occ);
    } else if (occ === 'Wedding' && /bridal|wedding|banarasi|kanjivaram/.test(name)) {
      score += 10;
      reasons.push('wedding-ready look');
    } else if (occ === 'Daily Wear' && /cotton|linen|daily|casual|simple/.test(name)) {
      score += 12;
      reasons.push('easy daily wear');
    } else if (occ === 'Gift') {
      score += 4;
    }
  }
  for (const color of intent.colors) {
    if (name.includes(color)) {
      score += 12;
      reasons.push(color);
    }
  }

  if (p.is_featured) score += 3;
  if (p.is_new) score += 2;
  if (!intent.fabrics.length && !intent.occasions.length && !intent.colors.length && intent.maxPrice == null) {
    score += p.is_featured ? 5 : 1;
  }

  return { score, reasons };
}

function buildReply(intent, products, query) {
  const bits = [];
  if (intent.occasions.length) bits.push(intent.occasions[0].toLowerCase());
  if (intent.fabrics.length) bits.push(intent.fabrics[0]);
  if (intent.colors.length) bits.push(intent.colors[0]);
  if (intent.maxPrice) bits.push(`under ₹${intent.maxPrice.toLocaleString('en-IN')}`);

  const hindiish = /[\u0900-\u097F]|\b(ke liye|chahiye|dikhao|saree|shaadi|gift)\b/i.test(query);

  if (!products.length) {
    return hindiish
      ? 'Is filter pe abhi match kam mila. Occasion, fabric (Banarasi/Silk), colour ya budget thoda change karke try karo — ya Shop All browse karo.'
      : 'I couldn’t find a strong match for that. Try occasion, fabric (Banarasi/Silk), colour, or a budget — or browse Shop All.';
  }

  const focus = bits.length ? bits.join(', ') : 'your request';
  const variantsHi = [
    `Yeh nayi picks ${focus} ke liye hain — har baar thoda alag mix dikhati hoon. View ya Add to cart try karo.`,
    `${focus} ke liye yeh fresh suggestions hain. Pasand na aaye to wahi baat dubara bhejo, aur options aayenge.`,
    `Shortlist ready hai (${focus}). Detail ke liye View, ya bag me Add to cart.`,
  ];
  const variantsEn = [
    `Fresh picks for ${focus} — I rotate suggestions each time. View details or add to cart.`,
    `Here’s another mix for ${focus}. Ask again anytime for different options.`,
    `Shortlisted for ${focus}. Tap View or Add to cart — send the same request again for more variety.`,
  ];
  if (hindiish) return variantsHi[Math.floor(Math.random() * variantsHi.length)];
  return variantsEn[Math.floor(Math.random() * variantsEn.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Weighted random pick of `count` items from a ranked pool (higher score = more likely). */
function pickVaried(pool, count, excludeIds = new Set()) {
  let candidates = pool.filter((x) => !excludeIds.has(x.p.id));
  if (candidates.length < count) {
    candidates = pool.length ? pool : candidates;
  }
  // Take a wider top slice then shuffle so repeats feel different
  const top = candidates.slice(0, Math.min(candidates.length, Math.max(count * 6, 24)));
  const jittered = top.map((x) => ({
    ...x,
    sortKey: x.score + Math.random() * 12,
  }));
  jittered.sort((a, b) => b.sortKey - a.sortKey);
  const selected = [];
  const used = new Set();
  for (const item of jittered) {
    if (used.has(item.p.id)) continue;
    used.add(item.p.id);
    selected.push(item);
    if (selected.length >= count) break;
  }
  // Final shuffle so card order also changes
  return shuffle(selected);
}

function toProductCard({ p, reasons }, fallbackReason) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image_url: p.image_url,
    stock: p.stock,
    occasion: p.occasion,
    product_url: p.product_url || `/products/${p.slug}`,
    reason: (reasons && reasons.slice(0, 2).join(' · ')) || fallbackReason,
  };
}

function recommend(catalog, userText, excludeIds = []) {
  const intent = parseIntent(userText);
  const hasSignal = intent.fabrics.length || intent.occasions.length || intent.colors.length || intent.maxPrice != null;
  const exclude = new Set(excludeIds.map(Number).filter(Boolean));

  const ranked = catalog
    .map((p) => {
      const { score, reasons } = scoreProduct(p, intent);
      return { p, score, reasons };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  let pool = ranked.filter((x) => (hasSignal ? x.score >= 6 : true));
  if (!pool.length) pool = ranked;

  // Vague query: ask a clarifying question with rotating featured picks
  if (!hasSignal) {
    const picks = pickVaried(pool, 3, exclude);
    return {
      reply: /[\u0900-\u097F]|\b(chahiye|dikhao|saree)\b/i.test(userText)
        ? 'Zaroor madad karti hoon. Occasion batao (wedding / daily / festive), fabric (Banarasi, silk, cotton…), colour ya budget — main catalog se suggest karungi.'
        : 'Happy to help. Tell me the occasion (wedding / daily / festive), fabric (Banarasi, silk, cotton…), colour, or budget — I’ll suggest from our live catalog.',
      products: picks.map((x) => toProductCard(x, x.p.is_featured ? 'Popular pick' : 'From our collection')),
    };
  }

  const picks = pickVaried(pool, 4, exclude);
  return {
    reply: buildReply(intent, picks, userText),
    products: picks.map((x) => toProductCard(x, 'Good match')),
  };
}

router.post('/shop', async (req, res) => {
  try {
    const ip = clientIp(req);
    if (!rateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    const messages = sanitizeMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({ error: 'Please send a message.' });
    }
    if (messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from the user.' });
    }

    const catalog = await loadCatalog();
    if (!catalog.length) {
      return res.json({
        reply: 'Our catalog is being updated. Please browse Shop All or try again shortly.',
        products: [],
      });
    }

    const excludeIds = Array.isArray(req.body?.exclude_ids)
      ? req.body.exclude_ids
      : [];

    const result = recommend(catalog, messages[messages.length - 1].content, excludeIds);
    res.json(result);
  } catch (err) {
    console.error('AI shop error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
});

export default router;
