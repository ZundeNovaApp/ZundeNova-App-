import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface WeatherIntegrationProps {
  farmLocation: {
    latitude: number;
    longitude: number;
  };
  onWeatherUpdate: (data: any) => void;
}

export default function WeatherIntegration({ farmLocation, onWeatherUpdate }: WeatherIntegrationProps) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [irrigationRecommendation, setIrrigationRecommendation] = useState<any>(null);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [farmLocation]);

  const fetchWeatherData = async () => {
    const mockWeatherData = {
      current: {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        rainfall: 0,
        uvIndex: 7
      },
      forecast: [
        { date: 'Today', high: 30, low: 22, condition: 'Sunny', rainfall: 0 },
        { date: 'Tomorrow', high: 28, low: 20, condition: 'Cloudy', rainfall: 5 },
        { date: 'Day 3', high: 26, low: 18, condition: 'Rainy', rainfall: 15 },
        { date: 'Day 4', high: 29, low: 21, condition: 'Partly Cloudy', rainfall: 2 },
        { date: 'Day 5', high: 31, low: 23, condition: 'Sunny', rainfall: 0 }
      ]
    };

    setWeatherData(mockWeatherData.current);
    setForecast(mockWeatherData.forecast);

    const recommendation = generateIrrigationRecommendation(mockWeatherData);
    setIrrigationRecommendation(recommendation);

    await offlineStorageService.storeOfflineData({
      id: `weather_${Date.now()}`,
      type: 'farm',
      data: { weather: mockWeatherData, recommendation }
    });

    onWeatherUpdate(mockWeatherData);
  };

  const generateIrrigationRecommendation = (weather: any) => {
    const totalRainfall = weather.forecast.reduce((sum: number, day: any) => sum + day.rainfall, 0);
    const avgTemperature = weather.forecast.reduce((sum: number, day: any) => sum + day.high, 0) / weather.forecast.length;

    if (totalRainfall < 10 && avgTemperature > 28) {
      return {
        action: 'irrigate',
        urgency: 'high',
        message: 'Low rainfall expected. Irrigate crops within 24 hours.',
        waterAmount: '25mm',
        timing: 'Early morning or evening'
      };
    } else if (totalRainfall < 20) {
      return {
        action: 'monitor',
        urgency: 'medium',
        message: 'Monitor soil moisture. Light irrigation may be needed.',
        waterAmount: '15mm',
        timing: 'As needed'
      };
    } else {
      return {
        action: 'none',
        urgency: 'low',
        message: 'Sufficient rainfall expected. No irrigation needed.',
        waterAmount: '0mm',
        timing: 'N/A'
      };
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rainy': return '🌧️';
      default: return '🌤️';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weather & Irrigation</Text>

      {weatherData && (
        <View style={styles.currentWeatherCard}>
          <Text style={styles.cardTitle}>Current Conditions</Text>
          <View style={styles.currentWeatherContent}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{getConditionIcon(weatherData.condition)} {weatherData.condition}</Text>
          </View>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherDetail}>Humidity: {weatherData.humidity}%</Text>
            <Text style={styles.weatherDetail}>Wind: {weatherData.windSpeed} km/h</Text>
            <Text style={styles.weatherDetail}>UV Index: {weatherData.uvIndex}</Text>
          </View>
        </View>
      )}

      <View style={styles.forecastCard}>
        <Text style={styles.cardTitle}>5-Day Forecast</Text>
        {forecast.map((day, index) => (
          <View key={index} style={styles.forecastItem}>
            <Text style={styles.forecastDate}>{day.date}</Text>
            <Text style={styles.forecastCondition}>{getConditionIcon(day.condition)}</Text>
            <Text style={styles.forecastTemp}>{day.high}°/{day.low}°</Text>
            <Text style={styles.forecastRain}>{day.rainfall}mm</Text>
          </View>
        ))}
      </View>

      {irrigationRecommendation && (
        <View style={[
          styles.recommendationCard,
          { backgroundColor: irrigationRecommendation.urgency === 'high' ? '#fee2e2' : 
                             irrigationRecommendation.urgency === 'medium' ? '#fef3c7' : '#dcfce7' }
        ]}>
          <Text style={styles.cardTitle}>Irrigation Recommendation</Text>
          <Text style={[
            styles.urgencyBadge,
            { color: irrigationRecommendation.urgency === 'high' ? '#dc2626' :
                     irrigationRecommendation.urgency === 'medium' ? '#d97706' : '#16a34a' }
          ]}>
            {irrigationRecommendation.urgency.toUpperCase()} PRIORITY
          </Text>
          <Text style={styles.recommendationMessage}>{irrigationRecommendation.message}</Text>
          <View style={styles.recommendationDetails}>
            <Text style={styles.recommendationDetail}>Water Amount: {irrigationRecommendation.waterAmount}</Text>
            <Text style={styles.recommendationDetail}>Best Timing: {irrigationRecommendation.timing}</Text>
          </View>
          
          {irrigationRecommendation.action === 'irrigate' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Schedule Irrigation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.alertsCard}>
        <Text style={styles.cardTitle}>Weather Alerts</Text>
        <View style={styles.alertItem}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Heat Wave Warning</Text>
            <Text style={styles.alertMessage}>High temperatures expected. Increase irrigation frequency.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentWeatherCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  currentWeatherContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
  },
  condition: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetail: {
    fontSize: 14,
    color: '#666',
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  forecastDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 2,
  },
  forecastCondition: {
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  forecastTemp: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  forecastRain: {
    fontSize: 14,
    color: '#3b82f6',
    flex: 1,
    textAlign: 'right',
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  urgencyBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendationMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  recommendationDetails: {
    marginBottom: 15,
  },
  recommendationDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alertsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
  },
});
