import { Router } from 'express';
import { pool } from '../db.js';
import { buildPaymentUrl, sanitizeGateway } from '../utils/paymentUrl.js';
import { sendOrderNotifications } from '../services/notifications.js';
import { FRONTEND_URL } from '../config/company.js';
import { COD_MAX_PRODUCT_PRICE } from '../config/payment.js';

const router = Router();

async function getSettings() {
  const { rows } = await pool.query('SELECT * FROM payment_settings WHERE id = 1');
  if (!rows.length) {
    return { id: 1, cod_enabled: true, upi_enabled: true, upi_vpa: '', active_gateway_id: null };
  }
  return rows[0];
}

async function loadOrderItems(orderId) {
  const { rows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  return rows;
}

export async function confirmOrderPayment(orderNumber) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      "SELECT * FROM orders WHERE order_number = $1 AND payment_status = 'pending' FOR UPDATE",
      [orderNumber]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return null;
    }

    const order = rows[0];
    const { rows: items } = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    for (const item of items) {
      const { rows: products } = await client.query(
        'SELECT stock, name FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (!products.length || products[0].stock < item.quantity) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient stock for ${item.product_name}`);
      }
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = $1",
      [order.id]
    );
    await client.query('COMMIT');

    const confirmed = { ...order, payment_status: 'paid', status: 'confirmed' };
    sendOrderNotifications(confirmed, items).catch((err) => console.error('[order:notify]', err.message));
    return confirmed;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function buildCallbackUrl(gateway, orderNumber, email) {
  const template =
    gateway.callback_url ||
    `${FRONTEND_URL}/order-success/{order_number}?payment=success&email={email}`;

  return template
    .replace('{order_number}', orderNumber)
    .replace('{email}', encodeURIComponent(email || ''));
}

router.get('/config', async (_req, res) => {
  try {
    const settings = await getSettings();
    let activeGateway = null;

    if (settings.active_gateway_id) {
      const { rows } = await pool.query(
        'SELECT * FROM payment_gateways WHERE id = $1 AND is_enabled = true',
        [settings.active_gateway_id]
      );
      if (rows.length) {
        activeGateway = sanitizeGateway(rows[0]);
      }
    }

    const methods = [];
    if (settings.cod_enabled) {
      methods.push({
        id: 'cod',
        label: 'Cash on Delivery',
        desc: `Available for products up to ₹${COD_MAX_PRODUCT_PRICE}`,
      });
    }
    if (settings.upi_enabled) {
      methods.push({
        id: 'upi',
        label: 'UPI / PhonePe / GPay',
        desc: settings.upi_vpa ? `Pay to ${settings.upi_vpa} on delivery` : 'Pay via UPI at delivery confirmation',
      });
    }
    if (activeGateway?.payment_url) {
      methods.push({
        id: 'online',
        label: `Pay Online (${activeGateway.name})`,
        desc: activeGateway.test_mode ? 'Test mode — redirect to payment gateway' : 'Secure online payment',
      });
    }

    res.json({
      cod_enabled: settings.cod_enabled,
      cod_max_product_price: COD_MAX_PRODUCT_PRICE,
      upi_enabled: settings.upi_enabled,
      upi_vpa: settings.upi_vpa || '',
      active_gateway: activeGateway,
      methods,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/build-url', async (req, res) => {
  try {
    const { order_number, amount, email, phone, name } = req.body;
    const settings = await getSettings();

    if (!settings.active_gateway_id) {
      return res.status(400).json({ error: 'No payment gateway configured' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM payment_gateways WHERE id = $1 AND is_enabled = true',
      [settings.active_gateway_id]
    );
    if (!rows.length || !rows[0].payment_url) {
      return res.status(400).json({ error: 'Active gateway has no payment URL set' });
    }

    const gateway = rows[0];
    const callbackUrl = buildCallbackUrl(gateway, order_number, email);

    const payment_url = buildPaymentUrl(gateway.payment_url, {
      amount,
      order_number,
      email,
      phone,
      name,
      currency: 'INR',
      merchant_id: gateway.merchant_id || '',
      api_key: gateway.api_key || '',
      callback_url: callbackUrl,
    });

    if (!payment_url) {
      return res.status(400).json({ error: 'Could not build payment URL' });
    }

    res.json({ payment_url, gateway_name: gateway.name, callback_url: callbackUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['x-payment-secret'] !== webhookSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const orderNumber = req.body.order_number || req.body.order_id || req.body.orderId;
    if (!orderNumber) {
      return res.status(400).json({ error: 'order_number required in webhook payload' });
    }

    const order = await confirmOrderPayment(String(orderNumber));
    if (!order) {
      return res.json({ received: true, message: 'Order already confirmed or not found' });
    }

    res.json({ received: true, confirmed: true, order_number: order.order_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { order_number, payment_reference } = req.body;
    if (!order_number) return res.status(400).json({ error: 'order_number required' });

    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const headerSecret = req.headers['x-payment-secret'];
    const hasValidSecret = webhookSecret && headerSecret === webhookSecret;

    if (!hasValidSecret && !payment_reference) {
      return res.status(400).json({
        error: 'Payment confirmation requires gateway callback (?payment=success) or payment_reference',
      });
    }

    const order = await confirmOrderPayment(order_number);
    if (!order) return res.status(404).json({ error: 'Order not found or already paid' });

    const items = await loadOrderItems(order.id);
    res.json({ success: true, order_number: order.order_number, order: { ...order, items } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
