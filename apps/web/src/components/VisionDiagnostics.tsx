'use client';

import React, { useState, useRef } from 'react';
import { useAI } from '../hooks/useAI';

interface DiagnosisResult {
  diseases: Array<{ label: string; score: number; treatment_uri: string }>;
  severity: string;
  explainability: { saliency_uri: string };
  trace_id: string;
}

export default function VisionDiagnostics() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading: isAnalyzing, error, diagnoseVision } = useAI();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    const result = await diagnoseVision(
      selectedImage,
      'general',
      { lat: -1.2921, lon: 36.8219 }
    );

    if (result) {
      setResult(result);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🌱 AI Plant Diagnostics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Selected plant" className="max-w-full h-64 object-contain mx-auto rounded" />
            ) : (
              <div className="py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Upload a photo of your plant</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90"
              style={{backgroundColor: '#00684b'}}
            >
              Choose Image
            </button>
            <button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
              className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-300"
              style={{backgroundColor: '#007f82'}}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`px-3 py-2 rounded-lg ${getSeverityColor(result.severity)}`}>
                <p className="font-medium">Severity: {result.severity.toUpperCase()}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Detected Conditions:</h3>
                {result.diseases.map((disease, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{disease.label}</span>
                      <span className="text-sm text-gray-600">
                        {(disease.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${disease.score * 100}%`,
                          backgroundColor: '#00684b'
                        }}
                      ></div>
                    </div>
                    {disease.treatment_uri && (
                      <a
                        href={disease.treatment_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                      >
                        View Treatment →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
