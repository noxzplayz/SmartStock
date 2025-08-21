export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  minThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  cost: number;
  sellingPrice: number;
  stock: number;
  minThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  supplierName: string;
  productId: string;
  productName: string;
  isRawMaterial: boolean;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalRawMaterials: number;
  lowStockItems: number;
  todaySales: number;
  todayPurchases: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
}