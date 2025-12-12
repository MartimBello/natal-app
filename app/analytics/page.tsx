import { getOrders, getProducts } from '@/lib/orders';
import { getTotalQuantityPerProduct } from '@/lib/analytics';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';
import { Order, Product } from '@/types/order';

export default async function AnalyticsPage() {
  let orders: Order[] = [];
  let products: Product[] = [];
  let error: string | null = null;

  try {
    [orders, products] = await Promise.all([getOrders(), getProducts()]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Falha ao carregar dados';
  }

  const totalQuantityPerProduct = getTotalQuantityPerProduct(orders);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">
          Visualizações e Estatísticas
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">Erro: {error}</p>
          </div>
        )}

        <ExportButtons orders={orders} totalQuantityPerProduct={totalQuantityPerProduct} products={products} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/analytics/total-quantity"
            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Quantidade Total por Produto
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Visualize a quantidade total encomendada de cada produto
            </p>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {totalQuantityPerProduct.length} produtos
            </div>
          </Link>

          <Link
            href="/analytics/product-customers"
            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Quantidade por Produto e Cliente
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Visualize a quantidade encomendada por produto e por cliente
            </p>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {products.length} produtos disponíveis
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Resumo Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {orders.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Total de Encomendas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {products.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Produtos Disponíveis
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {totalQuantityPerProduct.reduce((sum, p) => sum + p.total_quantity, 0)}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Total de Itens Encomendados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

