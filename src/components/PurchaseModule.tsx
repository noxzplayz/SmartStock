import React, { useState } from 'react';
import { Plus, Search, ShoppingBag, Calendar } from 'lucide-react';
import { Product, RawMaterial, Purchase, User } from '../types';

interface PurchaseModuleProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  purchases: Purchase[];
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  user: User;
}

export default function PurchaseModule({
  products,
  rawMaterials,
  purchases,
  onAddPurchase,
  user,
}: PurchaseModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    supplierName: '',
    productId: '',
    isRawMaterial: true,
    quantity: '',
    unitCost: '',
    date: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => {
    setFormData({
      supplierName: '',
      productId: '',
      isRawMaterial: true,
      quantity: '',
      unitCost: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const items = formData.isRawMaterial ? rawMaterials : products;
    const selectedItem = items.find(item => item.id === formData.productId);
    if (!selectedItem) return;

    const quantity = parseInt(formData.quantity);
    const unitCost = parseFloat(formData.unitCost);

    const purchase = {
      supplierName: formData.supplierName,
      productId: formData.productId,
      productName: selectedItem.name,
      isRawMaterial: formData.isRawMaterial,
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      date: formData.date,
    };

    onAddPurchase(purchase);
    resetForm();
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaysPurchases = purchases.filter(purchase => 
    purchase.date === new Date().toISOString().split('T')[0]
  );

  const todaysCost = todaysPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-600">Today's Purchases: ${todaysCost.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search purchases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Purchases List */}
      <div className="space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No purchases found</p>
          </div>
        ) : (
          filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{purchase.supplierName}</h3>
                    <span className="text-lg font-bold text-red-600">${purchase.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {purchase.isRawMaterial ? 'Raw Material' : 'Product'}: <span className="font-medium">{purchase.productName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: <span className="font-medium">{purchase.quantity}</span> × ${purchase.unitCost}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Purchase Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Purchase</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isRawMaterial}
                      onChange={() => setFormData({ ...formData, isRawMaterial: true, productId: '' })}
                      className="mr-2"
                    />
                    Raw Material
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isRawMaterial}
                      onChange={() => setFormData({ ...formData, isRawMaterial: false, productId: '' })}
                      className="mr-2"
                    />
                    Product
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.isRawMaterial ? 'Raw Material' : 'Product'}
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select {formData.isRawMaterial ? 'raw material' : 'product'}</option>
                  {(formData.isRawMaterial ? rawMaterials : products).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current stock: {item.stock})
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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

              {formData.quantity && formData.unitCost && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Cost:</p>
                  <p className="text-lg font-bold text-red-600">
                    ${(parseInt(formData.quantity || '0') * parseFloat(formData.unitCost || '0')).toFixed(2)}
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
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}