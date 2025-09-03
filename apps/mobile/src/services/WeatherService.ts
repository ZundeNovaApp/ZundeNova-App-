import { offlineStorageService } from './OfflineStorageService';
import { notificationService } from './NotificationService';

export interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainfall: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  rainfall: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherAlert {
  id: string;
  type: 'heat_wave' | 'frost' | 'heavy_rain' | 'drought' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'severe';
  title: string;
  message: string;
  startTime: Date;
  endTime: Date;
  recommendations: string[];
}

export interface IrrigationRecommendation {
  action: 'irrigate' | 'monitor' | 'none';
  urgency: 'low' | 'medium' | 'high';
  message: string;
  waterAmount: string;
  timing: string;
  reasoning: string[];
}

class WeatherService {
  async fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const mockWeatherData: WeatherData = {
        current: {
          temperature: 28 + Math.random() * 10,
          humidity: 60 + Math.random() * 20,
          windSpeed: 10 + Math.random() * 15,
          condition: this.getRandomCondition(),
          rainfall: Math.random() * 5,
          uvIndex: 5 + Math.random() * 5,
          pressure: 1010 + Math.random() * 20,
          visibility: 8 + Math.random() * 2
        },
        forecast: this.generateForecast(),
        alerts: this.generateAlerts()
      };

      await offlineStorageService.storeOfflineData({
        id: `weather_${Date.now()}`,
        type: 'farm',
        data: mockWeatherData
      });

      return mockWeatherData;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return this.getOfflineWeatherData();
    }
  }

  private getRandomCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generateForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
    
    for (let i = 0; i < 5; i++) {
      forecast.push({
        date: days[i],
        high: 25 + Math.random() * 10,
        low: 15 + Math.random() * 8,
        condition: this.getRandomCondition(),
        rainfall: Math.random() * 20,
        windSpeed: 8 + Math.random() * 12,
        humidity: 50 + Math.random() * 30
      });
    }
    
    return forecast;
  }

  private generateAlerts(): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    
    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert_${Date.now()}`,
        type: 'heat_wave',
        severity: 'medium',
        title: 'Heat Wave Warning',
        message: 'High temperatures expected for the next 3 days. Increase irrigation frequency.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade for livestock',
          'Monitor crops for heat stress',
          'Avoid heavy field work during peak hours'
        ]
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: `alert_${Date.now() + 1}`,
        type: 'heavy_rain',
        severity: 'high',
        title: 'Heavy Rain Expected',
        message: 'Significant rainfall expected in the next 24 hours.',
        startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
        recommendations: [
          'Ensure proper drainage',
          'Protect young plants',
          'Delay fertilizer application',
          'Check for waterlogging after rain'
        ]
      });
    }

    return alerts;
  }

  async generateIrrigationRecommendation(weatherData: WeatherData, soilMoisture?: number): Promise<IrrigationRecommendation> {
    const totalRainfall = weatherData.forecast.reduce((sum, day) => sum + day.rainfall, 0);
    const avgTemperature = weatherData.forecast.reduce((sum, day) => sum + day.high, 0) / weatherData.forecast.length;
    const currentMoisture = soilMoisture || 45;

    const reasoning: string[] = [];
    
    if (totalRainfall < 10) {
      reasoning.push(`Low rainfall expected (${totalRainfall.toFixed(1)}mm over 5 days)`);
    }
    
    if (avgTemperature > 30) {
      reasoning.push(`High average temperature (${avgTemperature.toFixed(1)}°C)`);
    }
    
    if (currentMoisture < 40) {
      reasoning.push(`Low soil moisture (${currentMoisture}%)`);
    }

    if (totalRainfall < 10 && avgTemperature > 28) {
      return {
        action: 'irrigate',
        urgency: 'high',
        message: 'Immediate irrigation recommended due to low rainfall and high temperatures.',
        waterAmount: '25-30mm',
        timing: 'Early morning (6-8 AM) or evening (6-8 PM)',
        reasoning
      };
    } else if (totalRainfall < 20 || currentMoisture < 50) {
      return {
        action: 'monitor',
        urgency: 'medium',
        message: 'Monitor soil moisture closely. Light irrigation may be needed.',
        waterAmount: '15-20mm',
        timing: 'As needed, preferably early morning',
        reasoning
      };
    } else {
      return {
        action: 'none',
        urgency: 'low',
        message: 'Sufficient rainfall expected. No immediate irrigation needed.',
        waterAmount: '0mm',
        timing: 'N/A',
        reasoning: ['Adequate rainfall expected', 'Good soil moisture levels']
      };
    }
  }

  private async getOfflineWeatherData(): Promise<WeatherData> {
    try {
      const offlineData = await offlineStorageService.getOfflineDataByType('weather');
      const weatherData = offlineData.length > 0 ? offlineData[0] : null;
      if (weatherData) {
        return weatherData.data;
      }
    } catch (error) {
      console.error('Failed to get offline weather data:', error);
    }

    return {
      current: {
        temperature: 25,
        humidity: 65,
        windSpeed: 10,
        condition: 'Partly Cloudy',
        rainfall: 0,
        uvIndex: 6,
        pressure: 1015,
        visibility: 10
      },
      forecast: [
        { date: 'Today', high: 28, low: 20, condition: 'Sunny', rainfall: 0, windSpeed: 12, humidity: 60 },
        { date: 'Tomorrow', high: 26, low: 18, condition: 'Cloudy', rainfall: 2, windSpeed: 15, humidity: 70 }
      ],
      alerts: []
    };
  }

  async processWeatherAlerts(farmId: string, weatherData: WeatherData): Promise<void> {
    for (const alert of weatherData.alerts) {
      await notificationService.scheduleNotification({
        id: `weather_alert_${alert.id}`,
        type: 'weather',
        title: alert.title,
        message: alert.message,
        scheduledDate: alert.startTime,
        farmId,
        priority: alert.severity === 'severe' ? 'high' : 'medium',
        actionRequired: true,
        data: alert
      });
    }
  }

  async getCurrentWeather(): Promise<any> {
    try {
      return {
        temperature: 25 + Math.random() * 10,
        condition: ['sunny', 'cloudy', 'partly cloudy', 'rainy'][Math.floor(Math.random() * 4)],
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        uvIndex: Math.floor(Math.random() * 11),
        precipitation: Math.random() * 10,
        pressure: 1013 + Math.random() * 20,
        visibility: 10 + Math.random() * 5,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();
