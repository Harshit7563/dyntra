import { Router } from 'express';
import { pool } from '../../db.js';
import { FESTIVAL_PRESETS } from '../../utils/festival.js';

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
    res.json({ settings: row, presets: FESTIVAL_PRESETS });
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
      accent_primary,
      accent_secondary,
      accent_bg,
      starts_at,
      ends_at,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE festival_settings SET
        enabled = COALESCE($1, enabled),
        festival_key = COALESCE($2, festival_key),
        label = COALESCE($3, label),
        tagline = COALESCE($4, tagline),
        badge_text = COALESCE($5, badge_text),
        show_badge = COALESCE($6, show_badge),
        announcements = COALESCE($7, announcements),
        accent_primary = COALESCE($8, accent_primary),
        accent_secondary = COALESCE($9, accent_secondary),
        accent_bg = COALESCE($10, accent_bg),
        starts_at = $11,
        ends_at = $12,
        updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [
        enabled,
        festival_key?.trim(),
        label != null ? String(label).trim() : null,
        tagline != null ? String(tagline).trim() : null,
        badge_text != null ? String(badge_text).trim() : null,
        show_badge,
        announcements != null ? String(announcements) : null,
        accent_primary?.trim(),
        accent_secondary?.trim(),
        accent_bg?.trim(),
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
