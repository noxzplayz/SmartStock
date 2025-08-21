import React, { useState } from 'react';
import { User, Lock, Building2 } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const user: UserType = {
        id: Date.now().toString(),
        username: username.trim(),
        role: selectedRole,
      };
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SmartStock</h1>
          <p className="text-gray-600 mt-2">Mobile Inventory Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-colors ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Lock className="h-4 w-4 mr-2" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('staff')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-colors ${
                  selectedRole === 'staff'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Staff
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Login to SmartStock
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo credentials:</p>
          <p>Username: admin | Role: Admin (Full access)</p>
          <p>Username: staff | Role: Staff (Limited access)</p>
        </div>
      </div>
    </div>
  );
}