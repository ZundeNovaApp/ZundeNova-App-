'use client';

import React, { useState } from 'react';

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleTestLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleTestError = () => {
    setShowError(!showError);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Testing Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Loading Spinner</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Small</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span>Large</span>
              </div>
              <button
                onClick={handleTestLoading}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Test Loading'
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Error Message</h2>
            <div className="space-y-4">
              <button
                onClick={handleTestError}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {showError ? 'Hide Error' : 'Show Error'}
              </button>
              {showError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-600">This is a test error message with retry functionality</p>
                      <button
                        onClick={() => alert('Retry clicked!')}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
            <div className="space-y-2">
              <button
                onClick={() => alert('Success toast would appear here')}
                className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Show Success Toast
              </button>
              <button
                onClick={() => alert('Error toast would appear here')}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Show Error Toast
              </button>
              <button
                onClick={() => alert('Warning toast would appear here')}
                className="block w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Show Warning Toast
              </button>
              <button
                onClick={() => alert('Info toast would appear here')}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Show Info Toast
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: '#00684b'}}></div>
                <span>Primary Green (#00684b)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: '#007f82'}}></div>
                <span>Secondary Teal (#007f82)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded" style={{backgroundColor: '#dbc600'}}></div>
                <span>Accent Gold (#dbc600)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
