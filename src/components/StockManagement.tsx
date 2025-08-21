import React, { useState } from 'react';
import { Plus, Package, Search, Edit3, Trash2 } from 'lucide-react';
import { RawMaterial, Product, User } from '../types';

interface StockManagementProps {
  rawMaterials: RawMaterial[];
  products: Product[];
  onAddRawMaterial: (material: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteRawMaterial: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  user: User;
}

export default function StockManagement({
  rawMaterials,
  products,
  onAddRawMaterial,
  onAddProduct,
  onUpdateRawMaterial,
  onUpdateProduct,
  onDeleteRawMaterial,
  onDeleteProduct,
  user,
}: StockManagementProps) {
  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    price: '',
    stock: '',
    minThreshold: '',
    cost: '',
    sellingPrice: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      price: '',
      stock: '',
      minThreshold: '',
      cost: '',
      sellingPrice: '',
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'materials') {
      const materialData = {
        name: formData.name,
        unit: formData.unit,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minThreshold: parseInt(formData.minThreshold),
      };

      if (editingItem) {
        onUpdateRawMaterial(editingItem, materialData);
      } else {
        onAddRawMaterial(materialData);
      }
    } else {
      const productData = {
        name: formData.name,
        unit: formData.unit,
        cost: parseFloat(formData.cost),
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
        minThreshold: parseInt(formData.minThreshold),
      };

      if (editingItem) {
        onUpdateProduct(editingItem, productData);
      } else {
        onAddProduct(productData);
      }
    }

    resetForm();
  };

  const handleEdit = (item: RawMaterial | Product) => {
    setFormData({
      name: item.name,
      unit: item.unit,
      price: 'price' in item ? item.price.toString() : '',
      stock: item.stock.toString(),
      minThreshold: item.minThreshold.toString(),
      cost: 'cost' in item ? item.cost.toString() : '',
      sellingPrice: 'sellingPrice' in item ? item.sellingPrice.toString() : '',
    });
    setEditingItem(item.id);
    setShowAddForm(true);
  };

  const filteredMaterials = rawMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'materials'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          Raw Materials
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          Products
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {activeTab === 'materials' ? (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{material.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Stock: <span className="font-medium">{material.stock} {material.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: <span className="font-medium">${material.price}/{material.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Min Threshold: <span className="font-medium">{material.minThreshold} {material.unit}</span>
                    </p>
                  </div>
                  {material.stock <= material.minThreshold && (
                    <span className="inline-block mt-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => onDeleteRawMaterial(material.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Stock: <span className="font-medium">{product.stock} {product.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Cost: <span className="font-medium">${product.cost}/{product.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Selling Price: <span className="font-medium">${product.sellingPrice}/{product.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Profit: <span className="font-medium text-green-600">
                        ${(product.sellingPrice - product.cost).toFixed(2)}/{product.unit}
                      </span>
                    </p>
                  </div>
                  {product.stock <= product.minThreshold && (
                    <span className="inline-block mt-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'materials' ? 'Raw Material' : 'Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, piece, meter, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {activeTab === 'materials' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Threshold</label>
                <input
                  type="number"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

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
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}