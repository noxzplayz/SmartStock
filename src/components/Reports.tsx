import React, { useState, useMemo } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, FileText, Search } from 'lucide-react';
import { Sale, Purchase, Product, RawMaterial } from '../types';
import { generateCSV, getDateRange } from '../utils/calculations';

interface ReportsProps {
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  rawMaterials: RawMaterial[];
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
type ReportType = 'sales' | 'purchases' | 'profit' | 'stock';

export default function Reports({ sales, purchases, products, rawMaterials }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return {
        start: customStartDate || new Date().toISOString().split('T')[0],
        end: customEndDate || new Date().toISOString().split('T')[0],
      };
    }
    return getDateRange(selectedPeriod);
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Filter data based on date range and search term
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = sale.date;
      const matchesDate = saleDate >= dateRange.start && saleDate <= dateRange.end;
      const matchesSearch = !searchTerm || 
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [sales, dateRange, searchTerm]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const purchaseDate = purchase.date;
      const matchesDate = purchaseDate >= dateRange.start && purchaseDate <= dateRange.end;
      const matchesSearch = !searchTerm || 
        purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.productName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [purchases, dateRange, searchTerm]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const profit = totalSales - totalPurchases;

    // Top selling products
    const productSales = filteredSales.reduce((acc, sale) => {
      acc[sale.productName] = (acc[sale.productName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Top suppliers
    const supplierPurchases = filteredPurchases.reduce((acc, purchase) => {
      acc[purchase.supplierName] = (acc[purchase.supplierName] || 0) + purchase.totalCost;
      return acc;
    }, {} as Record<string, number>);

    const topSuppliers = Object.entries(supplierPurchases)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalSales,
      totalPurchases,
      profit,
      profitMargin: totalSales > 0 ? (profit / totalSales) * 100 : 0,
      topProducts,
      topSuppliers,
    };
  }, [filteredSales, filteredPurchases]);

  const handleExport = (type: 'sales' | 'purchases' | 'products' | 'materials') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'sales':
        data = filteredSales.map(sale => ({
          Date: sale.date,
          Customer: sale.customerName,
          Product: sale.productName,
          Quantity: sale.quantity,
          'Unit Price': sale.unitPrice,
          'Total Amount': sale.totalAmount,
        }));
        filename = 'sales_report';
        break;
      case 'purchases':
        data = filteredPurchases.map(purchase => ({
          Date: purchase.date,
          Supplier: purchase.supplierName,
          Product: purchase.productName,
          Type: purchase.isRawMaterial ? 'Raw Material' : 'Product',
          Quantity: purchase.quantity,
          'Unit Cost': purchase.unitCost,
          'Total Cost': purchase.totalCost,
        }));
        filename = 'purchases_report';
        break;
      case 'products':
        data = products.map(product => ({
          Name: product.name,
          Unit: product.unit,
          'Current Stock': product.stock,
          'Min Threshold': product.minThreshold,
          Cost: product.cost,
          'Selling Price': product.sellingPrice,
          'Profit per Unit': product.sellingPrice - product.cost,
        }));
        filename = 'products_report';
        break;
      case 'materials':
        data = rawMaterials.map(material => ({
          Name: material.name,
          Unit: material.unit,
          'Current Stock': material.stock,
          'Min Threshold': material.minThreshold,
          Price: material.price,
        }));
        filename = 'raw_materials_report';
        break;
    }

