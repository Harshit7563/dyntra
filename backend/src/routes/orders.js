import { Router } from 'express';
import { pool } from '../db.js';
import { authOptional, authRequired } from '../middleware/auth.js';
import { sendOrderNotifications } from '../services/notifications.js';
import { COD_MAX_PRODUCT_PRICE } from '../config/payment.js';

const router = Router();
const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 49;
const VALID_COUPONS = { FIRST10: 0.1 };

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DYNT-${ts}${rand}`;
}

router.get('/my', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, COALESCE(json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customer_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      payment_method,
      coupon_code,
      items,
    } = req.body;

    if (!customer_name?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Name, email and phone are required' });
    }
    if (!address_line1?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ error: 'Valid 6-digit pincode is required' });
    }
    if (!payment_method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    if (!items?.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    const orderItems = [];

    const isOnline = payment_method === 'online';
    const isUpi = payment_method === 'upi';
    const awaitsPayment = isOnline || isUpi;
    const orderStatus = awaitsPayment ? 'pending_payment' : 'confirmed';
    const paymentStatus = awaitsPayment ? 'pending' : 'paid';

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, name, slug, price, stock, image_url FROM products WHERE id = $1 FOR UPDATE',
        [item.id]
      );
      if (!rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product not found: ${item.name || item.id}` });
      }
      const product = rows[0];
      if (payment_method === 'cod' && Number(product.price) > COD_MAX_PRODUCT_PRICE) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Cash on Delivery is only available for products up to ₹${COD_MAX_PRODUCT_PRICE}. "${product.name}" exceeds this limit.`,
        });
      }
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image_url: product.image_url,
      });

      if (!awaitsPayment) {
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, product.id]
        );
      }
    }

    const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    const coupon = coupon_code?.trim().toUpperCase();
    const discountRate = VALID_COUPONS[coupon] || 0;
    const discount = Math.round(subtotal * discountRate);
    const total = subtotal + shipping - discount;

    const orderNumber = generateOrderNumber();

    const userId = req.user?.id || null;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (
        order_number, customer_name, email, phone,
        address_line1, address_line2, city, state, pincode,
        payment_method, subtotal, shipping, discount, total, coupon_code, user_id, status, payment_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        orderNumber,
        customer_name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        address_line1.trim(),
        address_line2?.trim() || null,
        city.trim(),
        state.trim(),
        pincode.trim(),
        payment_method,
        subtotal,
        shipping,
        discount,
        total,
        discountRate ? coupon : null,
        userId,
        orderStatus,
        paymentStatus,
      ]
    );

    const order = orderRows[0];

    for (const oi of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_slug, price, quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, oi.product_id, oi.product_name, oi.product_slug, oi.price, oi.quantity, oi.image_url]
      );
    }

    await client.query('COMMIT');

    const responseOrder = {
      order_number: order.order_number,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      payment_method: order.payment_method,
      status: order.status,
      payment_status: order.payment_status,
      email: order.email,
      phone: order.phone,
      customer_name: order.customer_name,
      address_line1: order.address_line1,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: orderItems,
    };

    if (!awaitsPayment) {
      sendOrderNotifications(order, orderItems).catch((err) => console.error('[order:notify]', err.message));
    }

    res.status(201).json(responseOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/:orderNumber', authOptional, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE order_number = $1',
      [req.params.orderNumber]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    const order = rows[0];
    const emailQuery = req.query.email?.trim().toLowerCase();
    const isOwner = req.user && order.user_id === req.user.id;
    const emailMatch = emailQuery && emailQuery === order.email?.toLowerCase();

    if (!isOwner && !emailMatch) {
      return res.status(403).json({ error: 'Verify your email to view this order' });
    }

    const { rows: items } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
