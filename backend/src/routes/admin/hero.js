import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, subtitle, image_url, cta_text, cta_link, sort_order } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO hero_slides (title, subtitle, image_url, cta_text, cta_link, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, subtitle, image_url, cta_text || 'Shop Now', cta_link || '/products', sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, image_url, cta_text, cta_link, sort_order } = req.body;
    const { rows } = await pool.query(
      `UPDATE hero_slides SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        image_url = COALESCE($3, image_url),
        cta_text = COALESCE($4, cta_text),
        cta_link = COALESCE($5, cta_link),
        sort_order = COALESCE($6, sort_order)
       WHERE id = $7 RETURNING *`,
      [title, subtitle, image_url, cta_text, cta_link, sort_order, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Slide not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM hero_slides WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Slide not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
