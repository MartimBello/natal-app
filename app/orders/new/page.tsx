'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderProduct, PickupLocation, Product } from '@/types/order';
import { createOrder, getProducts } from '@/lib/orders-client';
import ProductAutocomplete from '@/components/ProductAutocomplete';

const PICKUP_LOCATIONS: { value: PickupLocation; label: string }[] = [
  { value: 'amoreira', label: 'Amoreira' },
  { value: 'lisboa', label: 'Lisboa' },
  { value: 'casa', label: 'Casa' },
  { value: 'cascais', label: 'Cascais' },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    pickup_location: 'amoreira' as PickupLocation,
    pickup_date: '',
    pickup_time: '',
    address: '',
  });

  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  // Store quantity input values as strings to allow partial decimal input (e.g., "1.")
  const [quantityInputs, setQuantityInputs] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        setError('Falha ao carregar produtos. Certifique-se de que o Supabase está configurado.');
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const addProduct = () => {
    if (products.length === 0) return;
    const newIndex = orderProducts.length;
    setOrderProducts([
      ...orderProducts,
      {
        product_name: '',
        quantity: 0,
        item_price: 0,
      },
    ]);
    // Initialize quantity input value as empty
    setQuantityInputs(new Map(quantityInputs.set(newIndex, '')));
  };

  const removeProduct = (index: number) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index));
    // Remove quantity input value
    const newMap = new Map(quantityInputs);
    newMap.delete(index);
    // Reindex remaining values
    const reindexed = new Map<number, string>();
    orderProducts.forEach((_, i) => {
      if (i !== index && quantityInputs.has(i)) {
        const newIndex = i > index ? i - 1 : i;
        reindexed.set(newIndex, quantityInputs.get(i)!);
      }
    });
    setQuantityInputs(reindexed);
  };

  const updateProduct = (index: number, field: keyof OrderProduct, value: string | number) => {
    const updated = [...orderProducts];

    // If updating quantity, allow empty string temporarily for better UX
    if (field === 'quantity') {
      updated[index] = { ...updated[index], [field]: value as number };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    // If product name changed, update the price and reset quantity based on unit type
    if (field === 'product_name') {
      const selectedProduct = products.find((p) => p.name === value);
      if (selectedProduct) {
        updated[index].item_price = selectedProduct.price;
        // Reset quantity to appropriate default based on unit type
        const defaultQty = (selectedProduct.unit_type === 'kg' || selectedProduct.unit_type === 'liters') ? 1.0 : 1;
        updated[index].quantity = defaultQty;
        // Update quantity input value
        const newMap = new Map(quantityInputs);
        newMap.set(index, defaultQty.toString());
        setQuantityInputs(newMap);
      }
    }

    setOrderProducts(updated);
  };

  const getProductUnitType = (productName: string): 'unit' | 'kg' | 'liters' => {
    const product = products.find((p) => p.name === productName);
    return product?.unit_type || 'unit';
  };

  const handleQuantityChange = (index: number, value: string) => {
    const unitType = getProductUnitType(orderProducts[index].product_name);

    // Store the raw input value as string to allow partial decimals like "1."
    const newMap = new Map(quantityInputs);
    newMap.set(index, value);
    setQuantityInputs(newMap);

    // Allow empty string temporarily
    if (value === '') {
      updateProduct(index, 'quantity', 0);
      return;
    }

    // For kg and liters products, allow decimals
    if (unitType === 'kg' || unitType === 'liters') {
      // Allow decimal pattern: digits, optional dot, optional more digits
      const decimalPattern = /^\d*\.?\d*$/;
      if (decimalPattern.test(value)) {
        // Only update the numeric value if it's a complete number (not ending with just a dot)
        if (!value.endsWith('.') || value === '.') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            updateProduct(index, 'quantity', numValue);
          }
        } else if (value.length > 1 && value.endsWith('.')) {
          // For "1." format, store the integer part
          const baseNum = value.replace(/\.$/, '');
          if (baseNum !== '') {
            const num = parseFloat(baseNum);
            if (!isNaN(num) && num >= 0) {
              updateProduct(index, 'quantity', num);
            }
          }
        }
      }
    } else {
      // For unit products, only allow integers
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        updateProduct(index, 'quantity', numValue);
      }
    }
  };

  const handleQuantityBlur = (index: number) => {
    const product = orderProducts[index];
    const unitType = getProductUnitType(product.product_name);
    const inputValue = quantityInputs.get(index) || '';

    // Convert the input value to a number, handling partial decimals
    let finalValue: number;
    if (inputValue === '' || inputValue === '.') {
      finalValue = 0;
    } else {
      finalValue = parseFloat(inputValue);
      if (isNaN(finalValue)) {
        finalValue = 0;
      }
    }

    // Ensure minimum value based on unit type
    if (unitType === 'kg' || unitType === 'liters') {
      if (finalValue < 0.001) {
        finalValue = 1.0;
      }
    } else {
      if (finalValue < 1) {
        finalValue = 1;
      }
    }

    // Update both the product quantity and the input value
    updateProduct(index, 'quantity', finalValue);
    const newMap = new Map(quantityInputs);
    newMap.set(index, finalValue.toString());
    setQuantityInputs(newMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (orderProducts.length === 0) {
      setError('Por favor, adicione pelo menos um produto à encomenda.');
      setLoading(false);
      return;
    }

    if (!formData.pickup_date) {
      setError('Por favor, selecione a data de recolha.');
      setLoading(false);
      return;
    }

    if (formData.pickup_location === 'casa' && !formData.address.trim()) {
      setError('Por favor, introduza a morada para entrega em casa.');
      setLoading(false);
      return;
    }

    try {
      await createOrder({
        ...formData,
        phone_number: formData.phone_number || undefined,
        pickup_date: formData.pickup_date || undefined,
        pickup_time: formData.pickup_time || undefined,
        address: formData.pickup_location === 'casa' ? formData.address : undefined,
        products: orderProducts,
      });
      router.push('/orders');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao criar encomenda');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">
          Nova Encomenda
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Telefone (opcional)
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="Ex: +351 912 345 678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Local de Recolha *
              </label>
              <select
                required
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value as PickupLocation })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              >
                {PICKUP_LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Data de Recolha *
              </label>
              <select
                required
                value={formData.pickup_date}
                onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              >
                <option value="">Selecione a data</option>
                <option value="2025-12-23">23 de Dezembro</option>
                <option value="2025-12-24">24 de Dezembro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Hora de Recolha (opcional)
              </label>
              <input
                type="time"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>

            {formData.pickup_location === 'casa' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Morada *
                </label>
                <textarea
                  required={formData.pickup_location === 'casa'}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="Introduza a morada completa"
                />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Produtos
            </h2>

            {loadingProducts ? (
              <p className="text-zinc-600 dark:text-zinc-400">A carregar produtos...</p>
            ) : products.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                Nenhum produto disponível. Por favor, adicione produtos à sua base de dados Supabase.
              </p>
            ) : orderProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Nenhum produto adicionado.
                </p>
                <button
                  type="button"
                  onClick={addProduct}
                  disabled={loadingProducts || products.length === 0}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Produto
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Produto *
                      </label>
                      <ProductAutocomplete
                        products={products}
                        value={product.product_name}
                        onChange={(productName) => updateProduct(index, 'product_name', productName)}
                        required
                        disabled={loadingProducts}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Quantidade {(() => {
                          const unitType = getProductUnitType(product.product_name);
                          if (unitType === 'kg') return '(kg) *';
                          if (unitType === 'liters') return '(litros) *';
                          return '(unidades) *';
                        })()}
                      </label>
                      <input
                        type="text"
                        required
                        inputMode={(getProductUnitType(product.product_name) === 'kg' || getProductUnitType(product.product_name) === 'liters') ? 'decimal' : 'numeric'}
                        value={quantityInputs.get(index) ?? (product.quantity === 0 || product.quantity === null || product.quantity === undefined ? '' : product.quantity.toString())}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        onBlur={() => handleQuantityBlur(index)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        pattern={(getProductUnitType(product.product_name) === 'kg' || getProductUnitType(product.product_name) === 'liters') ? '[0-9]*\\.?[0-9]*' : '[0-9]*'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Preço Unitário (€) *
                      </label>
                      <input
                        type="number"
                        readOnly
                        value={product.item_price || ''}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={addProduct}
                    disabled={loadingProducts || products.length === 0}
                    className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar Produto
                  </button>
                </div>

                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      €{orderProducts
                        .reduce((sum, p) => sum + p.quantity * p.item_price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A criar...' : 'Criar Encomenda'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

