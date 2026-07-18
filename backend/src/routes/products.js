import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, occasion, price_range, featured, new: isNew, search, limit, page } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND (
        c.slug = $${paramIndex}
        OR EXISTS (
          SELECT 1 FROM product_categories pc
          JOIN categories cat ON cat.id = pc.category_id
          WHERE pc.product_id = p.id AND cat.slug = $${paramIndex}
        )
      )`;
      params.push(category);
      paramIndex++;
    }
    if (occasion) {
      query += ` AND p.occasion = $${paramIndex++}`;
      params.push(occasion);
    }
    if (price_range) {
      query += ` AND p.price_range = $${paramIndex++}`;
      params.push(price_range);
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    if (isNew === 'true') {
      query += ` AND p.is_new = true`;
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name, c.slug as category_slug', 'SELECT COUNT(*)::int AS total');
    const countRes = await pool.query(countQuery, params);
    const total = countRes.rows[0].total;

    query += ` ORDER BY p.created_at DESC`;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 24);

    if (pageNum && limitNum) {
      const offset = (pageNum - 1) * limitNum;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limitNum, offset);
    } else if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit, 10));
    }

    const { rows } = await pool.query(query, params);

    if (pageNum && limitNum) {
      return res.json({
        products: rows,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      });
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
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
       WHERE p.slug = $1`,
      [req.params.slug]
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

export default router;
