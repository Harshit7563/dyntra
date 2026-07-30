import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { signToken, authRequired } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/notifications.js';
import { FRONTEND_URL } from '../config/company.js';

const router = Router();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicUser(row) {
  if (!row) return null;
  const deletionRequestedAt = row.deletion_requested_at || null;
  let deletion_effective_at = null;
  if (deletionRequestedAt) {
    const d = new Date(deletionRequestedAt);
    d.setDate(d.getDate() + 7);
    deletion_effective_at = d.toISOString();
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    is_admin: row.is_admin,
    created_at: row.created_at,
    deletion_requested_at: deletionRequestedAt,
    deletion_effective_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Email already registered. Please login.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, is_admin, created_at',
      [name.trim(), email.toLowerCase().trim(), password_hash, phone?.trim() || null]
    );

    const user = publicUser(rows[0]);
    const token = signToken(user);

    sendWelcomeEmail({
      name: user.name,
      email: user.email,
      password,
    }).catch((err) => console.error('[welcome:email]', err.message));

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, password_hash, is_admin, created_at, deletion_requested_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const row = rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = publicUser(row);
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (rows.length) {
      const user = rows[0];
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, expiresAt]
      );

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
      sendPasswordResetEmail(user, resetUrl).catch((err) => console.error('[reset:email]', err.message));
    }

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const tokenHash = hashToken(token);
    const { rows } = await pool.query(
      `SELECT prt.id, prt.user_id, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1 AND prt.used_at IS NULL AND prt.expires_at > NOW()`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const resetRow = rows[0];
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, resetRow.user_id]);
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRow.id]);

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    // Opportunistic purge of expired scheduled deletions
    await pool.query(
      `DELETE FROM users
       WHERE deletion_requested_at IS NOT NULL
         AND deletion_requested_at <= NOW() - INTERVAL '7 days'
         AND COALESCE(is_admin, false) = false`
    );

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, is_admin, created_at, deletion_requested_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(publicUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/delete-account', authRequired, async (req, res) => {
  try {
    if (req.user.is_admin) {
      return res.status(400).json({ error: 'Admin accounts cannot be deleted this way' });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET deletion_requested_at = COALESCE(deletion_requested_at, NOW())
       WHERE id = $1
       RETURNING id, name, email, phone, is_admin, created_at, deletion_requested_at`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const user = publicUser(rows[0]);
    res.json({
      user,
      message:
        'Your account is scheduled for deletion. It will be permanently deleted automatically in 7 days.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cancel-deletion', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET deletion_requested_at = NULL
       WHERE id = $1
       RETURNING id, name, email, phone, is_admin, created_at, deletion_requested_at`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: publicUser(rows[0]),
      message: 'Account deletion cancelled.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
