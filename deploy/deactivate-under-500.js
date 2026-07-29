#!/usr/bin/env node
/** Run on live: cd backend && node ../deploy/deactivate-under-500.js */
import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const client = await pool.connect();
try {
  await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
  const before = await client.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE price < 500 AND COALESCE(is_active, true) = true`
  );
  const { rowCount } = await client.query(
    `UPDATE products SET is_active = false WHERE price < 500 AND COALESCE(is_active, true) = true`
  );
  const active = await client.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE COALESCE(is_active, true) = true`
  );
  console.log('under-500 were active:', before.rows[0].n);
  console.log('deactivated now:', rowCount);
  console.log('active products left:', active.rows[0].n);
} finally {
  client.release();
  await pool.end();
}
