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
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const { isLoading: isAnalyzing, error, analyzeNDVI } = useAI();

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    
    if (!fieldId.trim()) {
      errors.fieldId = ['Field ID is required'];
    } else if (!/^[a-zA-Z0-9_-]+$/.test(fieldId)) {
      errors.fieldId = ['Field ID can only contain letters, numbers, hyphens, and underscores'];
    }
    
    if (!date.trim()) {
      errors.date = ['Date is required'];
    }
    
    if (!bbox.trim()) {
      errors.bbox = ['Bounding box is required'];
    } else {
      const coords = bbox.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length !== 4) {
        errors.bbox = ['Bounding box must contain exactly 4 coordinates'];
      } else if (coords.some(coord => isNaN(coord))) {
        errors.bbox = ['All bounding box coordinates must be valid numbers'];
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAnalyzeNDVI = async () => {
    if (!validateForm()) return;

    const bboxArray = bbox.split(',').map(coord => parseFloat(coord.trim()));
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🛰️ NDVI Field Analysis</h2>
        <div className="text-sm text-gray-500">
          Satellite-based vegetation health monitoring
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field ID *
            </label>
            <input
              type="text"
              value={fieldId}
              onChange={(e) => {
                setFieldId(e.target.value);
                setValidationErrors(prev => ({ ...prev, fieldId: [] }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.fieldId?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
              placeholder="Enter field identifier (e.g., field_001)"
            />
            {validationErrors.fieldId?.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setValidationErrors(prev => ({ ...prev, date: [] }));
              }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.date?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {validationErrors.date?.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bounding Box Coordinates *
            </label>
            <input
              type="text"
              value={bbox}
              onChange={(e) => {
                setBbox(e.target.value);
                setValidationErrors(prev => ({ ...prev, bbox: [] }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.bbox?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
              placeholder="minLon, minLat, maxLon, maxLat"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 36.8, -1.3, 36.9, -1.2 (longitude, latitude format)
            </p>
            {validationErrors.bbox?.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
            ))}
          </div>

          <button
            onClick={handleAnalyzeNDVI}
            disabled={isAnalyzing || Object.values(validationErrors).some(errors => errors.length > 0)}
            className="w-full text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-300 transition-all flex items-center justify-center"
            style={{backgroundColor: '#007f82'}}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Satellite Data...
              </>
            ) : (
              'Analyze Field Health'
            )}
          </button>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📊 About NDVI</h4>
            <p className="text-sm text-gray-600 mb-2">
              NDVI (Normalized Difference Vegetation Index) measures plant health and vigor using satellite imagery.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Values:</strong></p>
              <p>• 0.8-1.0: Very healthy vegetation</p>
              <p>• 0.6-0.8: Healthy vegetation</p>
              <p>• 0.4-0.6: Moderate vegetation</p>
              <p>• 0.2-0.4: Sparse vegetation</p>
              <p>• 0.0-0.2: No vegetation</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                onClick={() => handleAnalyzeNDVI()}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  📈 NDVI Analysis Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {result.ndvi_mean.toFixed(3)}
                    </div>
                    <div className="text-sm text-green-600">Mean NDVI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {result.ndvi_std.toFixed(3)}
                    </div>
                    <div className="text-sm text-green-600">Std Deviation</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Health Status:</span>
                    <span className={`font-medium ${
                      result.ndvi_mean > 0.7 ? 'text-green-800' :
                      result.ndvi_mean > 0.5 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {result.ndvi_mean > 0.7 ? 'Excellent' :
                       result.ndvi_mean > 0.5 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>

              {result.map_uri && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    🗺️ NDVI Vegetation Map
                  </h4>
                  <div className="relative">
                    <img 
                      src={result.map_uri} 
                      alt="NDVI Vegetation Map" 
                      className="w-full rounded border hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      Field: {fieldId}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  💡 AI Recommendations
                </h4>
                <p className="text-blue-800 leading-relaxed">{result.advice}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">🎯 Next Actions</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Schedule regular NDVI monitoring</li>
                  <li>• Compare with historical data</li>
                  <li>• Consider ground-truth verification</li>
                  <li>• Plan targeted interventions if needed</li>
                </ul>
              </div>
            </div>
          )}

          {!result && !error && !isAnalyzing && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🛰️</div>
              <p>Enter field details to analyze vegetation health</p>
              <p className="text-sm mt-2">Get insights from satellite imagery</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
