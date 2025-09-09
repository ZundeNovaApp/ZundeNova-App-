'use client';

import React, { useState, useEffect } from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  dewPoint: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }>;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    validUntil: string;
  }>;
  soilMoisture: {
    current: number;
    optimal: number;
    recommendation: string;
  };
  plantingAdvice: {
    suitable: string[];
    notSuitable: string[];
    generalAdvice: string;
  };
}

interface WeatherDashboardProps {
  location?: string;
}

export default function WeatherDashboard({ location = 'nairobi' }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/weather/${location}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading weather data: {error}</p>
          <button
            onClick={fetchWeatherData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Light Rain': '🌦️',
      'Heavy Rain': '🌧️',
      'Thunderstorms': '⛈️',
      'Snow': '❄️'
    };
    return icons[condition] || '🌤️';
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': 'text-green-600 bg-green-50 border-green-200',
      'moderate': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'high': 'text-red-600 bg-red-50 border-red-200',
      'critical': 'text-red-800 bg-red-100 border-red-300'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Weather Dashboard</h2>
          <button
            onClick={fetchWeatherData}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-2">{getWeatherIcon(weatherData.condition)}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{weatherData.temperature}°C</div>
            <div className="text-gray-600">{weatherData.condition}</div>
            <div className="text-sm text-gray-500 mt-1">{weatherData.location}</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Humidity:</span>
              <span className="font-medium">{weatherData.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wind Speed:</span>
              <span className="font-medium">{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pressure:</span>
              <span className="font-medium">{weatherData.pressure} hPa</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">UV Index:</span>
              <span className="font-medium">{weatherData.uvIndex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Visibility:</span>
              <span className="font-medium">{weatherData.visibility} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dew Point:</span>
              <span className="font-medium">{weatherData.dewPoint}°C</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Soil Moisture</h3>
            <div className="text-2xl font-bold text-blue-700 mb-1">{weatherData.soilMoisture.current}%</div>
            <div className="text-sm text-blue-600">Optimal: {weatherData.soilMoisture.optimal}%</div>
            <div className="text-xs text-blue-500 mt-2">{weatherData.soilMoisture.recommendation}</div>
          </div>
        </div>

        {weatherData.alerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Alerts</h3>
            <div className="space-y-3">
              {weatherData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium capitalize">{alert.type.replace('_', ' ')} Alert</div>
                      <div className="text-sm mt-1">{alert.message}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getWeatherIcon(day.condition)}</div>
                    <div>
                      <div className="font-medium">{day.day}</div>
                      <div className="text-sm text-gray-600">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{day.high}° / {day.low}°</div>
                    <div className="text-sm text-gray-600">{day.precipitation}% rain</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Planting Advice</h3>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-green-900 mb-2">Suitable Crops</h4>
              <div className="flex flex-wrap gap-2">
                {weatherData.plantingAdvice.suitable.map((crop, index) => (
                  <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm capitalize">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
            
            {weatherData.plantingAdvice.notSuitable.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-red-900 mb-2">Not Recommended</h4>
                <div className="flex flex-wrap gap-2">
                  {weatherData.plantingAdvice.notSuitable.map((crop, index) => (
                    <span key={index} className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm capitalize">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">General Advice</h4>
              <p className="text-blue-700 text-sm">{weatherData.plantingAdvice.generalAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
