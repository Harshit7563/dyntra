import { Router } from 'express';
import { pool } from '../../db.js';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();

router.use(authRequired, adminRequired);

router.get('/stats', async (_req, res) => {
  try {
    const [products, categories, orders, users, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
      pool.query('SELECT COUNT(*)::int AS count FROM categories'),
      pool.query('SELECT COUNT(*)::int AS count FROM orders'),
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COALESCE(SUM(total), 0)::float AS total FROM orders'),
    ]);
    res.json({
      products: products.rows[0].count,
      categories: categories.rows[0].count,
      orders: orders.rows[0].count,
      users: users.rows[0].count,
      revenue: revenue.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
