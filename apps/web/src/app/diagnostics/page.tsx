import React from 'react';
import VisionDiagnostics from '../../components/VisionDiagnostics';

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <VisionDiagnostics />
      </div>
    </div>
  );
}
