/**
 * BrightPay (brightpay.co.in)
 * Auth header: Token: <base64(rawJwt)>
 * generate_intent → intent_link (upi://...)
 * intent_status → PENDING | SUCCESS | FAILED
 */

const DEFAULT_INTENT_API = 'https://brightpay.co.in/merchant/api/generate_intent';
const DEFAULT_STATUS_API = 'https://brightpay.co.in/merchant/api/intent_status';

export function encodeBrightPayToken(rawToken) {
  const raw = String(rawToken || '').trim();
  if (!raw) return '';
  // Already base64 (no JWT dots)
  if (!raw.includes('.') && /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 40) {
    return raw;
  }
  return Buffer.from(raw, 'utf8').toString('base64');
}

function authHeaders(rawToken) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Token: encodeBrightPayToken(rawToken),
  };
}

function resolveToken(gatewayToken) {
  const raw = String(gatewayToken || process.env.BRIGHTPAY_TOKEN || '').trim();
  if (!raw) {
    throw new Error('BrightPay token missing — set API Key in Payment Gateway or BRIGHTPAY_TOKEN');
  }
  return raw;
}

async function postBrightPay(url, rawToken, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(rawToken),
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`BrightPay non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  return { res, data, text };
}

/**
 * Create UPI payment intent
 */
export async function createBrightPayIntent(opts) {
  const rawToken = resolveToken(opts.rawToken);
  const apiUrl = (opts.apiUrl || process.env.BRIGHTPAY_API_URL || DEFAULT_INTENT_API).trim();

  const mobile = String(opts.mobile || '').replace(/\D/g, '');
  if (mobile.length < 10) {
    throw new Error('Valid 10-digit mobile is required for BrightPay');
  }

  const body = {
    payer_order_id: String(opts.orderNumber),
    payer_name: String(opts.name || 'Guest User').slice(0, 120),
    payer_email: String(opts.email || 'guest@dyntra.in').slice(0, 120),
    payer_mobile: mobile.slice(-10),
    amount: Number(opts.amount),
  };

  const { res, data } = await postBrightPay(apiUrl, rawToken, body);
  const flag = String(data.flag || '').toUpperCase();

  if (!res.ok || flag === 'ERROR') {
    throw new Error(data.flag_message || data.message || data.error || `BrightPay error (${res.status})`);
  }

  const intentLink = String(data.intent_link || data.intent_uri || '').trim();
  if (!intentLink) {
    throw new Error(`BrightPay OK but no intent_link: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return {
    intent_link: intentLink,
    payer_order_id: String(data.payer_order_id || opts.orderNumber),
    flag: flag || 'OK',
    flag_message: data.flag_message || '',
    raw: data,
  };
}

/**
 * Check pay-in status for an order
 */
export async function fetchBrightPayIntentStatus(opts) {
  const rawToken = resolveToken(opts.rawToken);
  const apiUrl = (
    opts.statusApiUrl ||
    process.env.BRIGHTPAY_STATUS_URL ||
    DEFAULT_STATUS_API
  ).trim();

  const { res, data } = await postBrightPay(apiUrl, rawToken, {
    payer_order_id: String(opts.orderNumber),
  });

  const flag = String(data.flag || '').toUpperCase();
  if (!res.ok || flag === 'ERROR') {
    throw new Error(data.flag_message || data.message || `BrightPay status error (${res.status})`);
  }

  return {
    flag: flag || 'OK',
    flag_message: data.flag_message || '',
    intent_status: String(data.intent_status || 'PENDING').toUpperCase(),
    payer_order_id: String(data.payer_order_id || opts.orderNumber),
    amount: data.amount,
    utr: data.utr || '',
    raw: data,
  };
}

export function isBrightPayGateway(gateway) {
  if (!gateway) return false;
  const provider = String(gateway.provider || '').toLowerCase();
  if (provider === 'brightpay') return true;
  const api = String(gateway.api_url || '').toLowerCase();
  return api.includes('brightpay.co.in') || api.includes('generate_intent');
}

export async function getActiveBrightPayGateway(pool) {
  const { rows: settingsRows } = await pool.query('SELECT * FROM payment_settings WHERE id = 1');
  const settings = settingsRows[0];
  if (!settings?.active_gateway_id) return null;
  const { rows } = await pool.query(
    'SELECT * FROM payment_gateways WHERE id = $1 AND is_enabled = true',
    [settings.active_gateway_id]
  );
  if (!rows.length || !isBrightPayGateway(rows[0])) return null;
  return rows[0];
}
