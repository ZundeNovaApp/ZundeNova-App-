'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ProfilePage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || ''
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = ['Name is required'];
    }
    
    if (!formData.email) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = ['Please enter a valid phone number'];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUpdateSuccess(true);
      } else {
        const errorData = await response.json();
        setErrors({ general: [errorData.message || 'Update failed'] });
      }
    } catch {
      setErrors({ general: ['Network error. Please try again.'] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
    setUpdateSuccess(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <div className="text-sm text-gray-500">
                Role: {user?.role}
              </div>
            </div>

            {updateSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">✅ Profile updated successfully!</p>
              </div>
            )}

            {errors.general && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general[0]}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.name?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors.name?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
                ))}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.email?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors.email?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
                ))}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.phone?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors.phone?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
                ))}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={formData.role}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Contact support to change your role</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center"
                  style={{ backgroundColor: '#00684b' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
