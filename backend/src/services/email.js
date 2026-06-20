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

export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || `${COMPANY.brand} <${process.env.SMTP_USER || COMPANY.email}>`;
  const transport = getTransporter();

  if (!transport) {
    console.log('[email:skipped — set SMTP_PASS in .env]', { to, subject });
    return { sent: false, reason: 'SMTP not configured' };
  }

  await transport.sendMail({ from, to, subject, html, text });
  return { sent: true };
}
