import { sendEmail } from './email.js';
import { COMPANY, FRONTEND_URL } from '../config/company.js';

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  upi: 'UPI / PhonePe / GPay',
  online: 'Online Payment',
};

function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function orderItemsText(items = []) {
  return items
    .map((item) => `• ${item.product_name} × ${item.quantity} — ${formatInr(Number(item.price) * item.quantity)}`)
    .join('\n');
}

function orderItemsHtml(items = []) {
  return items
    .map(
      (item) =>
        `<li>${item.product_name} × ${item.quantity} — ${formatInr(Number(item.price) * item.quantity)}</li>`
    )
    .join('');
}

async function sendAdminWhatsApp(text) {
  const apiKey = process.env.WHATSAPP_BOT_APIKEY;
  if (!apiKey) return { sent: false, reason: 'WhatsApp bot not configured' };

  const phone = process.env.WHATSAPP_ADMIN_PHONE || COMPANY.whatsappPhone;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WhatsApp API ${res.status}`);
    return { sent: true };
  } catch (err) {
    console.error('[whatsapp:error]', err.message);
    return { sent: false, reason: err.message };
  }
}

export async function sendOrderNotifications(order, items = []) {
  const paymentLabel = PAYMENT_LABELS[order.payment_method] || order.payment_method;
  const orderUrl = `${FRONTEND_URL}/order-success/${order.order_number}`;

  const summaryText = [
    `Order ${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Total: ${formatInr(order.total)}`,
    `Payment: ${paymentLabel}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    '',
    orderItemsText(items),
  ].join('\n');

  const customerHtml = `
    <p>Hi ${order.customer_name},</p>
    <p>Thank you for shopping with <strong>${COMPANY.brand}</strong>.</p>
    <p><strong>Order:</strong> ${order.order_number}<br/>
    <strong>Total:</strong> ${formatInr(order.total)}<br/>
    <strong>Payment:</strong> ${paymentLabel}</p>
    <ul>${orderItemsHtml(items)}</ul>
    <p>Delivery address: ${order.address_line1}, ${order.city}, ${order.state} – ${order.pincode}</p>
    <p>Expected delivery in 5–7 business days.</p>
    <p>Questions? Email <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> or WhatsApp us: <a href="${COMPANY.whatsappUrl}">${COMPANY.phone}</a></p>
    <p><a href="${orderUrl}">View order</a></p>
    <p style="color:#888;font-size:12px">${COMPANY.legalName} · CIN ${COMPANY.cin}</p>
  `;

  const adminHtml = `
    <p><strong>New order received</strong></p>
    <p><strong>Order:</strong> ${order.order_number}<br/>
    <strong>Customer:</strong> ${order.customer_name}<br/>
    <strong>Phone:</strong> ${order.phone}<br/>
    <strong>Email:</strong> ${order.email}<br/>
    <strong>Total:</strong> ${formatInr(order.total)}<br/>
    <strong>Payment:</strong> ${paymentLabel}</p>
    <ul>${orderItemsHtml(items)}</ul>
    <p>${order.address_line1}, ${order.city}, ${order.state} – ${order.pincode}</p>
  `;

  const results = await Promise.allSettled([
    sendEmail({
      to: order.email,
      subject: `${COMPANY.brand} order confirmed — ${order.order_number}`,
      html: customerHtml,
      text: summaryText,
    }),
    sendEmail({
      to: COMPANY.email,
      subject: `New ${COMPANY.brand} order — ${order.order_number}`,
      html: adminHtml,
      text: summaryText,
    }),
    sendAdminWhatsApp(`🛍️ New ${COMPANY.brand} order\n${summaryText}`),
  ]);

  return results;
}

export async function sendContactNotification(message) {
  const adminHtml = `
    <p><strong>New contact form message</strong></p>
    <p><strong>Name:</strong> ${message.name}<br/>
    <strong>Email:</strong> ${message.email}<br/>
    ${message.phone ? `<strong>Phone:</strong> ${message.phone}<br/>` : ''}
    ${message.subject ? `<strong>Subject:</strong> ${message.subject}<br/>` : ''}</p>
    <p>${message.message.replace(/\n/g, '<br/>')}</p>
  `;

  const text = [
    `Contact form — ${message.name}`,
    `Email: ${message.email}`,
    message.phone ? `Phone: ${message.phone}` : '',
    message.subject ? `Subject: ${message.subject}` : '',
    '',
    message.message,
  ]
    .filter(Boolean)
    .join('\n');

  await Promise.allSettled([
    sendEmail({
      to: COMPANY.email,
      subject: `${COMPANY.brand} contact — ${message.name}`,
      html: adminHtml,
      text,
    }),
    sendAdminWhatsApp(`📩 ${COMPANY.brand} contact\n${text}`),
  ]);
}

export async function sendPasswordResetEmail(user, resetUrl) {
  const html = `
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your ${COMPANY.brand} password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `${COMPANY.brand} password reset`,
    html,
    text: `Reset your password: ${resetUrl}`,
  });
}
