-- Supabase Database Schema for Christmas Orders App
-- Run this SQL in your Supabase SQL Editor

-- Create products table (list of available products)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'unit' CHECK (unit_type IN ('unit', 'kg', 'liters')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sequence for client numbers
CREATE SEQUENCE IF NOT EXISTS client_number_seq START 1;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_number TEXT,
  phone_number TEXT,
  pickup_location TEXT NOT NULL CHECK (pickup_location IN ('amoreira', 'lisboa', 'casa')),
  pickup_date DATE,
  pickup_time TIME,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to generate client number
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_number IS NULL OR NEW.client_number = '' THEN
    NEW.client_number := 'ENC-' || LPAD(nextval('client_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate client number
DROP TRIGGER IF EXISTS generate_client_number_trigger ON orders;
CREATE TRIGGER generate_client_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_client_number();

-- Create order_products table (junction table for order products)
CREATE TABLE IF NOT EXISTS order_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL CHECK (quantity > 0),
  item_price DECIMAL(10, 2) NOT NULL CHECK (item_price >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Enable Row Level Security (RLS) - adjust policies based on your needs
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- For development, you might want to allow all operations
-- For production, you should restrict based on authentication

-- Products: Allow all operations for now (adjust as needed)
CREATE POLICY "Allow all operations on products" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Orders: Allow all operations for now (adjust as needed)
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

-- Order products: Allow all operations for now (adjust as needed)
CREATE POLICY "Allow all operations on order_products" ON order_products
  FOR ALL USING (true) WITH CHECK (true);

-- Insert products from the menu
INSERT INTO products (name, price, unit_type) VALUES
  -- SOPAS
  ('CREME DE ALHO FRANCÊS', 11.00, 'liters'),
  ('CREME DE ESPARGOS COM PRESUNTO FRITO', 18.00, 'liters'),
  -- BACALHAU
  ('ESPINAFRES GRATINADOS COM CAMARÃO', 50.00, 'kg'),
  ('BACALHAU ESPIRITUAL', 34.00, 'kg'),
  ('BACALHAU DAS OLGUINHAS', 36.00, 'kg'),
  ('BACALHAU COM BROA E COENTROS', 50.00, 'kg'),
  -- CARNE
  ('LOMBO DE VACA COM MOLHO DE VINHO DA MADEIRA', 83.00, 'kg'),
  ('ROSBIFE COM MOLHO DE VINHO DA MADEIRA', 71.00, 'kg'),
  ('PERU RECHEADO', 44.00, 'kg'),
  ('PERU SEM RECHEIO', 41.00, 'kg'),
  ('PERNA DE PERÚ COM RECHEIO À PARTE', 45.00, 'kg'),
  ('RECHEIO DO PERU', 30.00, 'kg'),
  -- ACOMPANHAMENTOS
  ('ESPINAFRES À LÁ CREME', 28.00, 'kg'),
  ('BATATINHAS A MURRO NO FORNO', 22.00, 'kg'),
  ('ARROZ ÁRABE', 34.00, 'kg'),
  ('ARROZ ESCURO', 15.00, 'kg'),
  ('CASTANHAS CARAMELIZADAS', 34.00, 'kg'),
  ('BATATA PALHA', 36.00, 'kg'),
  -- SOBREMESAS
  ('BOLO DE CHOCOLATE', 42.00, 'unit'),
  ('SUSPIRO COM CHOCOLATE', 42.00, 'unit'),
  ('SUSPIRO COM DOCE DE OVOS E AMENDOA', 42.00, 'unit'),
  ('TARTE DE LIMA', 39.00, 'unit'),
  ('BLOTTERTORTE', 42.00, 'unit'),
  ('MARQUISE DE CHOCOLATE GRANDE', 26.00, 'unit'),
  ('MARQUISE DE CHOCOLATE PEQUENA', 17.00, 'unit'),
  ('LÉRIAS', 2.00, 'unit'),
  ('PAPÃO DE ANJO', 42.00, 'unit'),
  ('PAPOS DE ANJO', 3.00, 'unit'),
  ('TARTE DE MAÇÃ', 42.00, 'unit')
ON CONFLICT (name) DO NOTHING;

