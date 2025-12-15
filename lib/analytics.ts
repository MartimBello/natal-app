import { Order } from '@/types/order';

export type OrderDate = '23' | '24' | 'all';

export interface ProductTotal {
  product_name: string;
  total_quantity: number;
}

export function filterOrdersByDate(orders: Order[], date: OrderDate): Order[] {
  if (date === 'all') {
    return orders;
  }

  const day = parseInt(date);
  return orders.filter((order) => {
    if (!order.pickup_date) return false;
    const orderDate = new Date(order.pickup_date);
    return orderDate.getDate() === day && orderDate.getMonth() === 11; // Month is 0-indexed, 11 = December
  });
}

export interface ProductCustomerQuantity {
  product_name: string;
  customer_name: string;
  client_number: string;
  quantity: number;
}

export function getTotalQuantityPerProduct(orders: Order[]): ProductTotal[] {
  const productMap = new Map<string, number>();

  orders.forEach((order) => {
    order.products.forEach((product) => {
      // Exclude PERU RECHEADO and PERU SEM RECHEIO from totals
      if (product.product_name === 'PERU RECHEADO' || product.product_name === 'PERU SEM RECHEIO') {
        return;
      }
      const current = productMap.get(product.product_name) || 0;
      productMap.set(product.product_name, current + product.quantity);
    });
  });

  return Array.from(productMap.entries())
    .map(([product_name, total_quantity]) => ({
      product_name,
      total_quantity,
    }))
    .sort((a, b) => a.product_name.localeCompare(b.product_name));
}

export function getQuantityPerProductPerCustomer(
  orders: Order[],
  productName: string
): ProductCustomerQuantity[] {
  const customerMap = new Map<string, { customer_name: string; client_number: string; quantity: number }>();

  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (product.product_name === productName) {
        const key = order.client_number;
        const existing = customerMap.get(key);
        if (existing) {
          existing.quantity += product.quantity;
        } else {
          customerMap.set(key, {
            customer_name: order.client_name,
            client_number: order.client_number,
            quantity: product.quantity,
          });
        }
      }
    });
  });

  return Array.from(customerMap.values())
    .map((item) => ({
      product_name: productName,
      customer_name: item.customer_name,
      client_number: item.client_number,
      quantity: item.quantity,
    }))
    .sort((a, b) => a.customer_name.localeCompare(b.customer_name));
}

export function getOrdersByCustomer(orders: Order[]): Map<string, Order[]> {
  const customerMap = new Map<string, Order[]>();

  orders.forEach((order) => {
    const key = order.client_number;
    const existing = customerMap.get(key) || [];
    customerMap.set(key, [...existing, order]);
  });

  return customerMap;
}

export function getPeruProductsByCustomer(orders: Order[]): ProductCustomerQuantity[] {
  const peruProducts: ProductCustomerQuantity[] = [];
  const PERU_PRODUCTS = ['PERU RECHEADO', 'PERU SEM RECHEIO'];

  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (PERU_PRODUCTS.includes(product.product_name)) {
        peruProducts.push({
          product_name: product.product_name,
          customer_name: order.client_name,
          client_number: order.client_number,
          quantity: product.quantity,
        });
      }
    });
  });

  // Sort by product name first, then by customer name
  return peruProducts.sort((a, b) => {
    if (a.product_name !== b.product_name) {
      return a.product_name.localeCompare(b.product_name);
    }
    return a.customer_name.localeCompare(b.customer_name);
  });
}

