#!/bin/bash
# Paste this whole block in cPanel Terminal as user dyntra
set -e

echo "=== 1) Pull frontend repo ==="
cd /home/dyntra/dyntra
git pull origin main

echo "=== 2) Deploy static site (incl. categories + hero images) ==="
rm -rf /home/dyntra/public_html/assets
cp -r frontend/dist/* /home/dyntra/public_html/
mkdir -p /home/dyntra/public_html/categories /home/dyntra/public_html/hero
cp -r frontend/dist/categories/* /home/dyntra/public_html/categories/ 2>/dev/null || true
cp -r frontend/dist/hero/* /home/dyntra/public_html/hero/ 2>/dev/null || true

echo "=== 3) Pull backend app ==="
cd /home/dyntra/apps/dyntra-app
git pull origin main

echo "=== 4) Update category + hero image URLs in DB ==="
cd /home/dyntra/apps/dyntra-app/backend
node --input-type=module <<'NODE'
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows: cats } = await pool.query('SELECT id, slug FROM categories');
let n = 0;
for (const c of cats) {
  const url = `/categories/${c.slug}.png`;
  await pool.query('UPDATE categories SET image_url = $1 WHERE id = $2', [url, c.id]);
  n++;
}
console.log('categories updated:', n);

await pool.query(`UPDATE hero_slides SET image_url='/hero/dyntra-hero-luxury-silk.png' WHERE sort_order=1`);
await pool.query(`UPDATE hero_slides SET image_url='/hero/dyntra-hero-handpicked.png' WHERE sort_order=2`);
await pool.query(`UPDATE hero_slides SET image_url='/hero/dyntra-hero-regal.png' WHERE sort_order=3`);
console.log('hero slides updated');

const dup = await pool.query(
  `SELECT image_url, COUNT(*)::int n FROM categories GROUP BY image_url HAVING COUNT(*) > 1`
);
console.log('duplicate category urls:', dup.rows.length);
await pool.end();
NODE

echo "=== 5) Restart Node ==="
PID=$(pgrep -f 'apps/dyntra-app/backend/src/index.js' | head -1 || true)
if [ -n "$PID" ]; then
  kill "$PID" || true
  echo "Killed PID $PID — ab cPanel → Setup Node.js App → Start dabao"
else
  echo "Node PID nahi mila — cPanel → Setup Node.js App → Stop → Start"
fi

echo "=== DONE ==="
echo "Check: https://dyntra.in/  and  https://dyntra.in/api/health"
ls /home/dyntra/public_html/categories | wc -l
ls /home/dyntra/public_html/hero | wc -l
