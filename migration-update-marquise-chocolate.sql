-- Migration: Update Marquise de Chocolate product and add new variant
-- Run this SQL in your Supabase SQL Editor

-- Update existing "MARQUISE DE CHOCOLATE" to "MARQUISE DE CHOCOLATE GRANDE" with price 26
UPDATE products
SET name = 'MARQUISE DE CHOCOLATE GRANDE',
    price = 26.00
WHERE name = 'MARQUISE DE CHOCOLATE';

-- Insert new "MARQUISE DE CHOCOLATE PEQUENA" with price 17
-- unit_type is 'unit' for desserts
INSERT INTO products (name, price, unit_type)
VALUES ('MARQUISE DE CHOCOLATE PEQUENA', 17.00, 'unit')
ON CONFLICT (name) DO NOTHING;

