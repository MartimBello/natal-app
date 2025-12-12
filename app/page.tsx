import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Gestão de Encomendas de Natal
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Gerir e acompanhar todas as suas encomendas de Natal num só lugar
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Ver Encomendas
            </Link>
            <Link
              href="/orders/new"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Criar Nova Encomenda
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Ver Encomendas
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Navegue por todas as encomendas registadas com informações do cliente, detalhes de recolha e listas de produtos.
            </p>
            <Link
              href="/orders"
              className="text-black dark:text-white font-medium hover:underline"
            >
              Ir para Encomendas →
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Criar Encomenda
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Registe uma nova encomenda com detalhes do cliente, local de recolha e seleção de produtos.
            </p>
            <Link
              href="/orders/new"
              className="text-black dark:text-white font-medium hover:underline"
            >
              Criar Encomenda →
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Visualizações
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Visualize estatísticas e exporte relatórios em PDF sobre produtos e encomendas.
            </p>
            <Link
              href="/analytics"
              className="text-black dark:text-white font-medium hover:underline"
          >
              Ver Visualizações →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
