-- Migration: Add 'cascais' as a pickup location option
-- Run this SQL in your Supabase SQL Editor if you already have the database created

-- Drop the existing check constraint
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_pickup_location_check;

-- Add the new check constraint with 'cascais' included
ALTER TABLE orders
ADD CONSTRAINT orders_pickup_location_check
CHECK (pickup_location IN ('amoreira', 'lisboa', 'casa', 'cascais'));

