export type PickupLocation = 'amoreira' | 'lisboa' | 'casa';

export interface OrderProduct {
  id?: string;
  product_name: string;
  quantity: number;
  item_price: number;
}

export interface Order {
  id?: string;
  client_name: string;
  client_number: string;
  phone_number?: string | null;
  pickup_location: PickupLocation;
  pickup_date?: string | null;
  pickup_time?: string | null;
  address?: string | null;
  created_at?: string;
  products: OrderProduct[];
}

export type UnitType = 'unit' | 'kg' | 'liters';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit_type: UnitType;
}

