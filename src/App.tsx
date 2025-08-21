import React, { useState, useEffect } from 'react';
import { BarChart3, Package, ShoppingCart, ShoppingBag, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import SalesModule from './components/SalesModule';
import PurchaseModule from './components/PurchaseModule';
import Reports from './components/Reports';
import { User, RawMaterial, Product, Sale, Purchase, DashboardStats } from './types';
import { storage } from './utils/storage';
import { calculateDashboardStats } from './utils/calculations';

type ActiveTab = 'dashboard' | 'stock' | 'sales' | 'purchases' | 'reports' | 'settings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalRawMaterials: 0,
    lowStockItems: 0,
    todaySales: 0,
    todayPurchases: 0,
    totalRevenue: 0,
    totalCosts: 0,
    profit: 0,
  });

  // Initialize data on component mount
  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    
    storage.initDemoData();
    loadData();
  }, []);

  // Recalculate stats when data changes
  useEffect(() => {
    const newStats = calculateDashboardStats(rawMaterials, products, sales, purchases);
    setStats(newStats);
  }, [rawMaterials, products, sales, purchases]);

  const loadData = () => {
    setRawMaterials(storage.getRawMaterials());
    setProducts(storage.getProducts());
    setSales(storage.getSales());
    setPurchases(storage.getPurchases());
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    storage.setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    storage.clearUser();
    setActiveTab('dashboard');
  };

  // Raw Materials handlers
  const handleAddRawMaterial = (materialData: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMaterial: RawMaterial = {
      ...materialData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedMaterials = [...rawMaterials, newMaterial];
    setRawMaterials(updatedMaterials);
    storage.setRawMaterials(updatedMaterials);
  };

  const handleUpdateRawMaterial = (id: string, updates: Partial<RawMaterial>) => {
    const updatedMaterials = rawMaterials.map(material =>
      material.id === id ? { ...material, ...updates, updatedAt: new Date().toISOString() } : material
    );
    setRawMaterials(updatedMaterials);
    storage.setRawMaterials(updatedMaterials);
  };

  const handleDeleteRawMaterial = (id: string) => {
    if (user?.role !== 'admin') return;
    const updatedMaterials = rawMaterials.filter(material => material.id !== id);
    setRawMaterials(updatedMaterials);
    storage.setRawMaterials(updatedMaterials);
  };

  // Products handlers
  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    storage.setProducts(updatedProducts);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
    );
    setProducts(updatedProducts);
    storage.setProducts(updatedProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (user?.role !== 'admin') return;
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    storage.setProducts(updatedProducts);
  };

  // Sales handlers
  const handleAddSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Update product stock
    const updatedProducts = products.map(product => {
      if (product.id === saleData.productId) {
        return {
          ...product,
          stock: product.stock - saleData.quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return product;
    });

    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    setProducts(updatedProducts);
    storage.setSales(updatedSales);
    storage.setProducts(updatedProducts);
  };

  // Purchase handlers
  const handleAddPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Update stock based on whether it's raw material or product
    if (purchaseData.isRawMaterial) {
      const updatedMaterials = rawMaterials.map(material => {
        if (material.id === purchaseData.productId) {
          return {
            ...material,
            stock: material.stock + purchaseData.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
        return material;
      });
      setRawMaterials(updatedMaterials);
      storage.setRawMaterials(updatedMaterials);
    } else {
      const updatedProducts = products.map(product => {
        if (product.id === purchaseData.productId) {
          return {
            ...product,
            stock: product.stock + purchaseData.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      });
      setProducts(updatedProducts);
      storage.setProducts(updatedProducts);
    }

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    storage.setPurchases(updatedPurchases);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const lowStockItems = [
    ...rawMaterials.filter(material => material.stock <= material.minThreshold),
    ...products.filter(product => product.stock <= product.minThreshold),
  ];

  const navigationItems = [
    { id: 'dashboard' as ActiveTab, icon: BarChart3, label: 'Dashboard' },
    { id: 'stock' as ActiveTab, icon: Package, label: 'Stock' },
    { id: 'sales' as ActiveTab, icon: ShoppingCart, label: 'Sales' },
    { id: 'purchases' as ActiveTab, icon: ShoppingBag, label: 'Purchases' },
    { id: 'reports' as ActiveTab, icon: FileText, label: 'Reports' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} lowStockItems={lowStockItems} />;
      case 'stock':
        return (
          <StockManagement
            rawMaterials={rawMaterials}
            products={products}
            onAddRawMaterial={handleAddRawMaterial}
            onAddProduct={handleAddProduct}
            onUpdateRawMaterial={handleUpdateRawMaterial}
            onUpdateProduct={handleUpdateProduct}
            onDeleteRawMaterial={handleDeleteRawMaterial}
            onDeleteProduct={handleDeleteProduct}
            user={user}
          />
        );
      case 'sales':
        return (
          <SalesModule
            products={products}
            sales={sales}
            onAddSale={handleAddSale}
            user={user}
          />
        );
      case 'purchases':
        return (
          <PurchaseModule
            products={products}
            rawMaterials={rawMaterials}
            purchases={purchases}
            onAddPurchase={handleAddPurchase}
            user={user}
          />
        );
      case 'reports':
        return (
          <Reports
            sales={sales}
            purchases={purchases}
            products={products}
            rawMaterials={rawMaterials}
          />
        );
      default:
        return <Dashboard stats={stats} lowStockItems={lowStockItems} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SmartStock</h1>
                <p className="text-xs text-gray-500">{user.role.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors
                    ${activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navigationItems.find(item => item.id === activeTab)?.label}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Low Stock Notification */}
      {lowStockItems.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-30 max-w-sm">
          <p className="text-sm font-medium">
            ⚠️ {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock!
          </p>
        </div>
      )}
    </div>
  );
}

export default App;