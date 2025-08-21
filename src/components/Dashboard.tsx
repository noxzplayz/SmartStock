import React from 'react';
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import { DashboardStats, RawMaterial, Product } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  lowStockItems: (RawMaterial | Product)[];
}

export default function Dashboard({ stats, lowStockItems }: DashboardProps) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your inventory overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Raw Materials</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRawMaterials}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">${stats.todaySales.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Purchases</p>
              <p className="text-2xl font-bold text-gray-900">${stats.todayPurchases.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Financial Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Revenue</p>
            <p className="text-xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Costs</p>
            <p className="text-xl font-bold">${stats.totalCosts.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Profit</p>
            <p className="text-xl font-bold">${stats.profit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Low Stock Alert ({lowStockItems.length} items)
          </h2>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded border">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.stock} {item.unit} remaining</p>
                </div>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Low Stock
                </span>
              </div>
            ))}
          </div>
          {lowStockItems.length > 5 && (
            <p className="text-sm text-red-600 mt-2">
              +{lowStockItems.length - 5} more items need attention
            </p>
          )}
        </div>
      )}
    </div>
  );
}