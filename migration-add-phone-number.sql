-- Migration: Add phone_number column to orders table
-- Run this SQL in your Supabase SQL Editor if you already have the database created

-- Add phone_number column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment to document the column
COMMENT ON COLUMN orders.phone_number IS 'Número de telefone do cliente (opcional)';
