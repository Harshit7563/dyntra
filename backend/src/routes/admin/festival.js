import { Router } from 'express';
import { pool } from '../../db.js';
import { FESTIVAL_PRESETS, FESTIVAL_MONTHS } from '../../utils/festival.js';

const router = Router();

async function ensureRow() {
  await pool.query(
    `INSERT INTO festival_settings (id, enabled, festival_key)
     VALUES (1, false, 'none') ON CONFLICT (id) DO NOTHING`
  );
  const { rows } = await pool.query('SELECT * FROM festival_settings WHERE id = 1');
  return rows[0];
}

router.get('/', async (_req, res) => {
  try {
    const row = await ensureRow();
    res.json({ settings: row, presets: FESTIVAL_PRESETS, months: FESTIVAL_MONTHS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Admin only sets festival + dates; everything else comes from preset */
router.put('/', async (req, res) => {
  try {
    const { enabled, festival_key, starts_at, ends_at } = req.body;
    const key = (festival_key || 'none').trim();
    const preset = FESTIVAL_PRESETS[key] || FESTIVAL_PRESETS.none;
    const isOn = key === 'none' ? false : Boolean(enabled);

    const { rows } = await pool.query(
      `UPDATE festival_settings SET
        enabled = $1,
        festival_key = $2,
        label = $3,
        tagline = $4,
        badge_text = $5,
        show_badge = true,
        announcements = $6,
        accent_primary = $7,
        accent_secondary = $8,
        accent_bg = $9,
        starts_at = $10,
        ends_at = $11,
        updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [
        isOn,
        key,
        preset.label || '',
        preset.tagline || '',
        preset.badge_text || '',
        preset.announcements || '',
        preset.accent_primary || '#7B1E3A',
        preset.accent_secondary || '#C9A84C',
        preset.accent_bg || '#FAF7F2',
        starts_at || null,
        ends_at || null,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
