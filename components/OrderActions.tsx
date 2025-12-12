'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteOrder } from '@/lib/orders-client';

interface OrderActionsProps {
  orderId: string;
  clientNumber: string;
  clientName: string;
}

export default function OrderActions({ orderId, clientNumber, clientName }: OrderActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setDeleting(true);
      await deleteOrder(orderId);
      router.refresh();
    } catch (error) {
      alert('Falha ao apagar encomenda. Por favor, tente novamente.');
      console.error(error);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? 'A apagar...' : 'Confirmar'}
        </button>
        <button
          onClick={handleCancel}
          disabled={deleting}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link
        href={`/orders/${orderId}/edit`}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        Editar
      </Link>
      <Link
        href={`/orders/customer/${clientNumber}`}
        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
      >
        Ver Todas
      </Link>
      <button
        onClick={handleDelete}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
      >
        Apagar
      </button>
    </div>
  );
}

