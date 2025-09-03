import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface EnhancedDashboardProps {
  farmId: string;
  onNavigate: (screen: string) => void;
}

export default function EnhancedDashboard({ farmId, onNavigate }: EnhancedDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadAlerts();
  }, [farmId]);

  const loadDashboardData = async () => {
    const mockData = {
      farmHealth: 85,
      activeAlerts: 3,
      upcomingTasks: 5,
      weatherStatus: 'favorable',
      cropStatus: {
        healthy: 4,
        needsAttention: 1,
        critical: 0
      },
      livestockStatus: {
        healthy: 120,
        needsAttention: 5,
        sick: 0
      },
      financialSummary: {
        monthlyIncome: 2450,
        monthlyExpenses: 1850,
        netProfit: 600
      }
    };

    setDashboardData(mockData);

    await offlineStorageService.storeOfflineData({
      id: `dashboard_${Date.now()}`,
      type: 'farm',
      data: mockData
    });
  };

  const loadAlerts = async () => {
    const mockAlerts = [
      {
        id: 'alert_1',
        type: 'weather',
        priority: 'high',
        title: 'Heavy Rain Expected',
        message: 'Protect your crops from excessive rainfall in the next 24 hours',
        timestamp: new Date(),
        actionRequired: true
      },
      {
        id: 'alert_2',
        type: 'pest',
        priority: 'medium',
        title: 'Pest Activity Detected',
        message: 'Increased aphid activity in tomato field. Consider treatment.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actionRequired: true
      },
      {
        id: 'alert_3',
        type: 'irrigation',
        priority: 'low',
        title: 'Irrigation Reminder',
        message: 'Scheduled irrigation for Field A in 2 hours',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actionRequired: false
      }
    ];

    setAlerts(mockAlerts);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#dc2626';
  };

  if (!dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Farm Dashboard</Text>

      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>Farm Health Score</Text>
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
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.activeAlerts}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.upcomingTasks}</Text>
          <Text style={styles.statLabel}>Upcoming Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.cropStatus.healthy}</Text>
          <Text style={styles.statLabel}>Healthy Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData.livestockStatus.healthy}</Text>
          <Text style={styles.statLabel}>Healthy Animals</Text>
        </View>
      </View>

      <View style={styles.alertsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => onNavigate('alerts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {alerts.slice(0, 3).map(alert => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={[styles.alertIndicator, { backgroundColor: getPriorityColor(alert.priority) }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.timestamp.toLocaleTimeString()}</Text>
            </View>
            {alert.actionRequired && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Act</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.financialCard}>
        <Text style={styles.cardTitle}>Financial Summary (This Month)</Text>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Income:</Text>
          <Text style={styles.financialIncome}>${dashboardData.financialSummary.monthlyIncome}</Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Expenses:</Text>
          <Text style={styles.financialExpense}>${dashboardData.financialSummary.monthlyExpenses}</Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Net Profit:</Text>
          <Text style={styles.financialProfit}>${dashboardData.financialSummary.netProfit}</Text>
        </View>
      </View>

      <View style={styles.quickActionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate('ai-scan')}>
            <Text style={styles.quickActionIcon}>🤖</Text>
            <Text style={styles.quickActionText}>AI Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate('weather')}>
            <Text style={styles.quickActionIcon}>🌤️</Text>
            <Text style={styles.quickActionText}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate('marketplace')}>
            <Text style={styles.quickActionIcon}>🛒</Text>
            <Text style={styles.quickActionText}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => onNavigate('expert')}>
            <Text style={styles.quickActionIcon}>👨‍⚕️</Text>
            <Text style={styles.quickActionText}>Expert</Text>
          </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
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
  },
  healthProgress: {
    height: '100%',
    borderRadius: 4,
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
  alertsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 10,
    color: '#999',
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    width: '48%',
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
  },
});
