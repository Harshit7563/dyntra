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

router.put('/', async (req, res) => {
  try {
    const {
      enabled,
      festival_key,
      label,
      tagline,
      badge_text,
      show_badge,
      announcements,
      starts_at,
      ends_at,
    } = req.body;

    const key = (festival_key || 'none').trim();
    const preset = FESTIVAL_PRESETS[key] || FESTIVAL_PRESETS.none;

    const { rows } = await pool.query(
      `UPDATE festival_settings SET
        enabled = COALESCE($1, enabled),
        festival_key = COALESCE($2, festival_key),
        label = COALESCE($3, label),
        tagline = COALESCE($4, tagline),
        badge_text = COALESCE($5, badge_text),
        show_badge = COALESCE($6, show_badge),
        announcements = COALESCE($7, announcements),
        accent_primary = $8,
        accent_secondary = $9,
        accent_bg = $10,
        starts_at = $11,
        ends_at = $12,
        updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [
        enabled,
        key,
        label != null ? String(label).trim() : null,
        tagline != null ? String(tagline).trim() : null,
        badge_text != null ? String(badge_text).trim() : null,
        show_badge,
        announcements != null ? String(announcements) : null,
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
