/**
 * Run this ON the BrightPay-whitelisted server (82.180.141.135).
 *
 *   BRIGHTPAY_TOKEN='eyJ...' PORT=3099 PROXY_SECRET='long-random' node brightpay-proxy.js
 *
 * Dyntra (.env):
 *   BRIGHTPAY_PROXY_URL=http://82.180.141.135:3099
 *   BRIGHTPAY_PROXY_SECRET=long-random
 *   (token can stay only on the proxy, or also on Dyntra — proxy uses its own token)
 */
import http from 'http';

const PORT = Number(process.env.PORT || 3099);
const TOKEN_RAW = (process.env.BRIGHTPAY_TOKEN || '').trim();
const PROXY_SECRET = (process.env.PROXY_SECRET || '').trim();
const INTENT_API = 'https://brightpay.co.in/merchant/api/generate_intent';
const STATUS_API = 'https://brightpay.co.in/merchant/api/intent_status';

function encodeToken(raw) {
  if (!raw) return '';
  if (!raw.includes('.') && /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 40) return raw;
  return Buffer.from(raw, 'utf8').toString('base64');
}

async function forward(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Token: encodeToken(TOKEN_RAW),
    },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { flag: 'ERROR', flag_message: text.slice(0, 300) };
  }
  return { status: res.status, data };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

if (!TOKEN_RAW) {
  console.error('Set BRIGHTPAY_TOKEN env');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, ip_hint: 'BrightPay proxy' });
  }

  if (PROXY_SECRET) {
    const got = req.headers['x-proxy-secret'] || '';
    if (got !== PROXY_SECRET) {
      return send(res, 401, { flag: 'ERROR', flag_message: 'Unauthorized proxy' });
    }
  }

  try {
    if (req.method === 'POST' && req.url === '/generate_intent') {
      const body = await readBody(req);
      const out = await forward(INTENT_API, body);
      return send(res, out.status, out.data);
    }
    if (req.method === 'POST' && req.url === '/intent_status') {
      const body = await readBody(req);
      const out = await forward(STATUS_API, body);
      return send(res, out.status, out.data);
    }
    send(res, 404, { flag: 'ERROR', flag_message: 'Not found' });
  } catch (err) {
    send(res, 500, { flag: 'ERROR', flag_message: err.message || 'Proxy error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BrightPay proxy on :${PORT}`);
  console.log('Endpoints: POST /generate_intent  POST /intent_status  GET /health');
});
