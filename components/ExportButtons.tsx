'use client';

import { useState } from 'react';
import { Order, Product } from '@/types/order';
import { ProductTotal, filterOrdersByDate, OrderDate, getTotalQuantityPerProduct, getPeruProductsByCustomer } from '@/lib/analytics';
import { exportAllProductsAndQuantities, exportAllCustomerSheets, exportAllProductsWithCustomers, exportPeruProducts } from '@/lib/pdf-export';

interface ExportButtonsProps {
  orders: Order[];
  totalQuantityPerProduct: ProductTotal[];
  products?: Product[];
}

export default function ExportButtons({ orders, totalQuantityPerProduct, products }: ExportButtonsProps) {
  const [selectedDate, setSelectedDate] = useState<OrderDate>('all');
  const [exporting, setExporting] = useState(false);

  const handleExportAllProducts = () => {
    try {
      setExporting(true);
      const filteredOrders = filterOrdersByDate(orders, selectedDate);
      const filteredData = getTotalQuantityPerProduct(filteredOrders);
      const dateLabel = selectedDate === 'all' ? undefined : selectedDate;
      exportAllProductsAndQuantities(filteredData, dateLabel, undefined, products);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar produtos. Por favor, tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllCustomers = () => {
    try {
      setExporting(true);
      const filteredOrders = filterOrdersByDate(orders, selectedDate);
      const dateLabel = selectedDate === 'all' ? undefined : selectedDate;
      exportAllCustomerSheets(filteredOrders, dateLabel, undefined, products);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar fichas de cliente. Por favor, tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportProductsWithCustomers = () => {
    try {
      setExporting(true);
      const filteredOrders = filterOrdersByDate(orders, selectedDate);
      const dateLabel = selectedDate === 'all' ? undefined : selectedDate;
      exportAllProductsWithCustomers(filteredOrders, dateLabel, undefined, products);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar produtos e clientes. Por favor, tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPeruProducts = () => {
    try {
      setExporting(true);
      const filteredOrders = filterOrdersByDate(orders, selectedDate);
      const peruData = getPeruProductsByCustomer(filteredOrders);
      const dateLabel = selectedDate === 'all' ? undefined : selectedDate;
      exportPeruProducts(peruData, dateLabel);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar perus. Por favor, tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
        Exportações Rápidas
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          Filtrar por Data de Recolha:
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value as OrderDate)}
          className="w-full md:w-auto px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        >
          <option value="all">Todas as Datas</option>
          <option value="23">23 de Dezembro</option>
          <option value="24">24 de Dezembro</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleExportAllProducts}
          disabled={exporting}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'A exportar...' : 'Exportar Todos os Produtos e Quantidades'}
        </button>

        <button
          onClick={handleExportProductsWithCustomers}
          disabled={exporting}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'A exportar...' : 'Exportar Produtos e Clientes'}
        </button>

        <button
          onClick={handleExportAllCustomers}
          disabled={exporting}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'A exportar...' : 'Exportar Todas as Fichas de Cliente'}
        </button>

        <button
          onClick={handleExportPeruProducts}
          disabled={exporting}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'A exportar...' : 'Exportar Perus (Recheado e Sem Recheio)'}
        </button>
      </div>
    </div>
  );
}

