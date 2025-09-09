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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading: isAnalyzing, error, diagnoseVision } = useAI();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setValidationErrors([]);
    
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const errors: string[] = [];
      
      if (!allowedTypes.includes(file.type)) {
        errors.push('Please select a valid image file (JPEG, PNG, or WebP)');
      }
      if (file.size > maxSize) {
        errors.push('Image file size must be less than 10MB');
      }
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await diagnoseVision(
        selectedImage,
        'general',
        { lat: -1.2921, lon: 36.8219 }
      );

      if (result) {
        setResult(result);
        setProgress(100);
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🌱 AI Plant Diagnostics</h2>
        <div className="text-sm text-gray-500">
          Powered by advanced computer vision
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Selected plant" className="max-w-full h-64 object-contain mx-auto rounded" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl('');
                    setResult(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Upload a clear photo of your plant</p>
                <p className="text-xs text-gray-500 mt-1">Supported: JPEG, PNG, WebP (max 10MB)</p>
              </div>
            )}
          </div>
          
          {validationErrors.length > 0 && (
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">• {error}</p>
              ))}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {isAnalyzing && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: '#00684b'
                }}
              />
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{backgroundColor: '#00684b'}}
            >
              {selectedImage ? 'Change Image' : 'Choose Image'}
            </button>
            <button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing || validationErrors.length > 0}
              className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-300 transition-all flex items-center justify-center"
              style={{backgroundColor: validationErrors.length > 0 ? '#9CA3AF' : '#007f82'}}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze Plant'
              )}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Take photos in good lighting</li>
              <li>Focus on affected areas</li>
              <li>Include leaves and stems</li>
              <li>Avoid blurry images</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                onClick={() => selectedImage && analyzeImage()}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`px-4 py-3 rounded-lg border ${getSeverityColor(result.severity)}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">Health Status: {result.severity.toUpperCase()}</p>
                  <span className="text-xs opacity-75">ID: {result.trace_id.slice(-8)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  🔬 Detected Conditions
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({result.diseases.length} found)
                  </span>
                </h3>
                {result.diseases.map((disease, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{disease.label}</span>
                      <span className="text-sm font-semibold text-gray-600">
                        {(disease.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${disease.score * 100}%`,
                          backgroundColor: disease.score > 0.7 ? '#EF4444' : disease.score > 0.4 ? '#F59E0B' : '#00684b'
                        }}
                      />
                    </div>
                    {disease.treatment_uri && (
                      <a
                        href={disease.treatment_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 text-sm hover:underline"
                      >
                        📋 View Treatment Guide →
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🎯 Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Consult with an agricultural expert for treatment advice</li>
                  <li>• Monitor plant health regularly</li>
                  <li>• Consider preventive measures for your crop</li>
                  <li>• Keep records for future reference</li>
                </ul>
              </div>
            </div>
          )}

          {!result && !error && !isAnalyzing && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🌿</div>
              <p>Upload a plant image to get started</p>
              <p className="text-sm mt-2">Our AI will analyze it for diseases and health issues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
