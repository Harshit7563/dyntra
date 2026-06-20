import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, initials, rating, review, verified, source, review_date } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO testimonials (name, initials, rating, review, verified, source, review_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, initials, rating || 5, review, verified ?? true, source || 'Google Review', review_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, initials, rating, review, verified, source, review_date } = req.body;
    const { rows } = await pool.query(
      `UPDATE testimonials SET
        name = COALESCE($1, name),
        initials = COALESCE($2, initials),
        rating = COALESCE($3, rating),
        review = COALESCE($4, review),
        verified = COALESCE($5, verified),
        source = COALESCE($6, source),
        review_date = COALESCE($7, review_date)
       WHERE id = $8 RETURNING *`,
      [name, initials, rating, review, verified, source, review_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
