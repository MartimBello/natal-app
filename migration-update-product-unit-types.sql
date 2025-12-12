-- Migration: Update product unit types according to categories
-- Run this SQL in your Supabase SQL Editor if you have an existing database

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_type TEXT NOT NULL DEFAULT 'unit'
CHECK (unit_type IN ('unit', 'kg', 'liters'));

-- First, update the CHECK constraint to include 'liters'
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_unit_type_check;

ALTER TABLE products
ADD CONSTRAINT products_unit_type_check
CHECK (unit_type IN ('unit', 'kg', 'liters'));

-- Update SOPAS to liters
UPDATE products SET unit_type = 'liters'
WHERE name IN (
  'CREME DE ALHO FRANCÊS',
  'CREME DE ESPARGOS COM PRESUNTO FRITO'
);

-- Update BACALHAU to kg
UPDATE products SET unit_type = 'kg'
WHERE name IN (
  'ESPINAFRES GRATINADOS COM CAMARÃO',
  'BACALHAU ESPIRITUAL',
  'BACALHAU DAS OLGUINHAS',
  'BACALHAU COM BROA E COENTROS'
);

-- CARNE is already in kg (no update needed for these)

-- But ensure RECHEIO DO PERU stays as unit
UPDATE products SET unit_type = 'unit'
WHERE name = 'RECHEIO DO PERU';

-- Update ACOMPANHAMENTOS to kg
UPDATE products SET unit_type = 'kg'
WHERE name IN (
  'ESPINAFRES À LÁ CREME',
  'BATATINHAS A MURRO NO FORNO',
  'ARROZ ÁRABE',
  'ARROZ ESCURO',
  'CASTANHAS CARAMELIZADAS',
  'BATATA PALHA'
);

-- SOBREMESAS are already in unit (no update needed)

