-- Migration: Add pickup_date column to orders table
-- Run this SQL in your Supabase SQL Editor if you already have the database created

-- Add pickup_date column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN orders.pickup_date IS 'Data de recolha da encomenda (23 ou 24 de dezembro)';

