'use client';

import React, { useState } from 'react';

interface LivestockDiagnosisRequest {
  symptoms: string[];
  animalType: string;
  age?: string;
  breed?: string;
  weight?: string;
  temperature?: string;
  appetite?: string;
}

interface LivestockDiagnosisResponse {
  animalType: string;
  symptoms: string[];
  animalDetails: {
    age?: string;
    breed?: string;
    weight?: string;
    temperature?: string;
    appetite?: string;
  };
  likelyConditions: Array<{
    condition: string;
    probability: number;
    severity: string;
    description: string;
  }>;
  recommendations: string[];
  urgency: string;
  severityScore: number;
  vetConsultationRequired: boolean;
  followUpRequired: boolean;
  estimatedRecoveryTime: string;
  preventiveMeasures: string[];
  nutritionalAdvice: string[];
  quarantineRequired: boolean;
}

export default function LivestockDiagnostics() {
  const [diagnosisData, setDiagnosisData] = useState<LivestockDiagnosisRequest>({
    symptoms: [],
    animalType: 'cattle',
    age: '',
    breed: '',
    weight: '',
    temperature: '',
    appetite: 'normal'
  });
  const [result, setResult] = useState<LivestockDiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animalTypes = [
    { value: 'cattle', label: 'Cattle' },
    { value: 'goats', label: 'Goats' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'pigs', label: 'Pigs' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'rabbits', label: 'Rabbits' }
  ];

  const commonSymptoms = [
    'fever', 'loss_of_appetite', 'lethargy', 'coughing', 'diarrhea',
    'vomiting', 'lameness', 'swelling', 'discharge', 'difficulty_breathing',
    'weight_loss', 'excessive_thirst', 'unusual_behavior', 'skin_lesions',
    'nasal_discharge', 'eye_discharge', 'constipation', 'bloating'
  ];

  const appetiteOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'loss_of_appetite', label: 'Loss of Appetite' },
    { value: 'increased', label: 'Increased' }
  ];

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setDiagnosisData(prev => ({
      ...prev,
      symptoms: checked 
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (diagnosisData.symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/livestock/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(diagnosisData)
      });

      if (!response.ok) {
        throw new Error('Failed to get livestock diagnosis');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get diagnosis');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      'low': 'text-green-600 bg-green-50 border-green-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'critical': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[urgency] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'mild': 'text-green-600',
      'moderate': 'text-yellow-600',
      'severe': 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Livestock Health Diagnostics</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Type *
              </label>
              <select
                value={diagnosisData.animalType}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, animalType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {animalTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="text"
                value={diagnosisData.age}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 2 years, 6 months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <input
                type="text"
                value={diagnosisData.breed}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, breed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Holstein, Boer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={diagnosisData.weight}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 450 kg, 25 kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="text"
                value={diagnosisData.temperature}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 39.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appetite
              </label>
              <select
                value={diagnosisData.appetite}
                onChange={(e) => setDiagnosisData(prev => ({ ...prev, appetite: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {appetiteOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Symptoms * (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonSymptoms.map(symptom => (
                <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diagnosisData.symptoms.includes(symptom)}
                    onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {symptom.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || diagnosisData.symptoms.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Get Diagnosis'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Diagnosis Results</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(result.urgency)}`}>
              {result.urgency.toUpperCase()} PRIORITY
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Animal Information</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                  <div><span className="font-medium">Type:</span> {result.animalType}</div>
                  {result.animalDetails.age && <div><span className="font-medium">Age:</span> {result.animalDetails.age}</div>}
                  {result.animalDetails.breed && <div><span className="font-medium">Breed:</span> {result.animalDetails.breed}</div>}
                  {result.animalDetails.weight && <div><span className="font-medium">Weight:</span> {result.animalDetails.weight}</div>}
                  {result.animalDetails.temperature && <div><span className="font-medium">Temperature:</span> {result.animalDetails.temperature}°C</div>}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Reported Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {result.symptoms.map((symptom, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                      {symptom.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Assessment</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                  <div><span className="font-medium">Severity Score:</span> {result.severityScore}/10</div>
                  <div><span className="font-medium">Vet Consultation:</span> {result.vetConsultationRequired ? 'Required' : 'Optional'}</div>
                  <div><span className="font-medium">Quarantine:</span> {result.quarantineRequired ? 'Recommended' : 'Not Required'}</div>
                  <div><span className="font-medium">Recovery Time:</span> {result.estimatedRecoveryTime}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Likely Conditions</h4>
            <div className="space-y-3">
              {result.likelyConditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{condition.condition}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getSeverityColor(condition.severity)}`}>
                        {condition.severity}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(condition.probability * 100)}% probability
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{condition.description}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${condition.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Immediate Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Nutritional Advice</h4>
              <ul className="space-y-2">
                {result.nutritionalAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Preventive Measures</h4>
            <div className="bg-green-50 p-4 rounded-md">
              <ul className="space-y-2">
                {result.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm text-gray-700">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.vetConsultationRequired && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-600">⚠️</span>
                <h4 className="font-semibold text-yellow-800">Veterinary Consultation Required</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Based on the symptoms and severity, we recommend consulting with a veterinarian as soon as possible.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
