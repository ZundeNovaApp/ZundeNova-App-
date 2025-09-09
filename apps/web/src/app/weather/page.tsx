'use client';

import React from 'react';
import WeatherDashboard from '../../components/WeatherDashboard';

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weather & Climate</h1>
          <p className="mt-2 text-gray-600">
            Real-time weather data, forecasts, and agricultural recommendations for your location.
          </p>
        </div>
        
        <WeatherDashboard location="nairobi" />
      </div>
    </div>
  );
}
