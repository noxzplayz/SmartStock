import { RawMaterial, Product, Sale, Purchase, DashboardStats } from '../types';

export const calculateDashboardStats = (
  rawMaterials: RawMaterial[],
  products: Product[],
  sales: Sale[],
  purchases: Purchase[]
): DashboardStats => {
  const today = new Date().toISOString().split('T')[0];
  
  // Today's sales and purchases
  const todaysSales = sales.filter(sale => sale.date === today);
  const todaysPurchases = purchases.filter(purchase => purchase.date === today);
  
  // Calculate totals
  const todaySalesAmount = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todayPurchasesAmount = todaysPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  
  // Total revenue and costs
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalCosts = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  
  // Low stock items
  const lowStockItems = [
    ...rawMaterials.filter(material => material.stock <= material.minThreshold),
    ...products.filter(product => product.stock <= product.minThreshold),
  ].length;

  return {
    totalProducts: products.length,
    totalRawMaterials: rawMaterials.length,
    lowStockItems,
    todaySales: todaySalesAmount,
    todayPurchases: todayPurchasesAmount,
    totalRevenue,
    totalCosts,
    profit: totalRevenue - totalCosts,
  };
};

export const generateCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getDateRange = (period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
};