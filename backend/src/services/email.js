import nodemailer from 'nodemailer';
import { COMPANY } from '../config/company.js';

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const user = process.env.SMTP_USER || COMPANY.email;
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user, pass },
  });
  return transporter;
}

function emailjsConfigured() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
      process.env.EMAILJS_PUBLIC_KEY &&
      (process.env.EMAILJS_ORDER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID)
  );
}

/**
 * Send via EmailJS dashboard template.
 * Template "To Email" field should be: {{to_email}}
 */
export async function sendEmailJs({ templateId, to, params = {} }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const accessToken = process.env.EMAILJS_PRIVATE_KEY;
  const id = templateId || process.env.EMAILJS_ORDER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;

  if (!serviceId || !publicKey || !id) {
    return { sent: false, reason: 'EmailJS not configured' };
  }

  const body = {
    service_id: serviceId,
    template_id: id,
    user_id: publicKey,
    template_params: {
      ...params,
      to_email: to,
      from_name: COMPANY.brand,
      reply_to: COMPANY.email,
    },
  };
  if (accessToken) body.accessToken = accessToken;

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`EmailJS ${res.status}: ${text}`);
  }

  return { sent: true, provider: 'emailjs' };
}

export async function sendEmail({ to, subject, html, text }) {
  // Prefer EmailJS when configured (templates live in EmailJS dashboard)
  if (emailjsConfigured()) {
    try {
      return await sendEmailJs({
        to,
        params: {
          subject,
          message_html: html,
          message: text || '',
          to_name: '',
        },
      });
    } catch (err) {
      console.error('[emailjs:fallback-smtp]', err.message);
    }
  }

  const mailbox = process.env.SMTP_USER || COMPANY.email;
  const from = process.env.SMTP_FROM || `${COMPANY.brand} <${mailbox}>`;
  const transport = getTransporter();

  if (!transport) {
    console.log('[email:skipped — set EMAILJS_* or SMTP_PASS in .env]', { to, subject });
    return { sent: false, reason: 'Email not configured' };
  }

  await transport.sendMail({
    from,
    to,
    subject,
    html,
    text,
    replyTo: COMPANY.email,
  });
  return { sent: true, provider: 'smtp' };
}
