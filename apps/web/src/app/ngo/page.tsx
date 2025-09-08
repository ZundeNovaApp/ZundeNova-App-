'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

interface ImpactMetrics {
  activeFarmers: number;
  aiDiagnoses: number;
  yieldImprovement: number;
  farmersGrowth: number;
  diagnosesGrowth: number;
}

interface DiseaseOutbreak {
  id: string;
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  affectedFarms: number;
  reportedDate: string;
}

export default function NGODashboard() {
  const [impactData, setImpactData] = useState<ImpactMetrics | null>(null);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState<DiseaseOutbreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setImpactData({
        activeFarmers: 12450,
        aiDiagnoses: 8230,
        yieldImprovement: 23,
        farmersGrowth: 15,
        diagnosesGrowth: 28
      });

      setDiseaseOutbreaks([
        {
          id: '1',
          disease: 'Maize Leaf Blight',
          location: 'Nakuru County',
          severity: 'high',
          affectedFarms: 45,
          reportedDate: '2024-01-15'
        },
        {
          id: '2',
          disease: 'Tomato Bacterial Wilt',
          location: 'Kiambu County',
          severity: 'medium',
          affectedFarms: 23,
          reportedDate: '2024-01-14'
        },
        {
          id: '3',
          disease: 'Bean Rust',
          location: 'Meru County',
          severity: 'low',
          affectedFarms: 12,
          reportedDate: '2024-01-13'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading impact dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={['NGO', 'GOVERNMENT']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Export Report
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                Settings
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Farmers</h3>
                  <p className="text-3xl font-bold text-green-600">{impactData?.activeFarmers.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{impactData?.farmersGrowth}% this month</p>
                </div>
                <div className="text-4xl">👨‍🌾</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Diagnoses</h3>
                  <p className="text-3xl font-bold text-blue-600">{impactData?.aiDiagnoses.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">+{impactData?.diagnosesGrowth}% this month</p>
                </div>
                <div className="text-4xl">🔬</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Yield Improvement</h3>
                  <p className="text-3xl font-bold text-yellow-600">{impactData?.yieldImprovement}%</p>
                  <p className="text-sm text-gray-500">Average increase</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Outbreak Monitoring</h3>
            <div className="space-y-4">
              {diseaseOutbreaks.map((outbreak) => (
                <div key={outbreak.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{outbreak.disease}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(outbreak.severity)}`}>
                        {outbreak.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {outbreak.location} • {outbreak.affectedFarms} farms affected • Reported {outbreak.reportedDate}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Send Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adoption Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mobile App Usage</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Diagnostic Usage</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Marketplace Engagement</span>
                  <span className="font-medium">64%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '64%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Central Kenya</p>
                    <p className="text-sm text-gray-600">4,230 farmers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+18% yield</p>
                    <p className="text-sm text-gray-600">vs. baseline</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Western Kenya</p>
                    <p className="text-sm text-gray-600">3,890 farmers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+25% yield</p>
                    <p className="text-sm text-gray-600">vs. baseline</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Eastern Kenya</p>
                    <p className="text-sm text-gray-600">2,650 farmers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+21% yield</p>
                    <p className="text-sm text-gray-600">vs. baseline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
