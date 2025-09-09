'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

interface AdminStats {
  totalUsers: number;
  totalFarms: number;
  totalDiagnoses: number;
  totalOrders: number;
  revenueThisMonth: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'diagnosis' | 'order' | 'farm_added';
  description: string;
  timestamp: Date;
  userId?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalFarms: 856,
        totalDiagnoses: 3421,
        totalOrders: 567,
        revenueThisMonth: 12450.75,
        activeUsers: 342
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New farmer registered from Kenya',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          userId: 'user_123'
        },
        {
          id: '2',
          type: 'diagnosis',
          description: 'Plant disease diagnosis completed for maize crop',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          userId: 'user_456'
        },
        {
          id: '3',
          type: 'order',
          description: 'Order placed for NPK fertilizer - $45.00',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          userId: 'user_789'
        },
        {
          id: '4',
          type: 'farm_added',
          description: 'New farm added in Tanzania - 3.5 hectares',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          userId: 'user_101'
        }
      ];
      
      setTimeout(() => {
        setStats(mockStats);
        setActivities(mockActivities);
        setIsLoading(false);
      }, 1000);
    } catch {
      setError('Failed to load admin data');
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'diagnosis': return '🔬';
      case 'order': return '🛒';
      case 'farm_added': return '🌾';
      default: return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'diagnosis': return 'bg-green-50 border-green-200 text-green-800';
      case 'order': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'farm_added': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={fetchAdminData}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Farms</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalFarms.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100">
                      <span className="text-2xl">🔬</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">AI Diagnoses</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalDiagnoses.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue (Month)</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.revenueThisMonth.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <span className="text-2xl">🟢</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-2xl mb-2">👥</div>
                      <div className="font-medium text-gray-900">Manage Users</div>
                      <div className="text-sm text-gray-600">View and edit user accounts</div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="font-medium text-gray-900">Orders</div>
                      <div className="text-sm text-gray-600">Monitor marketplace orders</div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-medium text-gray-900">Analytics</div>
                      <div className="text-sm text-gray-600">View detailed reports</div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-2xl mb-2">⚙️</div>
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-sm text-gray-600">Platform configuration</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Recent Activity</h3>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                      >
                        <div className="flex items-start">
                          <span className="text-lg mr-3">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {activity.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <button className="text-sm font-medium hover:underline" style={{color: '#00684b'}}>
                      View All Activity →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
