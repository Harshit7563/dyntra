import { Router } from 'express';
import { pool } from '../db.js';
import { CATEGORY_GROUPS } from '../data/categories.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY group_type, sort_order, name'
    );

    if (req.query.grouped === 'true') {
      const grouped = {};
      for (const [key, { label }] of Object.entries(CATEGORY_GROUPS)) {
        grouped[key] = { label, items: rows.filter((c) => c.group_type === key) };
      }
      return res.json(grouped);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
