'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@zundenova/ui';

interface ImpactMetrics {
  totalFarmers: number;
  farmsSupported: number;
  cropsMonitored: number;
  aiDiagnoses: number;
  revenueGenerated: number;
  expertConsultations: number;
}

interface RegionalData {
  region: string;
  farmers: number;
  revenue: number;
  growth: number;
}

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function InvestorPortal() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('6months');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setMetrics({
        totalFarmers: 12847,
        farmsSupported: 8934,
        cropsMonitored: 45672,
        aiDiagnoses: 23891,
        revenueGenerated: 2847593,
        expertConsultations: 5634
      });

      setRegionalData([
        { region: 'Kenya', farmers: 4523, revenue: 892340, growth: 23.5 },
        { region: 'Tanzania', farmers: 3891, revenue: 756821, growth: 18.2 },
        { region: 'Uganda', farmers: 2456, revenue: 489234, growth: 31.7 },
        { region: 'Rwanda', farmers: 1977, revenue: 398456, growth: 28.9 }
      ]);

      setFinancialData([
        { month: 'Mar 2025', revenue: 456789, expenses: 234567, profit: 222222 },
        { month: 'Apr 2025', revenue: 523456, expenses: 267890, profit: 255566 },
        { month: 'May 2025', revenue: 598234, expenses: 289456, profit: 308778 },
        { month: 'Jun 2025', revenue: 634567, expenses: 312345, profit: 322222 },
        { month: 'Jul 2025', revenue: 689234, expenses: 334567, profit: 354667 },
        { month: 'Aug 2025', revenue: 734567, expenses: 356789, profit: 377778 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investor dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">ZundeNova Investor Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Impact Dashboard</h2>
          <p className="text-gray-600">Track the growth and impact of ZundeNova across Africa.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalFarmers || 0)}</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.revenueGenerated || 0)}</p>
                <p className="text-sm text-green-600">+18.3% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Diagnoses</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.aiDiagnoses || 0)}</p>
                <p className="text-sm text-green-600">+25.7% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V9a5 5 0 0110 0v8m0 0v4m0-4h4m0 0V9a5 5 0 0110 0v8m0 0v4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Farms Supported</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.farmsSupported || 0)}</p>
                <p className="text-sm text-green-600">+15.2% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expert Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.expertConsultations || 0)}</p>
                <p className="text-sm text-green-600">+22.1% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crops Monitored</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.cropsMonitored || 0)}</p>
                <p className="text-sm text-green-600">+19.8% from last month</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Regional Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
            <div className="space-y-4">
              {regionalData.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{region.region}</p>
                    <p className="text-sm text-gray-600">{formatNumber(region.farmers)} farmers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(region.revenue)}</p>
                    <p className={`text-sm ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      +{region.growth}% growth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Financial Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
            <div className="space-y-4">
              {financialData.slice(-3).map((data) => (
                <div key={data.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{data.month}</p>
                    <p className="text-sm text-gray-600">Revenue: {formatCurrency(data.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(data.profit)}</p>
                    <p className="text-sm text-gray-600">Profit</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                View Detailed Financials →
              </button>
            </div>
          </Card>
        </div>

        {/* Impact Stories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Impact Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Early Disease Detection Saves Harvest</h4>
              <p className="text-sm text-gray-600 mb-3">
                AI-powered diagnosis helped farmer John Mwangi in Kenya detect bacterial blight early, 
                saving 80% of his maize crop worth $3,200.
              </p>
              <span className="text-xs text-green-600 font-medium">Kenya • 2 days ago</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Expert Consultation Improves Livestock Health</h4>
              <p className="text-sm text-gray-600 mb-3">
                Video consultation with Dr. Sarah helped farmer Grace treat her cattle, 
                preventing disease spread and saving $1,800 in potential losses.
              </p>
              <span className="text-xs text-green-600 font-medium">Tanzania • 5 days ago</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Marketplace Connects Rural Farmers</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cooperative in Uganda increased income by 45% through direct marketplace access, 
                eliminating middlemen and improving profit margins.
              </p>
              <span className="text-xs text-green-600 font-medium">Uganda • 1 week ago</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
