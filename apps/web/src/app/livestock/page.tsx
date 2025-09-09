'use client';

import React from 'react';
import LivestockDiagnostics from '../../components/LivestockDiagnostics';

export default function LivestockPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Livestock Health & Management</h1>
          <p className="mt-2 text-gray-600">
            AI-powered livestock health diagnostics and management tools for optimal animal care.
          </p>
        </div>
        
        <LivestockDiagnostics />
      </div>
    </div>
  );
}
