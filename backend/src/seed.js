import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, initDb } from './db.js';
import { ALL_CATEGORIES } from './data/categories.js';
import { generateProducts, productImageUrl } from './data/generateProducts.js';

dotenv.config();

const products = generateProducts(260);

const testimonials = [
  { name: 'Dhayal Deena', initials: 'DD', rating: 5, review: 'I visited the store to purchase a silk saree, and the overall experience was truly wonderful. The attendant was friendly, patient, and professional.', verified: true, source: 'Google Review', review_date: '2 weeks ago' },
  { name: 'Rajat Rath', initials: 'RR', rating: 5, review: 'Had a great experience shopping here. The team was really polite and the store has a great collection.', verified: true, source: 'Google Review', review_date: 'a month ago' },
  { name: 'Rohit Mathur', initials: 'RM', rating: 5, review: 'Great shopping experience, reasonable pricing and good quality of handloom sarees.', verified: true, source: 'Google Review', review_date: 'a month ago' },
  { name: 'K Purushotham Reddy', initials: 'KP', rating: 5, review: 'Unique and beautiful colours, quality collections, satisfied with the service, very happy.', verified: true, source: 'Google Review', review_date: 'a month ago' },
  { name: 'Anku Saini', initials: 'AS', rating: 5, review: 'Had great experience shopping for my wife. The team went above and beyond to help me make the right decision.', verified: true, source: 'Google Review', review_date: '2 months ago' },
  { name: 'Swati Srivastava', initials: 'SS', rating: 5, review: 'Loved each saree we bought from Dyntra, and would love to come back and shop more. Their packing is an add-on to the overall experience.', verified: true, source: 'Google Review', review_date: '2 months ago' },
];

const heroSlides = [
  { title: 'Luxury silk sarees', subtitle: '260+ unique handwoven sarees from ₹100', image: 15181110, cta_text: 'Shop Now', cta_link: '/products', sort_order: 1 },
  { title: 'Handpicked Luxury', subtitle: 'Every saree is one of a kind', image: 36114637, cta_text: 'Shop Now', cta_link: '/products', sort_order: 2 },
  { title: 'Regal Threads', subtitle: 'Kanjivaram & pure silk up to ₹6,000', image: 15181112, cta_text: 'Shop Kanjivaram', cta_link: '/products?category=kanjivaram-sarees', sort_order: 3 },
];

async function seedAdminUser() {
  const email = 'admin@dyntra.in';
  const password = 'admin123';
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [email]);
    return;
  }
  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, true)',
    ['Dyntra Admin', email, password_hash]
  );
}

async function seed() {
  await initDb();

  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM product_categories');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM categories');
  await pool.query('DELETE FROM testimonials');
  await pool.query('DELETE FROM hero_slides');

  const categoryMap = {};
  for (const cat of ALL_CATEGORIES) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, image_url, group_type, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, slug`,
      [cat.name, cat.slug, cat.description, cat.image_url, cat.group_type, cat.sort_order]
    );
    categoryMap[cat.slug] = rows[0].id;
  }

  for (const p of products) {
    const comparePrice = p.price >= 1000 ? Math.round(p.price * 1.15) : null;
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, description, price, compare_price, image_url, category_id, occasion, price_range, stock, is_featured, is_new)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        p.name,
        p.slug,
        `Authentic handwoven ${p.name}. Pure quality silk saree with exquisite craftsmanship from master weavers.`,
        p.price,
        comparePrice,
        productImageUrl(p.image),
        categoryMap[p.primary],
        p.occasion,
        p.price_range,
        p.stock,
        p.is_featured || false,
        p.is_new || false,
      ]
    );

    const productId = rows[0].id;
    const uniqueTags = [...new Set([p.primary, ...p.tags])];
    for (const tag of uniqueTags) {
      if (categoryMap[tag]) {
        await pool.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [productId, categoryMap[tag]]
        );
      }
    }
  }

  for (const t of testimonials) {
    await pool.query(
      'INSERT INTO testimonials (name, initials, rating, review, verified, source, review_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [t.name, t.initials, t.rating, t.review, t.verified, t.source, t.review_date]
    );
  }

  for (const slide of heroSlides) {
    await pool.query(
      'INSERT INTO hero_slides (title, subtitle, image_url, cta_text, cta_link, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
      [slide.title, slide.subtitle, productImageUrl(slide.image, 1600), slide.cta_text, slide.cta_link, slide.sort_order]
    );
  }

  await seedAdminUser();

  console.log(`Database seeded! ${ALL_CATEGORIES.length} categories, ${products.length} products`);
  console.log('Admin login: admin@dyntra.in / admin123');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
