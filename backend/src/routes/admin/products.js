import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

async function syncProductCategories(client, productId, primarySlug, categorySlugs, categoryMap) {
  await client.query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
  const tags = [...new Set([primarySlug, ...(categorySlugs || [])])];
  for (const slug of tags) {
    if (categoryMap[slug]) {
      await client.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [productId, categoryMap[slug]]
      );
    }
  }
}

function priceRange(price) {
  const p = Number(price);
  if (p < 500) return 'under-500';
  if (p < 1500) return '500-1500';
  if (p < 3000) return '1500-3000';
  return '3000-6000';
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
        COALESCE(json_agg(json_build_object('id', cat.id, 'slug', cat.slug, 'name', cat.name)) FILTER (WHERE cat.id IS NOT NULL), '[]') AS categories
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_categories pc ON pc.product_id = p.id
       LEFT JOIN categories cat ON cat.id = pc.category_id
       WHERE p.id = $1
       GROUP BY p.id, c.slug`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name, slug, description, price, compare_price, image_url,
      primary_slug, category_slugs, occasion, stock, is_featured, is_new,
    } = req.body;

    if (!name?.trim() || !slug?.trim() || price == null) {
      return res.status(400).json({ error: 'Name, slug and price are required' });
    }

    const { rows: cats } = await client.query('SELECT id, slug FROM categories');
    const categoryMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const primary = primary_slug || category_slugs?.[0];
    if (!primary || !categoryMap[primary]) {
      return res.status(400).json({ error: 'Valid primary category is required' });
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
        image_url?.trim() || null,
        categoryMap[primary],
        occasion?.trim() || 'Traditional Sarees',
        priceRange(price),
        stock ?? 1,
        !!is_featured,
        !!is_new,
      ]
    );

    await syncProductCategories(client, rows[0].id, primary, category_slugs || [primary], categoryMap);
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
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
      name, slug, description, price, compare_price, image_url,
      primary_slug, category_slugs, occasion, stock, is_featured, is_new,
    } = req.body;

    const { rows: cats } = await client.query('SELECT id, slug FROM categories');
    const categoryMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const primary = primary_slug || category_slugs?.[0];

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
        image_url?.trim(),
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
      await syncProductCategories(client, rows[0].id, primary, category_slugs || [primary], categoryMap);
    }

    await client.query('COMMIT');
    res.json(rows[0]);
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
