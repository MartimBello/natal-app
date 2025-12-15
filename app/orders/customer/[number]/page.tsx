'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrders, getProducts } from '@/lib/orders-client';
import { Order, Product } from '@/types/order';
import { exportOrdersByCustomer } from '@/lib/pdf-export';

const PICKUP_LOCATIONS = {
  amoreira: 'Amoreira',
  lisboa: 'Lisboa',
  casa: 'Casa',
  cascais: 'Cascais',
};

export default function CustomerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const clientNumber = params.number as string;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const [allOrders, productsData] = await Promise.all([getOrders(), getProducts()]);
        const customerOrders = allOrders.filter((order) => order.client_number === clientNumber);
        setOrders(customerOrders);
        setProducts(productsData);

        if (customerOrders.length === 0) {
          setError('Nenhuma encomenda encontrada para este cliente');
        }
      } catch (e) {
        setError('Falha ao carregar encomendas');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [clientNumber]);

  // Create a map of product names to unit types
  const productUnitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  products.forEach((p) => {
    productUnitTypeMap.set(p.name, p.unit_type);
  });

  const getUnitLabel = (productName: string, quantity: number): string => {
    const unitType = productUnitTypeMap.get(productName) || 'unit';
    let formattedQuantity: string;
    let unitLabel: string;

    if (unitType === 'kg' || unitType === 'liters') {
      formattedQuantity = quantity.toFixed(3).replace(/\.?0+$/, '');
      unitLabel = unitType === 'kg' ? 'kg' : 'L';
    } else {
      formattedQuantity = quantity.toString();
      unitLabel = 'un';
    }

    return `${formattedQuantity} ${unitLabel}`;
  };

  const handleExportPDF = () => {
    if (orders.length > 0) {
      exportOrdersByCustomer(orders, orders[0].client_name, orders[0].client_number, products);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">A carregar...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Voltar
            </button>
          </div>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const customerName = orders[0].client_name;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Encomendas - {customerName}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Número: {clientNumber}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Exportar PDF
          </button>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const total = order.products.reduce(
              (sum, product) => sum + product.quantity * product.item_price,
              0
            );
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      {order.client_number}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('pt-PT')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">Local de Recolha: </span>
                    <span className="text-black dark:text-white">
                      {PICKUP_LOCATIONS[order.pickup_location]}
                    </span>
                  </div>
                  {order.pickup_time && (
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Hora: </span>
                      <span className="text-black dark:text-white">{order.pickup_time}</span>
                    </div>
                  )}
                  {order.address && (
                    <div className="md:col-span-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Morada: </span>
                      <span className="text-black dark:text-white">{order.address}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="text-left py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Produto
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Quantidade
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Preço Unit.
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product, idx) => (
                        <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800">
                          <td className="py-2 text-sm text-black dark:text-white">
                            {product.product_name}
                          </td>
                          <td className="py-2 text-sm text-right text-zinc-600 dark:text-zinc-400">
                            {getUnitLabel(product.product_name, product.quantity)}
                          </td>
                          <td className="py-2 text-sm text-right text-zinc-600 dark:text-zinc-400">
                            €{product.item_price.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-right font-medium text-black dark:text-white">
                            €{(product.quantity * product.item_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-2 text-right text-sm font-semibold text-black dark:text-white">
                          Total:
                        </td>
                        <td className="py-2 text-right text-sm font-bold text-black dark:text-white">
                          €{total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

