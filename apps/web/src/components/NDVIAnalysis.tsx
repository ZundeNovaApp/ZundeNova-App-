'use client';

import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

interface NDVIResult {
  ndvi_mean: number;
  ndvi_std: number;
  map_uri: string;
  advice: string;
}

export default function NDVIAnalysis() {
  const [fieldId, setFieldId] = useState('');
  const [date, setDate] = useState('');
  const [bbox, setBbox] = useState('');
  const [result, setResult] = useState<NDVIResult | null>(null);
  const { isLoading: isAnalyzing, error, analyzeNDVI } = useAI();

  const handleAnalyzeNDVI = async () => {
    if (!fieldId || !date || !bbox) {
      return;
    }

    const bboxArray = bbox.split(',').map(num => parseFloat(num.trim()));
    if (bboxArray.length !== 4) {
      return;
    }

    const result = await analyzeNDVI(fieldId, date, bboxArray);
    if (result) {
      setResult(result);
    }
  };

  const getNDVIColor = (ndvi: number) => {
    if (ndvi > 0.7) return 'text-green-600';
    if (ndvi > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🛰️ NDVI Field Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field ID
            </label>
            <input
              type="text"
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter field identifier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bounding Box (minLon, minLat, maxLon, maxLat)
            </label>
            <input
              type="text"
              value={bbox}
              onChange={(e) => setBbox(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="36.8, -1.3, 36.9, -1.2"
            />
          </div>

          <button
            onClick={handleAnalyzeNDVI}
            disabled={isAnalyzing || !fieldId || !date || !bbox}
            className="w-full text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-300"
            style={{backgroundColor: '#00684b'}}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Field'}
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">NDVI Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mean NDVI:</span>
                    <span className={`font-medium ${getNDVIColor(result.ndvi_mean)}`}>
                      {result.ndvi_mean.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Standard Deviation:</span>
                    <span className="font-medium text-gray-900">
                      {result.ndvi_std.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Analysis</h3>
                <p className="text-gray-700">{result.advice}</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Satellite Map</p>
                <div className="bg-white rounded border-2 border-dashed border-gray-300 h-32 flex items-center justify-center">
                  <span className="text-gray-500">Map visualization would appear here</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
