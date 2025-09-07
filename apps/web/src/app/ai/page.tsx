import React from 'react';
import VisionDiagnostics from '../../components/VisionDiagnostics';
import NDVIAnalysis from '../../components/NDVIAnalysis';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🤖 AI Agricultural Services</h1>
          <p className="text-lg text-gray-600">Advanced AI-powered tools for modern farming</p>
        </div>
        
        <VisionDiagnostics />
        <NDVIAnalysis />
      </div>
    </div>
  );
}
