'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@zundenova/ui';

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  forecast: string;
}

interface AIAlert {
  id: string;
  type: 'disease' | 'pest' | 'weather' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

interface FarmStats {
  totalFarms: number;
  activeCrops: number;
  livestock: number;
  recentDiagnoses: number;
}

export default function FarmerDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [farmStats, setFarmStats] = useState<FarmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setWeather({
        temperature: 28,
        humidity: 65,
        condition: 'Partly Cloudy',
        forecast: 'Light rain expected tomorrow'
      });

      setAlerts([
        {
          id: '1',
          type: 'disease',
          severity: 'high',
          message: 'Bacterial blight detected in maize field #3. Immediate treatment recommended.',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'weather',
          severity: 'medium',
          message: 'Heavy rainfall expected in 48 hours. Prepare drainage systems.',
          timestamp: new Date()
        }
      ]);

      setFarmStats({
        totalFarms: 3,
        activeCrops: 12,
        livestock: 45,
        recentDiagnoses: 8
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-500 text-green-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ZundeNova Dashboard</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="/dashboard" className="text-green-600 font-medium">Dashboard</a>
              <a href="/marketplace" className="text-gray-600 hover:text-green-600">Marketplace</a>
              <a href="/farms" className="text-gray-600 hover:text-green-600">My Farms</a>
              <a href="/consult" className="text-gray-600 hover:text-green-600">Expert Consult</a>
              <a href="/ai-chat" className="text-gray-600 hover:text-green-600">AI Assistant</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Farmer!</h2>
          <p className="text-gray-600">Here&apos;s what&apos;s happening on your farms today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V9a5 5 0 0110 0v8m0 0v4m0-4h4m0 0V9a5 5 0 0110 0v8m0 0v4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Farms</p>
                <p className="text-2xl font-bold text-gray-900">{farmStats?.totalFarms}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Crops</p>
                <p className="text-2xl font-bold text-gray-900">{farmStats?.activeCrops}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Livestock</p>
                <p className="text-2xl font-bold text-gray-900">{farmStats?.livestock}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Diagnoses</p>
                <p className="text-2xl font-bold text-gray-900">{farmStats?.recentDiagnoses}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weather Widget */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Today</h3>
              {weather && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{weather.temperature}°C</p>
                      <p className="text-gray-600">{weather.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="text-lg font-semibold">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Forecast</p>
                    <p className="text-gray-900">{weather.forecast}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* AI Alerts */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Alerts & Recommendations</h3>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">{alert.type} Alert</p>
                        <p className="text-sm mt-1">{alert.message}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                  View All Alerts →
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/ai-chat"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Ask AI Assistant</p>
                <p className="text-sm text-gray-600">Get farming advice</p>
              </div>
            </a>

            <a
              href="/marketplace"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
            >
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Shop Marketplace</p>
                <p className="text-sm text-gray-600">Buy farm supplies</p>
              </div>
            </a>

            <a
              href="/consult"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Book Expert</p>
                <p className="text-sm text-gray-600">Consult veterinarian</p>
              </div>
            </a>

            <a
              href="/farms"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Manage Farms</p>
                <p className="text-sm text-gray-600">View farm records</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
