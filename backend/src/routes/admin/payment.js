import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';
import { sanitizeGateway } from '../../utils/paymentUrl.js';

const router = Router();
router.use(authRequired, adminRequired);

async function ensureSettings() {
  await pool.query(
    `INSERT INTO payment_settings (id, cod_enabled, upi_enabled)
     VALUES (1, true, true) ON CONFLICT (id) DO NOTHING`
  );
}

router.get('/settings', async (_req, res) => {
  try {
    await ensureSettings();
    const settings = (await pool.query('SELECT * FROM payment_settings WHERE id = 1')).rows[0];
    const { rows: gateways } = await pool.query('SELECT * FROM payment_gateways ORDER BY id DESC');

    res.json({
      settings,
      gateways: gateways.map((g) => sanitizeGateway(g, { includeSecrets: true })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    await ensureSettings();
    const { cod_enabled, upi_enabled, upi_vpa, active_gateway_id } = req.body;

    const { rows } = await pool.query(
      `UPDATE payment_settings SET
        cod_enabled = COALESCE($1, cod_enabled),
        upi_enabled = COALESCE($2, upi_enabled),
        upi_vpa = COALESCE($3, upi_vpa),
        active_gateway_id = $4,
        updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [cod_enabled, upi_enabled, upi_vpa?.trim(), active_gateway_id || null]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gateways', async (req, res) => {
  try {
    const data = req.body;
    if (!data.name?.trim()) {
      return res.status(400).json({ error: 'Gateway name is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO payment_gateways (
        name, provider, payment_url, api_url, ip_whitelist,
        merchant_id, api_key, secret_key, callback_url, webhook_url,
        is_enabled, test_mode, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        data.name.trim(),
        data.provider || 'custom',
        data.payment_url?.trim() || null,
        data.api_url?.trim() || null,
        data.ip_whitelist?.trim() || null,
        data.merchant_id?.trim() || null,
        data.api_key?.trim() || null,
        data.secret_key?.trim() || null,
        data.callback_url?.trim() || null,
        data.webhook_url?.trim() || null,
        data.is_enabled !== false,
        data.test_mode !== false,
        data.notes?.trim() || null,
      ]
    );

    res.status(201).json(sanitizeGateway(rows[0], { includeSecrets: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/gateways/:id', async (req, res) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(
      `UPDATE payment_gateways SET
        name = COALESCE($1, name),
        provider = COALESCE($2, provider),
        payment_url = COALESCE($3, payment_url),
        api_url = COALESCE($4, api_url),
        ip_whitelist = COALESCE($5, ip_whitelist),
        merchant_id = COALESCE($6, merchant_id),
        api_key = COALESCE($7, api_key),
        secret_key = COALESCE($8, secret_key),
        callback_url = COALESCE($9, callback_url),
        webhook_url = COALESCE($10, webhook_url),
        is_enabled = COALESCE($11, is_enabled),
        test_mode = COALESCE($12, test_mode),
        notes = COALESCE($13, notes)
       WHERE id = $14 RETURNING *`,
      [
        data.name?.trim(),
        data.provider,
        data.payment_url?.trim(),
        data.api_url?.trim(),
        data.ip_whitelist?.trim(),
        data.merchant_id?.trim(),
        data.api_key?.trim(),
        data.secret_key?.trim(),
        data.callback_url?.trim(),
        data.webhook_url?.trim(),
        data.is_enabled,
        data.test_mode,
        data.notes?.trim(),
        req.params.id,
      ]
    );

    if (!rows.length) return res.status(404).json({ error: 'Gateway not found' });
    res.json(sanitizeGateway(rows[0], { includeSecrets: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/gateways/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query('UPDATE payment_settings SET active_gateway_id = NULL WHERE active_gateway_id = $1', [id]);
    const { rowCount } = await pool.query('DELETE FROM payment_gateways WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Gateway not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gateways/:id/activate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT id FROM payment_gateways WHERE id = $1 AND is_enabled = true', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Gateway not found or disabled' });

    await ensureSettings();
    const { rows: updated } = await pool.query(
      'UPDATE payment_settings SET active_gateway_id = $1, updated_at = NOW() WHERE id = 1 RETURNING *',
      [id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
