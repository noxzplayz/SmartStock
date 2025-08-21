import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, Calendar } from 'lucide-react';
import { Product, Sale, User } from '../types';

interface SalesModuleProps {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  user: User;
}

export default function SalesModule({ products, sales, onAddSale, user }: SalesModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    productId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      productId: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProduct = products.find(p => p.id === formData.productId);
    if (!selectedProduct) return;

    const quantity = parseInt(formData.quantity);
    if (quantity > selectedProduct.stock) {
      alert('Insufficient stock! Available: ' + selectedProduct.stock);
      return;
    }

    const sale = {
      customerName: formData.customerName,
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      totalAmount: quantity * selectedProduct.sellingPrice,
      date: formData.date,
    };

    onAddSale(sale);
    resetForm();
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaysSales = sales.filter(sale => 
    sale.date === new Date().toISOString().split('T')[0]
  );

  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-600">Today's Revenue: ${todaysRevenue.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sales found</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{sale.customerName}</h3>
                    <span className="text-lg font-bold text-green-600">${sale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Product: <span className="font-medium">{sale.productName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: <span className="font-medium">{sale.quantity}</span> × ${sale.unitPrice}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Sale Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Sale</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.sellingPrice} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.productId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Available stock: {products.find(p => p.id === formData.productId)?.stock || 0}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {formData.productId && formData.quantity && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-lg font-bold text-green-600">
                    ${((products.find(p => p.id === formData.productId)?.sellingPrice || 0) * parseInt(formData.quantity || '0')).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}