import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Product } from '@/types/order';
import { ProductTotal, ProductCustomerQuantity } from './analytics';

export function exportTotalQuantityPerProduct(
  data: ProductTotal[],
  date?: string,
  filename?: string,
  products?: Product[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = 'Quantidade Total por Produto';
  if (date && date !== 'all') {
    title += ` - ${date} de Dezembro`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  const safeFilename = filename || (date && date !== 'all'
    ? `quantidade-total-por-produto-${date}-dezembro.pdf`
    : 'quantidade-total-por-produto.pdf');

  // Create unit type map
  const unitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  if (products) {
    products.forEach((p) => unitTypeMap.set(p.name, p.unit_type));
  }

  const formatQuantity = (productName: string, quantity: number): string => {
    const unitType = unitTypeMap.get(productName) || 'unit';
    if (unitType === 'kg') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    if (unitType === 'liters') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} L`;
    }
    return `${quantity.toString()} un`;
  };

  autoTable(doc, {
    startY: 35,
    head: [['Produto', 'Quantidade Total']],
    body: data.map((item) => [item.product_name, formatQuantity(item.product_name, item.total_quantity)]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  doc.save(safeFilename);
}

export function exportQuantityPerProductPerCustomer(
  data: ProductCustomerQuantity[],
  productName: string,
  date?: string,
  filename?: string,
  products?: Product[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = `Quantidade por Cliente - ${productName}`;
  if (date && date !== 'all') {
    title += ` (${date} de Dezembro)`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  // Get unit type for this product
  const product = products?.find((p) => p.name === productName);
  const unitType = product?.unit_type || 'unit';

  const formatQuantity = (quantity: number): string => {
    if (unitType === 'kg') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    if (unitType === 'liters') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} L`;
    }
    return `${quantity.toString()} un`;
  };

  autoTable(doc, {
    startY: 35,
    head: [['Cliente', 'Número', 'Quantidade']],
    body: data.map((item) => [item.customer_name, item.client_number, formatQuantity(item.quantity)]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  const safeFilename = filename || (date && date !== 'all'
    ? `${productName.replace(/[^a-z0-9]/gi, '_')}-por-cliente-${date}-dezembro.pdf`
    : `${productName.replace(/[^a-z0-9]/gi, '_')}-por-cliente.pdf`);
  doc.save(safeFilename);
}

export function exportOrdersByCustomer(orders: Order[], customerName: string, clientNumber: string, products?: Product[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Encomendas - ${customerName}`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Número: ${clientNumber}`, 14, 30);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 37);

  let yPos = 45;

  orders.forEach((order, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text(`Encomenda ${index + 1} - ${order.client_number}`, 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text(`Data: ${order.created_at ? new Date(order.created_at).toLocaleDateString('pt-PT') : 'N/A'}`, 14, yPos);
    yPos += 6;
    doc.text(`Local de Recolha: ${getPickupLocationLabel(order.pickup_location)}`, 14, yPos);
    yPos += 6;
    if (order.pickup_time) {
      doc.text(`Hora: ${order.pickup_time}`, 14, yPos);
      yPos += 6;
    }
    if (order.address) {
      doc.text(`Morada: ${order.address}`, 14, yPos);
      yPos += 6;
    }

    yPos += 5;

    // Create unit type map
    const unitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
    if (products) {
      products.forEach((p) => unitTypeMap.set(p.name, p.unit_type));
    }

    const formatQuantity = (productName: string, quantity: number): string => {
      const unitType = unitTypeMap.get(productName) || 'unit';
      if (unitType === 'kg') {
        return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
      }
      return `${quantity.toString()} un`;
    };

    const tableData = order.products.map((product) => [
      product.product_name,
      formatQuantity(product.product_name, product.quantity),
      `€${product.item_price.toFixed(2)}`,
      `€${(product.quantity * product.item_price).toFixed(2)}`,
    ]);

    const total = order.products.reduce((sum, p) => sum + p.quantity * p.item_price, 0);

    autoTable(doc, {
      startY: yPos,
      head: [['Produto', 'Quantidade', 'Preço Unit.', 'Total']],
      body: tableData,
      foot: [['', '', 'Total:', `€${total.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
      footStyles: { fillColor: [0, 0, 0], fontStyle: 'bold', textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    });

    const lastAutoTable = (doc as any).lastAutoTable;
    yPos = lastAutoTable ? lastAutoTable.finalY + 15 : yPos + 50;
  });

  const safeFilename = `${customerName.replace(/[^a-z0-9]/gi, '_')}-${clientNumber}-encomendas.pdf`;
  doc.save(safeFilename);
}

export function exportAllProductsAndQuantities(
  data: ProductTotal[],
  date?: string,
  filename?: string,
  products?: Product[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = 'Todos os Produtos e Quantidades';
  if (date && date !== 'all') {
    title += ` - ${date} de Dezembro`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  const safeFilename = filename || (date && date !== 'all'
    ? `todos-produtos-quantidades-${date}-dezembro.pdf`
    : 'todos-produtos-quantidades.pdf');

  // Create unit type map
  const unitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  if (products) {
    products.forEach((p) => unitTypeMap.set(p.name, p.unit_type));
  }

  const formatQuantity = (productName: string, quantity: number): string => {
    const unitType = unitTypeMap.get(productName) || 'unit';
    if (unitType === 'kg') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    if (unitType === 'liters') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} L`;
    }
    return `${quantity.toString()} un`;
  };

  autoTable(doc, {
    startY: 35,
    head: [['Produto', 'Quantidade Total']],
    body: data.map((item) => [item.product_name, formatQuantity(item.product_name, item.total_quantity)]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  doc.save(safeFilename);
}

export function exportAllCustomerSheets(
  orders: Order[],
  date?: string,
  filename?: string,
  products?: Product[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = 'Todas as Fichas de Cliente';
  if (date && date !== 'all') {
    title += ` - ${date} de Dezembro`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  // Group orders by client_number
  const customerMap = new Map<string, Order[]>();
  orders.forEach((order) => {
    const key = order.client_number;
    const existing = customerMap.get(key) || [];
    customerMap.set(key, [...existing, order]);
  });

  // Sort by client number
  const sortedCustomers = Array.from(customerMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Create unit type map
  const unitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  if (products) {
    products.forEach((p) => unitTypeMap.set(p.name, p.unit_type));
  }

  const formatQuantity = (productName: string, quantity: number): string => {
    const unitType = unitTypeMap.get(productName) || 'unit';
    if (unitType === 'kg') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    if (unitType === 'liters') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} L`;
    }
    return `${quantity.toString()} un`;
  };

  let yPos = 45;
  let customerIndex = 0;

  sortedCustomers.forEach(([clientNumber, customerOrders]) => {
    const firstOrder = customerOrders[0];
    const customerName = firstOrder.client_name;

    // Start each customer on a new page (except the first one)
    if (customerIndex > 0) {
      doc.addPage();
      yPos = 20;
    } else {
      // For the first customer, check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    }

    // Customer header
    doc.setFontSize(14);
    doc.text(`Cliente: ${customerName}`, 14, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Número: ${clientNumber}`, 14, yPos);
    yPos += 10;

    // Orders for this customer
    customerOrders.forEach((order, orderIndex) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.text(`Encomenda ${orderIndex + 1}`, 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      if (order.pickup_date) {
        const pickupDate = new Date(order.pickup_date);
        doc.text(`Data de Recolha: ${pickupDate.toLocaleDateString('pt-PT')}`, 14, yPos);
        yPos += 6;
      }
      doc.text(`Local de Recolha: ${getPickupLocationLabel(order.pickup_location)}`, 14, yPos);
      yPos += 6;
      if (order.pickup_time) {
        doc.text(`Hora: ${order.pickup_time}`, 14, yPos);
        yPos += 6;
      }
      if (order.address) {
        doc.text(`Morada: ${order.address}`, 14, yPos);
        yPos += 6;
      }

      yPos += 5;

      const tableData = order.products.map((product) => [
        product.product_name,
        formatQuantity(product.product_name, product.quantity),
        `€${product.item_price.toFixed(2)}`,
        `€${(product.quantity * product.item_price).toFixed(2)}`,
      ]);

      const total = order.products.reduce((sum, p) => sum + p.quantity * p.item_price, 0);

      autoTable(doc, {
        startY: yPos,
        head: [['Produto', 'Quantidade', 'Preço Unit.', 'Total']],
        body: tableData,
        foot: [['', '', 'Total:', `€${total.toFixed(2)}`]],
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
        footStyles: { fillColor: [0, 0, 0], fontStyle: 'bold', textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      });

      const lastAutoTable = (doc as any).lastAutoTable;
      yPos = lastAutoTable ? lastAutoTable.finalY + 15 : yPos + 50;
    });

    // No separator needed since each customer is on a separate page
    customerIndex++;
  });

  const safeFilename = filename || (date && date !== 'all'
    ? `todas-fichas-cliente-${date}-dezembro.pdf`
    : 'todas-fichas-cliente.pdf');
  doc.save(safeFilename);
}

export function exportAllProductsWithCustomers(
  orders: Order[],
  date?: string,
  filename?: string,
  products?: Product[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = 'Produtos e Clientes';
  if (date && date !== 'all') {
    title += ` - ${date} de Dezembro`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  // Get all unique products
  const productMap = new Map<string, Map<string, { customer_name: string; client_number: string; quantity: number }>>();

  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (!productMap.has(product.product_name)) {
        productMap.set(product.product_name, new Map());
      }
      const customerMap = productMap.get(product.product_name)!;
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
    });
  });

  // Sort products alphabetically
  const sortedProducts = Array.from(productMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Create unit type map
  const unitTypeMap = new Map<string, 'unit' | 'kg' | 'liters'>();
  if (products) {
    products.forEach((p) => unitTypeMap.set(p.name, p.unit_type));
  }

  const formatQuantity = (productName: string, quantity: number): string => {
    const unitType = unitTypeMap.get(productName) || 'unit';
    if (unitType === 'kg') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    if (unitType === 'liters') {
      return `${quantity.toFixed(3).replace(/\.?0+$/, '')} L`;
    }
    return `${quantity.toString()} un`;
  };

  let yPos = 45;
  let productIndex = 0;

  sortedProducts.forEach(([productName, customers]) => {
    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Product header
    doc.setFontSize(14);
    doc.text(productName, 14, yPos);
    yPos += 8;

    // Sort customers by name
    const sortedCustomers = Array.from(customers.values()).sort((a, b) =>
      a.customer_name.localeCompare(b.customer_name)
    );

    // Calculate total for this product
    const productTotal = sortedCustomers.reduce((sum, c) => sum + c.quantity, 0);

    // Customer table
    const tableData = sortedCustomers.map((customer) => [
      customer.customer_name,
      customer.client_number,
      formatQuantity(productName, customer.quantity),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Cliente', 'Número', 'Quantidade']],
      body: tableData,
      foot: [['', 'Total:', formatQuantity(productName, productTotal)]],
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
      footStyles: { fillColor: [0, 0, 0], fontStyle: 'bold', textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    });

    const lastAutoTable = (doc as any).lastAutoTable;
    yPos = lastAutoTable ? lastAutoTable.finalY + 15 : yPos + 50;

    // Add separator between products
    if (productIndex < sortedProducts.length - 1) {
      yPos += 5;
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;
    }

    productIndex++;
  });

  const safeFilename = filename || (date && date !== 'all'
    ? `produtos-e-clientes-${date}-dezembro.pdf`
    : 'produtos-e-clientes.pdf');
  doc.save(safeFilename);
}

export function exportPeruProducts(
  data: ProductCustomerQuantity[],
  date?: string,
  filename?: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  let title = 'Perus (Recheado e Sem Recheio)';
  if (date && date !== 'all') {
    title += ` - ${date} de Dezembro`;
  }
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 30);

  const formatWeight = (quantity: number): string => {
    return `${quantity.toFixed(3).replace(/\.?0+$/, '')} kg`;
  };

  autoTable(doc, {
    startY: 35,
    head: [['Produto', 'Cliente', 'Número', 'Peso (kg)']],
    body: data.map((item) => [
      item.product_name,
      item.customer_name,
      item.client_number,
      formatWeight(item.quantity),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  // Calculate totals per product
  const peruRecheadoTotal = data
    .filter((item) => item.product_name === 'PERU RECHEADO')
    .reduce((sum, item) => sum + item.quantity, 0);
  const peruSemRecheioTotal = data
    .filter((item) => item.product_name === 'PERU SEM RECHEIO')
    .reduce((sum, item) => sum + item.quantity, 0);

  // Calculate counts
  const peruRecheadoCount = data.filter((item) => item.product_name === 'PERU RECHEADO').length;
  const peruSemRecheioCount = data.filter((item) => item.product_name === 'PERU SEM RECHEIO').length;
  const totalCount = peruRecheadoCount + peruSemRecheioCount;

  const lastAutoTable = (doc as any).lastAutoTable;
  let yPos = lastAutoTable ? lastAutoTable.finalY + 10 : 50;

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.text('Totais:', 14, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.text(`PERU RECHEADO: ${formatWeight(peruRecheadoTotal)} (${peruRecheadoCount} unidade${peruRecheadoCount !== 1 ? 's' : ''})`, 14, yPos);
  yPos += 6;
  doc.text(`PERU SEM RECHEIO: ${formatWeight(peruSemRecheioTotal)} (${peruSemRecheioCount} unidade${peruSemRecheioCount !== 1 ? 's' : ''})`, 14, yPos);
  yPos += 6;
  doc.setFontSize(11);
  doc.text(`Total Geral: ${formatWeight(peruRecheadoTotal + peruSemRecheioTotal)} (${totalCount} unidade${totalCount !== 1 ? 's' : ''})`, 14, yPos);

  const safeFilename = filename || (date && date !== 'all'
    ? `perus-${date}-dezembro.pdf`
    : 'perus.pdf');
  doc.save(safeFilename);
}

function getPickupLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    amoreira: 'Amoreira',
    lisboa: 'Lisboa',
    casa: 'Casa',
    cascais: 'Cascais',
  };
  return labels[location] || location;
}

