import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      group_type VARCHAR(50) DEFAULT 'fabric',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      compare_price DECIMAL(10, 2),
      image_url TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      occasion VARCHAR(100),
      price_range VARCHAR(50),
      stock INTEGER DEFAULT 1,
      is_featured BOOLEAN DEFAULT false,
      is_new BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      initials VARCHAR(5) NOT NULL,
      rating INTEGER DEFAULT 5,
      review TEXT NOT NULL,
      verified BOOLEAN DEFAULT true,
      source VARCHAR(50) DEFAULT 'Google Review',
      review_date VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      image_url TEXT,
      cta_text VARCHAR(50) DEFAULT 'Shop Now',
      cta_link VARCHAR(255) DEFAULT '/products',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      shipping DECIMAL(10, 2) NOT NULL,
      discount DECIMAL(10, 2) DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL,
      coupon_code VARCHAR(50),
      status VARCHAR(50) DEFAULT 'confirmed',
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      product_slug VARCHAR(255),
      price DECIMAL(10, 2) NOT NULL,
      quantity INTEGER NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, category_id)
    );

    ALTER TABLE categories ADD COLUMN IF NOT EXISTS group_type VARCHAR(50) DEFAULT 'fabric';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price DECIMAL(10, 2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'paid';

    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      cod_enabled BOOLEAN DEFAULT true,
      upi_enabled BOOLEAN DEFAULT true,
      upi_vpa VARCHAR(100),
      active_gateway_id INTEGER,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_gateways (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      provider VARCHAR(50) DEFAULT 'custom',
      payment_url TEXT,
      api_url TEXT,
      ip_whitelist TEXT,
      merchant_id VARCHAR(255),
      api_key VARCHAR(255),
      secret_key VARCHAR(255),
      callback_url TEXT,
      webhook_url TEXT,
      is_enabled BOOLEAN DEFAULT true,
      test_mode BOOLEAN DEFAULT true,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO payment_settings (id, cod_enabled, upi_enabled)
    VALUES (1, true, true) ON CONFLICT (id) DO NOTHING;

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
