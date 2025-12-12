'use client';

import { createClient } from './supabase/client';
import { Order, OrderProduct } from '@/types/order';

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) {
    throw ordersError;
  }

  if (!ordersData) {
    return [];
  }

  // Fetch products for each order
  const ordersWithProducts = await Promise.all(
    ordersData.map(async (order) => {
      const { data: products, error: productsError } = await supabase
        .from('order_products')
        .select('*')
        .eq('order_id', order.id);

      if (productsError) {
        throw productsError;
      }

      return {
        id: order.id,
        client_name: order.client_name,
        client_number: order.client_number,
        phone_number: order.phone_number,
        pickup_location: order.pickup_location,
        pickup_date: order.pickup_date,
        pickup_time: order.pickup_time,
        address: order.address,
        created_at: order.created_at,
        products: (products || []).map((p) => ({
          id: p.id,
          product_name: p.product_name,
          quantity: p.quantity,
          item_price: p.item_price,
        })),
      } as Order;
    })
  );

  return ordersWithProducts;
}

export async function getProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (!orderData) {
    return null;
  }

  const { data: products, error: productsError } = await supabase
    .from('order_products')
    .select('*')
    .eq('order_id', orderData.id);

  if (productsError) {
    throw productsError;
  }

  return {
    id: orderData.id,
    client_name: orderData.client_name,
    client_number: orderData.client_number,
    phone_number: orderData.phone_number,
    pickup_location: orderData.pickup_location,
    pickup_date: orderData.pickup_date,
    pickup_time: orderData.pickup_time,
    address: orderData.address,
    created_at: orderData.created_at,
    products: (products || []).map((p) => ({
      id: p.id,
      product_name: p.product_name,
      quantity: p.quantity,
      item_price: p.item_price,
    })),
  };
}

export async function updateOrder(id: string, order: Omit<Order, 'id' | 'created_at' | 'client_number'>): Promise<Order> {
  const supabase = createClient();

  // Update order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .update({
      client_name: order.client_name,
      phone_number: order.phone_number || null,
      pickup_location: order.pickup_location,
      pickup_date: order.pickup_date || null,
      pickup_time: order.pickup_time || null,
      address: order.address || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  if (!orderData) {
    throw new Error('Falha ao atualizar encomenda');
  }

  // Delete existing products
  const { error: deleteError } = await supabase
    .from('order_products')
    .delete()
    .eq('order_id', id);

  if (deleteError) {
    throw deleteError;
  }

  // Insert new products
  const productsToInsert = order.products.map((product) => ({
    order_id: id,
    product_name: product.product_name,
    quantity: product.quantity,
    item_price: product.item_price,
  }));

  const { error: productsError } = await supabase
    .from('order_products')
    .insert(productsToInsert);

  if (productsError) {
    throw productsError;
  }

  // Fetch the complete order with products
  const { data: products, error: fetchProductsError } = await supabase
    .from('order_products')
    .select('*')
    .eq('order_id', id);

  if (fetchProductsError) {
    throw fetchProductsError;
  }

  return {
    id: orderData.id,
    client_name: orderData.client_name,
    client_number: orderData.client_number,
    phone_number: orderData.phone_number,
    pickup_location: orderData.pickup_location,
    pickup_date: orderData.pickup_date,
    pickup_time: orderData.pickup_time,
    address: orderData.address,
    created_at: orderData.created_at,
    products: (products || []).map((p) => ({
      id: p.id,
      product_name: p.product_name,
      quantity: p.quantity,
      item_price: p.item_price,
    })),
  };
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'client_number'>): Promise<Order> {
  const supabase = createClient();

  // Insert order (client_number will be generated automatically)
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_name: order.client_name,
      phone_number: order.phone_number || null,
      pickup_location: order.pickup_location,
      pickup_date: order.pickup_date || null,
      pickup_time: order.pickup_time || null,
      address: order.address || null,
    })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  if (!orderData) {
    throw new Error('Falha ao criar encomenda');
  }

  // Insert products
  const productsToInsert = order.products.map((product) => ({
    order_id: orderData.id,
    product_name: product.product_name,
    quantity: product.quantity,
    item_price: product.item_price,
  }));

  const { error: productsError } = await supabase
    .from('order_products')
    .insert(productsToInsert);

  if (productsError) {
    throw productsError;
  }

  // Fetch the complete order with products
  const { data: products, error: fetchProductsError } = await supabase
    .from('order_products')
    .select('*')
    .eq('order_id', orderData.id);

  if (fetchProductsError) {
    throw fetchProductsError;
  }

  return {
    id: orderData.id,
    client_name: orderData.client_name,
    client_number: orderData.client_number,
    phone_number: orderData.phone_number,
    pickup_location: orderData.pickup_location,
    pickup_date: orderData.pickup_date,
    pickup_time: orderData.pickup_time,
    address: orderData.address,
    created_at: orderData.created_at,
    products: (products || []).map((p) => ({
      id: p.id,
      product_name: p.product_name,
      quantity: p.quantity,
      item_price: p.item_price,
    })),
  };
}

export async function deleteOrder(id: string): Promise<void> {
  const supabase = createClient();

  // Delete order (order_products will be deleted automatically due to CASCADE)
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

