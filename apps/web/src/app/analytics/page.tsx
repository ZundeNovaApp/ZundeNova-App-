'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  diagnosisStats: { type: string; count: number }[];
  revenueData: { month: string; revenue: number }[];
  topCrops: { crop: string; diagnoses: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    
    const mockData: AnalyticsData = {
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 180 },
        { month: 'Mar', users: 250 },
        { month: 'Apr', users: 320 },
        { month: 'May', users: 450 },
        { month: 'Jun', users: 580 },
      ],
      diagnosisStats: [
        { type: 'Plant Disease', count: 1250 },
        { type: 'Pest Identification', count: 890 },
        { type: 'Soil Analysis', count: 650 },
        { type: 'Livestock Health', count: 420 },
      ],
      revenueData: [
        { month: 'Jan', revenue: 2500 },
        { month: 'Feb', revenue: 3200 },
        { month: 'Mar', revenue: 4100 },
        { month: 'Apr', revenue: 5300 },
        { month: 'May', revenue: 6800 },
        { month: 'Jun', revenue: 8200 },
      ],
      topCrops: [
        { crop: 'Maize', diagnoses: 450 },
        { crop: 'Tomatoes', diagnoses: 320 },
        { crop: 'Coffee', diagnoses: 280 },
        { crop: 'Beans', diagnoses: 210 },
        { crop: 'Bananas', diagnoses: 180 },
      ]
    };
    
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={['ADMIN', 'NGO']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['ADMIN', 'NGO']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {data && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Growth</h3>
                  <div className="space-y-3">
                    {data.userGrowth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{
                              width: `${(item.users / Math.max(...data.userGrowth.map(d => d.users))) * 100}px`,
                              backgroundColor: '#00684b'
                            }}
                          />
                          <span className="text-sm font-medium">{item.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 AI Diagnoses</h3>
                  <div className="space-y-3">
                    {data.diagnosisStats.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.type}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{
                              width: `${(item.count / Math.max(...data.diagnosisStats.map(d => d.count))) * 100}px`,
                              backgroundColor: '#007f82'
                            }}
                          />
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Growth</h3>
                  <div className="space-y-3">
                    {data.revenueData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{
                              width: `${(item.revenue / Math.max(...data.revenueData.map(d => d.revenue))) * 100}px`,
                              backgroundColor: '#dbc600'
                            }}
                          />
                          <span className="text-sm font-medium">${item.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🌾 Top Crops</h3>
                  <div className="space-y-3">
                    {data.topCrops.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.crop}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{
                              width: `${(item.diagnoses / Math.max(...data.topCrops.map(d => d.diagnoses))) * 100}px`,
                              backgroundColor: '#10B981'
                            }}
                          />
                          <span className="text-sm font-medium">{item.diagnoses}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{color: '#00684b'}}>
                      {data.userGrowth[data.userGrowth.length - 1]?.users || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{color: '#007f82'}}>
                      {data.diagnosisStats.reduce((sum, item) => sum + item.count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Diagnoses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{color: '#dbc600'}}>
                      ${data.revenueData[data.revenueData.length - 1]?.revenue || 0}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {data.topCrops.length}
                    </div>
                    <div className="text-sm text-gray-600">Crop Types</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
