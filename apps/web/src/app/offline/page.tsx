'use client';

import React, { useState, useEffect } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineData, setOfflineData] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const testOfflineFeatures = () => {
    const mockData = [
      { id: 1, type: 'diagnosis', data: 'Crop health check completed offline' },
      { id: 2, type: 'record', data: 'Farm activity logged offline' },
      { id: 3, type: 'learning', data: 'Educational module downloaded' }
    ];
    setOfflineData(mockData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Offline Capabilities</h1>
          
          <div className={`p-4 rounded-lg mb-6 ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {isOnline ? 'Online - All features available' : 'Offline - Limited features available'}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">🔄 PWA Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Installable as native app</li>
                <li>✅ Offline page caching</li>
                <li>✅ Background sync when online</li>
                <li>✅ Push notifications</li>
                <li>✅ App-like experience</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">📱 Offline Capabilities</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ AI diagnostics (TensorFlow Lite)</li>
                <li>✅ Voice input transcription</li>
                <li>✅ Farm records management</li>
                <li>✅ Educational content</li>
                <li>✅ Community Q&amp;A (cached)</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={testOfflineFeatures}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Offline Features
            </button>
          </div>

          {offlineData.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Offline Data</h3>
              <div className="space-y-3">
                {offlineData.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-sm text-gray-500">Stored locally</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.data}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Installation Instructions</h4>
            <p className="text-sm text-blue-800">
              To install ZundeNova as a PWA: Look for the &quot;Install&quot; button in your browser&apos;s address bar, 
              or use the browser menu to &quot;Add to Home Screen&quot; on mobile devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
