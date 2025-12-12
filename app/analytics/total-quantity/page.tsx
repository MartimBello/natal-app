'use client';

import { useState, useEffect } from 'react';
import { getOrders, getProducts } from '@/lib/orders-client';
import { getTotalQuantityPerProduct, ProductTotal, filterOrdersByDate, OrderDate } from '@/lib/analytics';
import { exportTotalQuantityPerProduct } from '@/lib/pdf-export';
import { Product } from '@/types/order';

export default function TotalQuantityPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductTotal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<OrderDate>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orders, productsData] = await Promise.all([getOrders(), getProducts()]);
        setAllOrders(orders);
        setProducts(productsData);
      } catch (e) {
        setError('Falha ao carregar dados');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  useEffect(() => {
    const filteredOrders = filterOrdersByDate(allOrders, selectedDate);
    const totals = getTotalQuantityPerProduct(filteredOrders);
    setData(totals);
  }, [selectedDate, allOrders]);

  const handleExportPDF = () => {
    const dateLabel = selectedDate === 'all' ? undefined : selectedDate;
    exportTotalQuantityPerProduct(data, dateLabel, undefined, products);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Quantidade Total por Produto
            </h1>
            {selectedDate !== 'all' && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {selectedDate} de Dezembro
              </p>
            )}
          </div>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Exportar PDF
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Filtrar por Data
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value as OrderDate)}
            className="w-full md:w-1/3 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="all">Todos os dias</option>
            <option value="23">23 de Dezembro</option>
            <option value="24">24 de Dezembro</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Quantidade Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400">
                      Nenhum dado disponível
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.product_name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {getUnitLabel(item.product_name, item.total_quantity)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

