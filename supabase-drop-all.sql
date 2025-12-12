-- Supabase Database Drop Script
-- ⚠️ WARNING: This will delete ALL data and schema objects!
-- Run this SQL in your Supabase SQL Editor to completely remove the database schema

-- Drop triggers first
DROP TRIGGER IF EXISTS generate_client_number_trigger ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS generate_client_number();

-- Drop tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS order_products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS client_number_seq CASCADE;

-- Verify deletion (optional - uncomment to check)
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('products', 'orders', 'order_products');

