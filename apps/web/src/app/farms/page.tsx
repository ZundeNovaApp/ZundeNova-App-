'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Farm {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  size: number;
  sizeUnit: string;
  soilType: string;
  crops: string[];
  livestock: number;
  createdAt: Date;
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mockFarms: Farm[] = [
        {
          id: '1',
          name: 'Main Farm',
          location: {
            latitude: -1.2921,
            longitude: 36.8219,
            address: 'Nairobi, Kenya'
          },
          size: 5.5,
          sizeUnit: 'hectares',
          soilType: 'Clay loam',
          crops: ['Maize', 'Beans', 'Tomatoes'],
          livestock: 25,
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'North Field',
          location: {
            latitude: -1.2850,
            longitude: 36.8300,
            address: 'Kiambu, Kenya'
          },
          size: 3.2,
          sizeUnit: 'hectares',
          soilType: 'Sandy loam',
          crops: ['Coffee', 'Bananas'],
          livestock: 12,
          createdAt: new Date('2024-02-20')
        }
      ];
      
      setTimeout(() => {
        setFarms(mockFarms);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load farms');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your farms...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
            <button
              className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#00684b'}}
            >
              Add New Farm
            </button>
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
                    onClick={fetchFarms}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {farms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌾</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No farms yet</h2>
              <p className="text-gray-600 mb-6">Get started by adding your first farm</p>
              <button
                className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#00684b'}}
              >
                Add Your First Farm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{farm.name}</h3>
                    <span className="text-sm text-gray-500">
                      {farm.size} {farm.sizeUnit}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {farm.location.address}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🌱</span>
                      Soil: {farm.soilType}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🌾</span>
                      Crops: {farm.crops.join(', ')}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🐄</span>
                      Livestock: {farm.livestock} animals
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span>
                      Added: {farm.createdAt.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                      style={{backgroundColor: '#007f82'}}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
