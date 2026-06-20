const PLACEHOLDERS = ['amount', 'order_number', 'email', 'phone', 'name', 'currency', 'merchant_id', 'api_key', 'callback_url'];

export function buildPaymentUrl(template, data) {
  if (!template?.trim()) return null;

  let url = template.trim();
  for (const key of PLACEHOLDERS) {
    const value = data[key] ?? '';
    url = url.replaceAll(`{${key}}`, encodeURIComponent(String(value)));
  }
  return url;
}

export function maskSecret(value) {
  if (!value) return '';
  if (value.length <= 4) return '****';
  return `${'*'.repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`;
}

export function sanitizeGateway(row, { includeSecrets = false } = {}) {
  if (!row) return null;
  const gateway = { ...row };
  if (!includeSecrets) {
    gateway.api_key = maskSecret(gateway.api_key);
    gateway.secret_key = maskSecret(gateway.secret_key);
  }
  return gateway;
}
