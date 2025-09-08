'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Member {
  id: string;
  name: string;
  phone: string;
  farmSize: number;
  joinDate: string;
  status: 'active' | 'inactive';
  totalOrders: number;
}

interface BulkOrder {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered';
  orderDate: string;
  participants: number;
}

export default function CoopDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    setTimeout(() => {
      setMembers([
        {
          id: '1',
          name: 'John Kamau',
          phone: '+254700123456',
          farmSize: 2.5,
          joinDate: '2023-06-15',
          status: 'active',
          totalOrders: 12
        },
        {
          id: '2',
          name: 'Mary Wanjiku',
          phone: '+254700234567',
          farmSize: 1.8,
          joinDate: '2023-07-20',
          status: 'active',
          totalOrders: 8
        },
        {
          id: '3',
          name: 'Peter Mwangi',
          phone: '+254700345678',
          farmSize: 3.2,
          joinDate: '2023-05-10',
          status: 'inactive',
          totalOrders: 15
        }
      ]);

      setBulkOrders([
        {
          id: '1',
          product: 'NPK Fertilizer (50kg)',
          quantity: 100,
          unitPrice: 2200,
          totalAmount: 220000,
          status: 'confirmed',
          orderDate: '2024-01-10',
          participants: 25
        },
        {
          id: '2',
          product: 'Maize Seeds (10kg)',
          quantity: 50,
          unitPrice: 450,
          totalAmount: 22500,
          status: 'pending',
          orderDate: '2024-01-15',
          participants: 18
        },
        {
          id: '3',
          product: 'Pesticide (1L)',
          quantity: 75,
          unitPrice: 800,
          totalAmount: 60000,
          status: 'delivered',
          orderDate: '2024-01-05',
          participants: 30
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cooperative dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={['COOP_ADMIN']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cooperative Dashboard</h1>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Add Member
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                New Bulk Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Members</h3>
                  <p className="text-3xl font-bold text-green-600">{members.length}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">{bulkOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Savings</h3>
                  <p className="text-3xl font-bold text-yellow-600">KES 45K</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Farm Coverage</h3>
                  <p className="text-3xl font-bold text-purple-600">7.5 Ha</p>
                </div>
                <div className="text-4xl">🌾</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'members'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Member Management
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bulk Orders
                </button>
                <button
                  onClick={() => setActiveTab('financial')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'financial'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Financial Overview
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'members' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Management</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Farm Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {members.map((member) => (
                          <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.farmSize} Ha
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.totalOrders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Order Management</h3>
                  <div className="space-y-4">
                    {bulkOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{order.product}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Quantity:</span> {order.quantity} units
                              </div>
                              <div>
                                <span className="font-medium">Unit Price:</span> KES {order.unitPrice.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Total:</span> KES {order.totalAmount.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Participants:</span> {order.participants} members
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Details
                            </button>
                            {order.status === 'pending' && (
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                Confirm Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Monthly Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Orders Value</span>
                          <span className="font-medium">KES 302,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bulk Discount Savings</span>
                          <span className="font-medium text-green-600">KES 45,375</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission Earned</span>
                          <span className="font-medium">KES 15,125</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Net Savings</span>
                          <span className="text-green-600">KES 60,500</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Payment Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pending Payments</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            KES 22,500
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Completed Payments</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            KES 280,000
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Outstanding Balance</span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            KES 0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
