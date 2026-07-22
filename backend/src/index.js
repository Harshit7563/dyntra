import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import testimonialsRouter from './routes/testimonials.js';
import newsletterRouter from './routes/newsletter.js';
import heroRouter from './routes/hero.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin/index.js';
import paymentRouter from './routes/payment.js';
import contactRouter from './routes/contact.js';
import aiRouter from './routes/ai.js';
import festivalRouter from './routes/festival.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, '../uploads');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.get('/', (_req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Dyntra API</title>
    <style>body{font-family:system-ui;max-width:520px;margin:60px auto;padding:0 24px;color:#333}
    h1{color:#7B1E3A;font-weight:600}code{background:#f5f5f5;padding:2px 6px;border-radius:4px}
    a{color:#7B1E3A}</style></head>
    <body>
      <h1>Dyntra API</h1>
      <p>This is the <strong>backend API</strong>, not the website.</p>
      <p>Open the store: <a href="http://localhost:3000">http://localhost:3000</a></p>
      <p>Admin panel: <a href="http://localhost:3000/admin">http://localhost:3000/admin</a></p>
      <p>API health: <a href="/api/health">/api/health</a></p>
    </body></html>
  `);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Dyntra API' });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/hero', heroRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/ai', aiRouter);
app.use('/api/festival', festivalRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', ordersRouter);

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Dyntra API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
