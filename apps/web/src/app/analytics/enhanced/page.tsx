'use client';

import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className || ''}`}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
);

interface AnalyticsData {
  userRole: 'farmer' | 'ngo' | 'coop' | 'government';
  timeRange: string;
  metrics: {
    [key: string]: number | string;
  };
  charts: {
    [key: string]: any[];
  };
}

interface DashboardConfig {
  metrics: string[];
  charts: string[];
}

export default function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [userRole, setUserRole] = useState<'farmer' | 'ngo' | 'coop' | 'government'>('farmer');
  const [loading, setLoading] = useState(true);

  const dashboardConfigs: Record<string, DashboardConfig> = {
    farmer: {
      metrics: ['yield_trends', 'input_costs', 'revenue', 'crop_health'],
      charts: ['yield_comparison', 'cost_breakdown', 'weather_correlation']
    },
    ngo: {
      metrics: ['farmer_adoption', 'impact_metrics', 'disease_outbreaks', 'training_completion'],
      charts: ['adoption_heatmap', 'impact_timeline', 'regional_comparison']
    },
    coop: {
      metrics: ['member_activity', 'bulk_orders', 'collective_savings', 'group_yields'],
      charts: ['member_engagement', 'order_volumes', 'savings_trends']
    },
    government: {
      metrics: ['food_security', 'agricultural_productivity', 'rural_development', 'policy_impact'],
      charts: ['productivity_map', 'policy_effectiveness', 'regional_development']
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [userRole, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const mockData = generateMockAnalyticsData();
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = (): AnalyticsData => {
    const config = dashboardConfigs[userRole];
    const metrics: { [key: string]: number | string } = {};
    const charts: { [key: string]: any[] } = {};

    config.metrics.forEach(metric => {
      switch (metric) {
        case 'yield_trends':
          metrics[metric] = '+12.5%';
          break;
        case 'input_costs':
          metrics[metric] = 'KES 45,230';
          break;
        case 'revenue':
          metrics[metric] = 'KES 125,400';
          break;
        case 'crop_health':
          metrics[metric] = '87%';
          break;
        case 'farmer_adoption':
          metrics[metric] = '2,847 farmers';
          break;
        case 'impact_metrics':
          metrics[metric] = '+34% yield increase';
          break;
        case 'disease_outbreaks':
          metrics[metric] = '3 active alerts';
          break;
        case 'training_completion':
          metrics[metric] = '78%';
          break;
        default:
          metrics[metric] = Math.floor(Math.random() * 1000);
      }
    });

    config.charts.forEach(chart => {
      charts[chart] = generateMockChartData(chart);
    });

    return {
      userRole,
      timeRange,
      metrics,
      charts
    };
  };

  const generateMockChartData = (chartType: string): Array<{date: string, value: number, label: string}> => {
    const dataPoints = 12;
    const data: Array<{date: string, value: number, label: string}> = [];

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (dataPoints - i - 1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
        label: `Month ${i + 1}`
      });
    }

    return data;
  };

  const generateReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const reportData = {
        userRole,
        timeRange,
        metrics: dashboardConfigs[userRole].metrics,
        data: analyticsData,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zundenova_report_${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const renderMetricCard = (metricKey: string, value: number | string) => (
    <Card key={metricKey} className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {metricKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );

  const renderChart = (chartKey: string, data: any[]) => (
    <Card key={chartKey} className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {chartKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-gray-600">Chart visualization</div>
            <div className="text-sm text-gray-500 mt-1">
              {data.length} data points
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Enhanced Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights for {userRole} dashboard
            </p>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="farmer">Farmer View</option>
              <option value="ngo">NGO View</option>
              <option value="coop">Cooperative View</option>
              <option value="government">Government View</option>
            </select>
            
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <div className="flex gap-2">
              <button 
                onClick={() => generateReport('pdf')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
              <button 
                onClick={() => generateReport('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(analyticsData.metrics).map(([key, value]) =>
                renderMetricCard(key, value)
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {Object.entries(analyticsData.charts).map(([key, data]) =>
                renderChart(key, data)
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New farmer registered</span>
                      <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Diagnosis completed</span>
                      <span className="text-xs text-gray-400 ml-auto">5 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Weather alert issued</span>
                      <span className="text-xs text-gray-400 ml-auto">10 min ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Top Performing Regions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Central Kenya</span>
                      <span className="text-sm font-medium text-green-600">+18.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rift Valley</span>
                      <span className="text-sm font-medium text-green-600">+15.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Western Kenya</span>
                      <span className="text-sm font-medium text-green-600">+12.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Uptime</span>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Sync</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AI Models</span>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