    generateCSV(data, filename);
  };

  const renderSalesReport = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Sales Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-green-100 text-sm">Total Sales</p>
            <p className="text-2xl font-bold">${summary.totalSales.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Transactions</p>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {summary.topProducts.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3">Top Selling Products</h4>
          <div className="space-y-2">
            {summary.topProducts.map(([product, quantity], index) => (
              <div key={product} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-3">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{product}</span>
                </div>
                <span className="text-sm text-gray-600">{quantity} units</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">Sales Transactions</h4>
          <button
            onClick={() => handleExport('sales')}
            className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredSales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales found for the selected period</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div key={sale.id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{sale.customerName}</p>
                    <p className="text-sm text-gray-600">{sale.productName}</p>
                    <p className="text-sm text-gray-600">{sale.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${sale.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{sale.quantity} × ${sale.unitPrice}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderPurchasesReport = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingDown className="h-5 w-5 mr-2" />
          Purchases Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-red-100 text-sm">Total Purchases</p>
            <p className="text-2xl font-bold">${summary.totalPurchases.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-red-100 text-sm">Transactions</p>
            <p className="text-2xl font-bold">{filteredPurchases.length}</p>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      {summary.topSuppliers.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3">Top Suppliers</h4>
          <div className="space-y-2">
            {summary.topSuppliers.map(([supplier, amount], index) => (
              <div key={supplier} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-3">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{supplier}</span>
                </div>
                <span className="text-sm text-gray-600">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">Purchase Transactions</h4>
          <button
            onClick={() => handleExport('purchases')}
            className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredPurchases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchases found for the selected period</p>
            </div>
          ) : (
            filteredPurchases.map((purchase) => (
              <div key={purchase.id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{purchase.supplierName}</p>
                    <p className="text-sm text-gray-600">
                      {purchase.productName} ({purchase.isRawMaterial ? 'Raw Material' : 'Product'})
                    </p>
                    <p className="text-sm text-gray-600">{purchase.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">${purchase.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{purchase.quantity} × ${purchase.unitCost}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderProfitReport = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Profit Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Net Profit</p>
            <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-white' : 'text-red-200'}`}>
              ${summary.profit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Profit Margin</p>
            <p className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-white' : 'text-red-200'}`}>
              {summary.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Revenue</h4>
          <p className="text-2xl font-bold text-green-600">${summary.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">Costs</h4>
          <p className="text-2xl font-bold text-red-600">${summary.totalPurchases.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-lg border ${summary.profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <h4 className={`font-semibold mb-2 ${summary.profit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            Net Result
          </h4>
          <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${summary.profit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3">Profit Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-medium text-green-600">+${summary.totalSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Costs</span>
            <span className="font-medium text-red-600">-${summary.totalPurchases.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Net Profit</span>
            <span className={summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${summary.profit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStockReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">Products</h4>
            <button
              onClick={() => handleExport('products')}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Products: <span className="font-medium">{products.length}</span></p>
            <p className="text-sm text-gray-600">
              Low Stock: <span className="font-medium text-red-600">
                {products.filter(p => p.stock <= p.minThreshold).length}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">Raw Materials</h4>
            <button
              onClick={() => handleExport('materials')}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Materials: <span className="font-medium">{rawMaterials.length}</span></p>
            <p className="text-sm text-gray-600">
              Low Stock: <span className="font-medium text-red-600">
                {rawMaterials.filter(m => m.stock <= m.minThreshold).length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      {[...products, ...rawMaterials].filter(item => item.stock <= item.minThreshold).length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center">
            <TrendingDown className="h-4 w-4 mr-2" />
            Low Stock Alert
          </h4>
          <div className="space-y-2">
            {[...products, ...rawMaterials]
              .filter(item => item.stock <= item.minThreshold)
              .map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded border">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {'cost' in item ? 'Product' : 'Raw Material'} • {item.stock} {item.unit} remaining
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    Low Stock
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">View detailed reports and export data for analysis.</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'sales', label: 'Sales', icon: TrendingUp },
              { id: 'purchases', label: 'Purchases', icon: TrendingDown },
              { id: 'profit', label: 'Profit', icon: DollarSign },
              { id: 'stock', label: 'Stock', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setReportType(id as ReportType)}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border transition-colors ${
                  reportType === id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'daily', label: 'Today' },
              { id: 'weekly', label: 'Last 7 Days' },
              { id: 'monthly', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedPeriod(id as ReportPeriod)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedPeriod === id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Search */}
        {(reportType === 'sales' || reportType === 'purchases') && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${reportType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Report Content */}
      {reportType === 'sales' && renderSalesReport()}
      {reportType === 'purchases' && renderPurchasesReport()}
      {reportType === 'profit' && renderProfitReport()}
      {reportType === 'stock' && renderStockReport()}
    </div>
  );
}