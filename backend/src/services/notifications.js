import { sendEmail, sendEmailJs } from './email.js';
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

  const address = `${order.address_line1}, ${order.city}, ${order.state} – ${order.pincode}`;
  // Prices are tax-inclusive (GST 18% included in total)
  const totalNum = Math.round(Number(order.total) || 0);
  const taxableNum = Math.round(totalNum / 1.18);
  const gstNum = Math.max(0, totalNum - taxableNum);
  const totalPlain = String(totalNum);
  const taxablePlain = String(taxableNum);
  const gstPlain = String(gstNum);
  const orderParams = {
    to_name: String(order.customer_name || ''),
    customer_name: String(order.customer_name || ''),
    order_id: String(order.order_number || ''),
    order_number: String(order.order_number || ''),
    // Amounts (tax-inclusive total; GST broken out for email)
    total: totalPlain,
    amount: totalPlain,
    total_amount: totalPlain,
    order_total: totalPlain,
    cost_total: totalPlain,
    subtotal: taxablePlain,
    taxable_amount: taxablePlain,
    taxes: gstPlain,
    tax: gstPlain,
    gst: gstPlain,
    gst_rate: '18%',
    tax_note: 'Includes 18% GST',
    discount: String(Math.round(Number(order.discount) || 0)),
    cost: {
      total: totalPlain,
      subtotal: taxablePlain,
      tax: gstPlain,
      gst: gstPlain,
    },
    payment_method: String(paymentLabel || ''),
    payment: 'COD (Cash on delivery)',
    phone: String(order.phone || ''),
    email: String(order.email || ''),
    order_items: orderItemsText(items),
    order_items_html: orderItemsHtml(items),
    address: String(address || ''),
    order_url: String(orderUrl || ''),
    brand: COMPANY.brand,
    company_email: COMPANY.email,
    company_phone: COMPANY.phone,
    subject: `${COMPANY.brand} order confirmed — ${order.order_number}`,
  };
  console.log('[order:emailjs:params]', {
    order_id: orderParams.order_id,
    total: orderParams.total,
    gst: orderParams.gst,
    email: orderParams.email,
  });

  const customerTemplate = process.env.EMAILJS_ORDER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const adminTemplate = process.env.EMAILJS_ADMIN_ORDER_TEMPLATE_ID || customerTemplate;

  const sendCustomerMail = customerTemplate
    ? () =>
        sendEmailJs({
          templateId: customerTemplate,
          to: order.email,
          params: orderParams,
        })
    : () =>
        sendEmail({
          to: order.email,
          subject: orderParams.subject,
          html: customerHtml,
          text: summaryText,
        });

  const sendAdminMail = adminTemplate
    ? () =>
        sendEmailJs({
          templateId: adminTemplate,
          to: COMPANY.email,
          params: {
            ...orderParams,
            subject: `New ${COMPANY.brand} order — ${order.order_number}`,
            to_name: 'Admin',
          },
        })
    : () =>
        sendEmail({
          to: COMPANY.email,
          subject: `New ${COMPANY.brand} order — ${order.order_number}`,
          html: adminHtml,
          text: summaryText,
        });

  const results = await Promise.allSettled([
    sendCustomerMail(),
    sendAdminMail(),
    sendAdminWhatsApp(`🛍️ New ${COMPANY.brand} order\n${summaryText}`),
  ]);

  const customerMail = results[0];
  if (customerMail.status === 'fulfilled') {
    console.log('[order:email:customer]', order.email, customerMail.value);
  } else {
    console.error('[order:email:customer:fail]', order.email, customerMail.reason?.message || customerMail.reason);
  }

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

export async function sendWelcomeEmail({ name, email, password }) {
  const subject = 'Welcome to Dyntra.in – Your Account is Ready!';
  const params = {
    // Match EmailJS template vars (spaces + snake/camel aliases)
    'Customer Name': String(name || ''),
    customer_name: String(name || ''),
    customerName: String(name || ''),
    name: String(name || ''),
    Email: String(email || ''),
    email: String(email || ''),
    Password: String(password || ''),
    password: String(password || ''),
    to_name: String(name || ''),
    subject,
    brand: COMPANY.brand,
    website: FRONTEND_URL || 'https://dyntra.in',
  };

  const welcomeTemplate = process.env.EMAILJS_WELCOME_TEMPLATE_ID;
  if (welcomeTemplate) {
    return sendEmailJs({
      templateId: welcomeTemplate,
      to: email,
      params,
    });
  }

  const html = `
    <p>Hello ${name},</p>
    <p>Welcome to <strong>Dyntra.in</strong>!</p>
    <p>Your account has been created.</p>
    <p><strong>Website:</strong> https://dyntra.in<br/>
    <strong>Email:</strong> ${email}</p>
    <p><a href="https://dyntra.in/login">Login Now</a></p>
    <p>Support: support@dyntra.in</p>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Welcome to Dyntra.in! Login at https://dyntra.in with ${email}`,
  });
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
