-- Run on LIVE Postgres (cPanel → phpPgAdmin / psql)
-- Deactivate all products priced under ₹500 (reversible: SET is_active = true ...)

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE products
SET is_active = false
WHERE price < 500;

-- Counts
SELECT
  COUNT(*) FILTER (WHERE price < 500) AS under_500_total,
  COUNT(*) FILTER (WHERE price < 500 AND is_active = false) AS under_500_deactivated,
  COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true) AS active_products
FROM products;
