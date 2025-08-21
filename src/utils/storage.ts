import { User, RawMaterial, Product, Sale, Purchase } from '../types';

const STORAGE_KEYS = {
  USER: 'smartstock_user',
  RAW_MATERIALS: 'smartstock_raw_materials',
  PRODUCTS: 'smartstock_products',
  SALES: 'smartstock_sales',
  PURCHASES: 'smartstock_purchases',
};

export const storage = {
  // User management
  getUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Raw Materials
  getRawMaterials: (): RawMaterial[] => {
    const materials = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
    return materials ? JSON.parse(materials) : [];
  },
  
  setRawMaterials: (materials: RawMaterial[]) => {
    localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(materials));
  },

  // Products
  getProducts: (): Product[] => {
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return products ? JSON.parse(products) : [];
  },
  
  setProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Sales
  getSales: (): Sale[] => {
    const sales = localStorage.getItem(STORAGE_KEYS.SALES);
    return sales ? JSON.parse(sales) : [];
  },
  
  setSales: (sales: Sale[]) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  // Purchases
  getPurchases: (): Purchase[] => {
    const purchases = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return purchases ? JSON.parse(purchases) : [];
  },
  
  setPurchases: (purchases: Purchase[]) => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },

  // Initialize demo data
  initDemoData: () => {
    // Demo raw materials
    const demoMaterials: RawMaterial[] = [
      {
        id: '1',
        name: 'Steel Sheet',
        unit: 'kg',
        price: 50,
        stock: 100,
        minThreshold: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Aluminum Wire',
        unit: 'meter',
        price: 5,
        stock: 15,
        minThreshold: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Demo products
    const demoProducts: Product[] = [
      {
        id: '1',
        name: 'Metal Cabinet',
        unit: 'piece',
        cost: 150,
        sellingPrice: 200,
        stock: 25,
        minThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Wire Frame',
        unit: 'piece',
        cost: 30,
        sellingPrice: 45,
        stock: 8,
        minThreshold: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    if (!localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS)) {
      storage.setRawMaterials(demoMaterials);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      storage.setProducts(demoProducts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      storage.setSales([]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      storage.setPurchases([]);
    }
  },
};