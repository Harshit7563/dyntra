import { Router } from 'express';
import { pool } from '../db.js';
import { toPublicFestival } from '../utils/festival.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await pool.query(
      `INSERT INTO festival_settings (id, enabled, festival_key)
       VALUES (1, false, 'none') ON CONFLICT (id) DO NOTHING`
    );
    const { rows } = await pool.query('SELECT * FROM festival_settings WHERE id = 1');
    res.json(toPublicFestival(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
