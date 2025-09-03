import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';
import { syncService } from '../services/SyncService';
import { notificationService } from '../services/NotificationService';
import { weatherService } from '../services/WeatherService';
import OfflineSync from './OfflineSync';
import PushNotificationService from './PushNotificationService';

interface PhaseADashboardProps {
  farmId: string;
  onNavigate?: (screen: string) => void;
}

export default function PhaseADashboard({ farmId, onNavigate }: PhaseADashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    initializeDashboard();
  }, [farmId]);

  const initializeDashboard = async () => {
    try {
      await loadDashboardData();
      await loadWeatherData();
      await loadNotifications();
      await scheduleAutomaticReminders();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const loadDashboardData = async () => {
    const mockData = {
      farmHealth: 87,
      offlineCapability: true,
      syncStatus: 'up_to_date',
      lastSync: new Date(),
      pendingTasks: 5,
      activeAlerts: 2,
      cropStatus: {
        healthy: 4,
        needsAttention: 1,
        total: 5
      },
      livestockStatus: {
        healthy: 125,
        needsAttention: 3,
        total: 128
      },
      financialSummary: {
        monthlyIncome: 2850,
        monthlyExpenses: 1950,
        netProfit: 900,
        pendingPayments: 2
      },
      irrigationStatus: {
        nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000),
        systemStatus: 'operational',
        waterLevel: 78
      }
    };

    setDashboardData(mockData);

    await offlineStorageService.storeOfflineData({
      id: `dashboard_${Date.now()}`,
      type: 'farm',
      data: mockData
    });
  };

  const loadWeatherData = async () => {
    try {
      const weather = await weatherService.fetchWeatherData(-1.2921, 36.8219);
      setWeatherData(weather);
      
      await weatherService.processWeatherAlerts(farmId, weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const farmNotifications = await notificationService.getScheduledNotifications(farmId);
      setNotifications(farmNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const scheduleAutomaticReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    await notificationService.scheduleFertilizerApplication(farmId, 'crop_1', tomorrow);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await notificationService.schedulePestMonitoring(farmId, 'crop_1');

    const irrigationTime = new Date();
    irrigationTime.setHours(irrigationTime.getHours() + 6);
    await notificationService.scheduleIrrigationReminder(farmId, 'Field A', irrigationTime);
  };

  const handleSyncComplete = () => {
    loadDashboardData();
    Alert.alert('Sync Complete', 'All data has been synchronized successfully!');
  };

  const handleTaskUpdate = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
  };

  const handleWeatherUpdate = (weather: any) => {
    setWeatherData(weather);
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#dc2626';
  };

  if (!dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Phase A Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <PushNotificationService farmId={farmId} />
      
      <Text style={styles.title}>🌱 ZundeNova Farm Dashboard</Text>
      <Text style={styles.subtitle}>Phase A: Foundation & Offline-First Architecture</Text>

      {/* Farm Health Overview */}
      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>Farm Health Overview</Text>
        <View style={styles.healthIndicator}>
          <Text style={[styles.healthScore, { color: getHealthColor(dashboardData.farmHealth) }]}>
            {dashboardData.farmHealth}%
          </Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthProgress, 
                { 
                  width: `${dashboardData.farmHealth}%`,
                  backgroundColor: getHealthColor(dashboardData.farmHealth)
                }
              ]} 
            />
          </View>
          <Text style={styles.healthStatus}>
            {dashboardData.farmHealth > 80 ? 'Excellent' : 
             dashboardData.farmHealth > 60 ? 'Good' : 'Needs Attention'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.pendingTasks}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.activeAlerts}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.cropStatus.healthy}</Text>
          <Text style={styles.statLabel}>Healthy Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.livestockStatus.healthy}</Text>
          <Text style={styles.statLabel}>Healthy Livestock</Text>
        </View>
      </View>

      {/* Weather Information */}
      {weatherData && (
        <View style={styles.weatherCard}>
          <Text style={styles.cardTitle}>Weather & Conditions</Text>
          <View style={styles.weatherContent}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherDetail}>Humidity: {weatherData.humidity}%</Text>
            <Text style={styles.weatherDetail}>Wind: {weatherData.windSpeed} km/h</Text>
            <Text style={styles.weatherDetail}>UV Index: {weatherData.uvIndex}</Text>
          </View>
        </View>
      )}

      {/* Irrigation Status */}
      <View style={styles.irrigationCard}>
        <Text style={styles.cardTitle}>Irrigation Management</Text>
        <View style={styles.irrigationContent}>
          <Text style={styles.irrigationStatus}>
            System Status: {dashboardData.irrigationStatus.systemStatus}
          </Text>
          <Text style={styles.waterLevel}>
            Water Level: {dashboardData.irrigationStatus.waterLevel}%
          </Text>
          <Text style={styles.nextIrrigation}>
            Next Scheduled: {dashboardData.irrigationStatus.nextScheduled.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.financialCard}>
        <Text style={styles.cardTitle}>Financial Overview</Text>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Monthly Income:</Text>
          <Text style={styles.financialIncome}>
            ${dashboardData.financialSummary.monthlyIncome}
          </Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Monthly Expenses:</Text>
          <Text style={styles.financialExpense}>
            ${dashboardData.financialSummary.monthlyExpenses}
          </Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Net Profit:</Text>
          <Text style={styles.financialProfit}>
            ${dashboardData.financialSummary.netProfit}
          </Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Pending Payments:</Text>
          <Text style={styles.financialPending}>
            {dashboardData.financialSummary.pendingPayments}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('diagnostic')}>
            <Text style={styles.quickActionIcon}>📱</Text>
            <Text style={styles.quickActionText}>AI Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('weather')}>
            <Text style={styles.quickActionIcon}>🌤️</Text>
            <Text style={styles.quickActionText}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('marketplace')}>
            <Text style={styles.quickActionIcon}>🛒</Text>
            <Text style={styles.quickActionText}>Marketplace</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('records')}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('irrigation')}>
            <Text style={styles.quickActionIcon}>💧</Text>
            <Text style={styles.quickActionText}>Irrigation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate?.('finance')}>
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Finance</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Sync Component */}
      <OfflineSync onSyncComplete={() => {
        handleSyncComplete();
      }} />

      {/* Phase A Features Info */}
      <View style={styles.phaseInfoCard}>
        <Text style={styles.cardTitle}>Phase A Features Active</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✅ Mobile Navigation & Offline Storage</Text>
          <Text style={styles.featureItem}>✅ Multi-Modal AI Diagnostics</Text>
          <Text style={styles.featureItem}>✅ Crop Lifecycle Planning</Text>
          <Text style={styles.featureItem}>✅ Enhanced Livestock Management</Text>
          <Text style={styles.featureItem}>✅ Agricultural Ledger & Accounting</Text>
          <Text style={styles.featureItem}>✅ BNPL Integration</Text>
          <Text style={styles.featureItem}>✅ Microinsurance Integration</Text>
          <Text style={styles.featureItem}>✅ Push Notifications & Reminders</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  healthCard: {
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
  healthIndicator: {
    alignItems: 'center',
    marginBottom: 10,
  },
  healthScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  healthBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  healthProgress: {
    height: '100%',
    borderRadius: 4,
  },
  healthStatus: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  weatherContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
  },
  condition: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetail: {
    fontSize: 12,
    color: '#666',
  },
  irrigationCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  irrigationContent: {
    gap: 8,
  },
  irrigationStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  waterLevel: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  nextIrrigation: {
    fontSize: 14,
    color: '#666',
  },
  financialCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  financialExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  financialProfit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  financialPending: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  quickActionsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '31%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  phaseInfoCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
});
