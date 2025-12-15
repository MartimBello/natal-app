import { getOrders, getProducts } from '@/lib/orders';
import Link from 'next/link';
import { Order, Product } from '@/types/order';
import OrderActions from '@/components/OrderActions';

const PICKUP_LOCATIONS = {
  amoreira: 'Amoreira',
  lisboa: 'Lisboa',
  casa: 'Casa',
  cascais: 'Cascais',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    location?: string;
    pickupDate?: string;
  }>;
}) {
  let orders: Order[] = [];
  let products: Product[] = [];
  let error = null;

  try {
    [orders, products] = await Promise.all([getOrders(), getProducts()]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Falha ao carregar encomendas';
    orders = [];
  }

  // Create a map of product names to unit types
  const productUnitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  products.forEach((p) => {
    productUnitTypeMap.set(p.name, p.unit_type);
  });

  const resolvedParams = (await searchParams) || {};
  const query = (resolvedParams.q || '').toLowerCase().trim();
  const selectedLocation = resolvedParams.location || '';
  const selectedPickupDate = resolvedParams.pickupDate || '';

  const filteredOrders = orders.filter((order) => {
    const matchesQuery =
      !query ||
      order.client_name.toLowerCase().includes(query) ||
      order.client_number.toLowerCase().includes(query);

    const matchesLocation =
      !selectedLocation || order.pickup_location === selectedLocation;

    const matchesPickupDate =
      !selectedPickupDate || order.pickup_date === selectedPickupDate;

    return matchesQuery && matchesLocation && matchesPickupDate;
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Encomendas
          </h1>
          <Link
            href="/orders/new"
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Nova Encomenda
          </Link>
        </div>

        <form className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cliente ou Número
            </label>
            <input
              type="text"
              name="q"
              defaultValue={resolvedParams.q || ''}
              placeholder="Pesquisar..."
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Local de Recolha
            </label>
            <select
              name="location"
              defaultValue={resolvedParams.location || ''}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:outline-none"
            >
              <option value="">Todos</option>
              {Object.entries(PICKUP_LOCATIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Data de Recolha
            </label>
            <input
              type="date"
              name="pickupDate"
              defaultValue={resolvedParams.pickupDate || ''}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Aplicar
            </button>
            <Link
              href="/orders"
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center"
            >
              Limpar
            </Link>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">Erro: {error}</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Certifique-se de que as credenciais do Supabase estão configuradas no .env.local
            </p>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Nenhuma encomenda encontrada. Crie a sua primeira encomenda para começar.
            </p>
            <Link
              href="/orders/new"
              className="inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Criar Encomenda
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Data de Recolha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Local de Recolha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Hora de Recolha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        Nenhuma encomenda corresponde aos filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const total = order.products.reduce(
                        (sum, product) => sum + product.quantity * product.item_price,
                        0
                      );
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {order.client_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                            {order.client_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                            {order.pickup_date
                              ? new Date(order.pickup_date).toLocaleDateString('pt-PT')
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <div>
                              {PICKUP_LOCATIONS[order.pickup_location]}
                              {order.pickup_location === 'casa' && order.address && (
                                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                  {order.address}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                            {order.pickup_time || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <div className="space-y-1">
                              {order.products.map((product, idx) => (
                                <div key={idx}>
                                  {product.product_name} × {getUnitLabel(product.product_name, product.quantity)} @ €{product.item_price.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            €{total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString('pt-PT')
                              : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <OrderActions
                              orderId={order.id!}
                              clientNumber={order.client_number}
                              clientName={order.client_name}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

