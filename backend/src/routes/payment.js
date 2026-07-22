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
        desc: settings.upi_vpa
          ? `Pay securely to ${settings.upi_vpa} — Dyntra UPI checkout`
          : 'Pay instantly via UPI, PhonePe or GPay',
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
    const allowedManualRefs = ['upi_manual', 'upi_paid', 'gateway_return', 'pay_on_delivery'];
    const hasManualRef = payment_reference && allowedManualRefs.includes(String(payment_reference));

    if (!hasValidSecret && !hasManualRef) {
      return res.status(400).json({
        error: 'Payment confirmation requires gateway callback (?payment=success) or payment_reference',
      });
    }

    // Pay on delivery: confirm order, keep payment pending for COD-style collection
    if (payment_reference === 'pay_on_delivery') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          "SELECT * FROM orders WHERE order_number = $1 AND payment_status = 'pending' AND payment_method = 'upi' FOR UPDATE",
          [order_number]
        );
        if (!rows.length) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Order not found or already processed' });
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
          "UPDATE orders SET payment_status = 'pending', status = 'confirmed' WHERE id = $1",
          [order.id]
        );
        await client.query('COMMIT');
        const confirmed = { ...order, payment_status: 'pending', status: 'confirmed' };
        sendOrderNotifications(confirmed, items).catch((err) => console.error('[order:notify]', err.message));
        return res.json({
          success: true,
          order_number: order.order_number,
          pay_on_delivery: true,
          order: { ...confirmed, items },
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const order = await confirmOrderPayment(order_number);
    if (!order) return res.status(404).json({ error: 'Order not found or already paid' });

    const items = await loadOrderItems(order.id);
    res.json({ success: true, order_number: order.order_number, order: { ...order, items } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/upi-checkout/:orderNumber', async (req, res) => {
  try {
    const email = req.query.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email required' });

    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE order_number = $1',
      [req.params.orderNumber]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (order.email?.toLowerCase() !== email) {
      return res.status(403).json({ error: 'Email does not match this order' });
    }
    if (order.payment_method !== 'upi') {
      return res.status(400).json({ error: 'Not a UPI order' });
    }

    const settings = await getSettings();
    const { rows: items } = await pool.query(
      'SELECT product_name, quantity, price, image_url FROM order_items WHERE order_id = $1',
      [order.id]
    );

    const amount = Number(order.total);
    const vpa = (settings.upi_vpa || '').trim();
    const payeeName = 'Dyntra';
    const note = `Dyntra ${order.order_number}`;
    const upiParams = new URLSearchParams({
      pa: vpa || 'dyntra@upi',
      pn: payeeName,
      am: amount.toFixed(2),
      cu: 'INR',
      tn: note,
    });
    const upiUri = `upi://pay?${upiParams.toString()}`;

    res.json({
      order_number: order.order_number,
      total: amount,
      customer_name: order.customer_name,
      email: order.email,
      phone: order.phone,
      payment_status: order.payment_status,
      status: order.status,
      upi_vpa: vpa,
      upi_uri: upiUri,
      gpay_uri: `tez://upi/pay?${upiParams.toString()}`,
      phonepe_uri: `phonepe://pay?${upiParams.toString()}`,
      paytm_uri: `paytmmp://pay?${upiParams.toString()}`,
      items,
      configured: Boolean(vpa),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
