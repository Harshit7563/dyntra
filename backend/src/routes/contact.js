import { Router } from 'express';
import { pool } from '../db.js';
import { sendContactNotification } from '../services/notifications.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
    };

    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [payload.name, payload.email, payload.phone, payload.subject, payload.message]
    );

    sendContactNotification(payload).catch((err) => console.error('[contact:notify]', err.message));

    res.status(201).json({ message: 'Thank you! We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
