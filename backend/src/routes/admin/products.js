import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

const MAX_IMAGES = 8;

async function syncProductCategories(client, productId, primarySlug, categorySlugs, categoryMap) {
  await client.query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
  const tags = [...new Set([primarySlug, ...(categorySlugs || [])].filter(Boolean))];
  for (const slug of tags) {
    if (categoryMap[slug]) {
      await client.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [productId, categoryMap[slug]]
      );
    }
  }
}

async function syncProductImages(client, productId, imageUrls) {
  await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
  const urls = [...new Set((imageUrls || []).map((u) => String(u || '').trim()).filter(Boolean))].slice(0, MAX_IMAGES);
  for (let i = 0; i < urls.length; i++) {
    await client.query(
      'INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)',
      [productId, urls[i], i]
    );
  }
  return urls;
}

function priceRange(price) {
  const p = Number(price);
  if (p < 500) return 'under-500';
  if (p < 1500) return '500-1500';
  if (p < 3000) return '1500-3000';
  return '3000-6000';
}

function normalizeImageUrls(body) {
  const list = Array.isArray(body.image_urls) ? body.image_urls : [];
  const urls = [...new Set(list.map((u) => String(u || '').trim()).filter(Boolean))];
  if (body.image_url?.trim() && !urls.includes(body.image_url.trim())) {
    urls.unshift(body.image_url.trim());
  }
  return urls.slice(0, MAX_IMAGES);
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim();

    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (p.name ILIKE $${params.length} OR p.slug ILIKE $${params.length})`;
    }

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM products p ${where}`, params);
    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      products: rows,
      total: countRes.rows[0].total,
      page,
      pages: Math.ceil(countRes.rows[0].total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.slug AS category_slug,
        COALESCE(
          (SELECT json_agg(json_build_object('id', cat.id, 'slug', cat.slug, 'name', cat.name) ORDER BY cat.name)
           FROM product_categories pc
           JOIN categories cat ON cat.id = pc.category_id
           WHERE pc.product_id = p.id),
          '[]'
        ) AS categories,
        COALESCE(
          (SELECT json_agg(pi.url ORDER BY pi.sort_order, pi.id)
           FROM product_images pi
           WHERE pi.product_id = p.id),
          '[]'
        ) AS image_urls
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];
    if (!Array.isArray(product.image_urls) || !product.image_urls.length) {
      product.image_urls = product.image_url ? [product.image_url] : [];
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name, slug, description, price, compare_price,
      primary_slug, category_slugs, occasion, stock, is_featured, is_new,
    } = req.body;

    if (!name?.trim() || !slug?.trim() || price == null) {
      return res.status(400).json({ error: 'Name, slug and price are required' });
    }

    const imageUrls = normalizeImageUrls(req.body);
    if (!imageUrls.length) {
      return res.status(400).json({ error: 'At least one product image is required' });
    }

    const { rows: cats } = await client.query('SELECT id, slug FROM categories');
    const categoryMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const selected = [...new Set((category_slugs || []).filter((s) => categoryMap[s]))];
    const primary = (primary_slug && categoryMap[primary_slug] ? primary_slug : null)
      || selected[0];
    if (!primary || !categoryMap[primary]) {
      return res.status(400).json({ error: 'Select at least one valid category' });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO products (name, slug, description, price, compare_price, image_url, category_id, occasion, price_range, stock, is_featured, is_new)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        description?.trim() || `Authentic handwoven ${name.trim()}.`,
        price,
        compare_price || null,
        imageUrls[0],
        categoryMap[primary],
        occasion?.trim() || 'Traditional Sarees',
        priceRange(price),
        stock ?? 1,
        !!is_featured,
        !!is_new,
      ]
    );

    await syncProductCategories(client, rows[0].id, primary, selected.length ? selected : [primary], categoryMap);
    await syncProductImages(client, rows[0].id, imageUrls);
    await client.query('COMMIT');
    res.status(201).json({ ...rows[0], image_urls: imageUrls, categories: selected });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name, slug, description, price, compare_price,
      primary_slug, category_slugs, occasion, stock, is_featured, is_new,
    } = req.body;

    const { rows: cats } = await client.query('SELECT id, slug FROM categories');
    const categoryMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const selected = category_slugs
      ? [...new Set(category_slugs.filter((s) => categoryMap[s]))]
      : null;
    const primary = primary_slug && categoryMap[primary_slug]
      ? primary_slug
      : selected?.[0];

    const imageUrls = req.body.image_urls !== undefined || req.body.image_url !== undefined
      ? normalizeImageUrls(req.body)
      : null;

    if (imageUrls && !imageUrls.length) {
      return res.status(400).json({ error: 'At least one product image is required' });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        compare_price = $5,
        image_url = COALESCE($6, image_url),
        category_id = COALESCE($7, category_id),
        occasion = COALESCE($8, occasion),
        price_range = COALESCE($9, price_range),
        stock = COALESCE($10, stock),
        is_featured = $11,
        is_new = $12
       WHERE id = $13 RETURNING *`,
      [
        name?.trim(),
        slug?.trim()?.toLowerCase(),
        description?.trim(),
        price,
        compare_price ?? null,
        imageUrls ? imageUrls[0] : null,
        primary ? categoryMap[primary] : null,
        occasion?.trim(),
        price != null ? priceRange(price) : null,
        stock,
        is_featured ?? false,
        is_new ?? false,
        req.params.id,
      ]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    if (primary) {
      await syncProductCategories(client, rows[0].id, primary, selected?.length ? selected : [primary], categoryMap);
    }
    if (imageUrls) {
      await syncProductImages(client, rows[0].id, imageUrls);
    }

    await client.query('COMMIT');
    res.json({ ...rows[0], image_urls: imageUrls || undefined });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
