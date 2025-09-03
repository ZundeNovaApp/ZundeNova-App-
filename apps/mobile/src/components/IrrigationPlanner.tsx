import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface IrrigationPlannerProps {
  farmId: string;
  weatherData: any;
  onScheduleUpdate: (schedule: any) => void;
}

export default function IrrigationPlanner({ farmId, weatherData, onScheduleUpdate }: IrrigationPlannerProps) {
  const [irrigationSchedule, setIrrigationSchedule] = useState<any[]>([]);
  const [waterBudget, setWaterBudget] = useState<any>(null);
  const [soilMoisture, setSoilMoisture] = useState<any>(null);

  useEffect(() => {
    generateIrrigationSchedule();
    calculateWaterBudget();
    simulateSoilMoisture();
  }, [farmId, weatherData]);

  const generateIrrigationSchedule = async () => {
    const mockSchedule = [
      {
        id: 'irr_1',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        cropArea: 'Field A - Maize',
        waterAmount: 25,
        duration: 120,
        method: 'drip',
        status: 'scheduled',
        priority: 'high'
      },
      {
        id: 'irr_2',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        cropArea: 'Field B - Tomatoes',
        waterAmount: 30,
        duration: 90,
        method: 'sprinkler',
        status: 'scheduled',
        priority: 'medium'
      },
      {
        id: 'irr_3',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        cropArea: 'Field C - Vegetables',
        waterAmount: 20,
        duration: 60,
        method: 'manual',
        status: 'scheduled',
        priority: 'low'
      }
    ];

    setIrrigationSchedule(mockSchedule);
    onScheduleUpdate(mockSchedule);

    await offlineStorageService.storeOfflineData({
      id: `irrigation_schedule_${Date.now()}`,
      type: 'farm',
      data: { farmId, schedule: mockSchedule }
    });
  };

  const calculateWaterBudget = () => {
    const totalWaterNeeded = irrigationSchedule.reduce((sum, item) => sum + item.waterAmount, 0);
    const availableWater = 500;
    const rainwaterExpected = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.rainfall, 0) || 0;

    setWaterBudget({
      totalNeeded: totalWaterNeeded,
      available: availableWater,
      rainwaterExpected,
      deficit: Math.max(0, totalWaterNeeded - availableWater - rainwaterExpected),
      efficiency: 85
    });
  };

  const simulateSoilMoisture = () => {
    setSoilMoisture({
      current: 45,
      optimal: 60,
      critical: 30,
      lastMeasured: new Date(),
      trend: 'decreasing'
    });
  };

  const executeIrrigation = async (scheduleId: string) => {
    const updatedSchedule = irrigationSchedule.map(item =>
      item.id === scheduleId ? { ...item, status: 'in_progress' } : item
    );
    setIrrigationSchedule(updatedSchedule);

    setTimeout(async () => {
      const completedSchedule = updatedSchedule.map(item =>
        item.id === scheduleId ? { ...item, status: 'completed', completedAt: new Date() } : item
      );
      setIrrigationSchedule(completedSchedule);

      await offlineStorageService.storeOfflineData({
        id: `irrigation_completed_${scheduleId}`,
        type: 'farm',
        data: { scheduleId, completedAt: new Date() }
      });

      Alert.alert('Irrigation Complete', 'Irrigation has been completed successfully!');
    }, 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Irrigation Management</Text>

      {soilMoisture && (
        <View style={styles.soilMoistureCard}>
          <Text style={styles.cardTitle}>Soil Moisture Status</Text>
          <View style={styles.moistureIndicator}>
            <View style={styles.moistureBar}>
              <View 
                style={[
                  styles.moistureLevel,
                  { 
                    width: `${(soilMoisture.current / 100) * 100}%`,
                    backgroundColor: soilMoisture.current < soilMoisture.critical ? '#dc2626' :
                                   soilMoisture.current < soilMoisture.optimal ? '#f59e0b' : '#10b981'
                  }
                ]}
              />
            </View>
            <Text style={styles.moistureText}>{soilMoisture.current}% (Target: {soilMoisture.optimal}%)</Text>
          </View>
          <Text style={styles.moistureTrend}>
            Trend: {soilMoisture.trend} • Last measured: {soilMoisture.lastMeasured.toLocaleTimeString()}
          </Text>
        </View>
      )}

      {waterBudget && (
        <View style={styles.waterBudgetCard}>
          <Text style={styles.cardTitle}>Water Budget</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Water Needed:</Text>
            <Text style={styles.budgetValue}>{waterBudget.totalNeeded}mm</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Available:</Text>
            <Text style={styles.budgetValue}>{waterBudget.available}mm</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Expected Rain:</Text>
            <Text style={styles.budgetValue}>{waterBudget.rainwaterExpected}mm</Text>
          </View>
          {waterBudget.deficit > 0 && (
            <View style={styles.budgetRow}>
              <Text style={[styles.budgetLabel, { color: '#dc2626' }]}>Water Deficit:</Text>
              <Text style={[styles.budgetValue, { color: '#dc2626' }]}>{waterBudget.deficit}mm</Text>
            </View>
          )}
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>System Efficiency:</Text>
            <Text style={styles.budgetValue}>{waterBudget.efficiency}%</Text>
          </View>
        </View>
      )}

      <View style={styles.scheduleCard}>
        <Text style={styles.cardTitle}>Irrigation Schedule</Text>
        {irrigationSchedule.map(item => (
          <View key={item.id} style={styles.scheduleItem}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleDate}>{item.date.toLocaleDateString()}</Text>
              <View style={styles.badges}>
                <Text style={[styles.priorityBadge, { color: getPriorityColor(item.priority) }]}>
                  {item.priority.toUpperCase()}
                </Text>
                <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cropArea}>{item.cropArea}</Text>
            
            <View style={styles.scheduleDetails}>
              <Text style={styles.scheduleDetail}>💧 {item.waterAmount}mm</Text>
              <Text style={styles.scheduleDetail}>⏱️ {item.duration} min</Text>
              <Text style={styles.scheduleDetail}>🚿 {item.method}</Text>
            </View>

            {item.status === 'scheduled' && (
              <TouchableOpacity
                style={styles.executeButton}
                onPress={() => executeIrrigation(item.id)}
              >
                <Text style={styles.executeButtonText}>Start Irrigation</Text>
              </TouchableOpacity>
            )}

            {item.status === 'in_progress' && (
              <View style={styles.progressIndicator}>
                <Text style={styles.progressText}>🔄 Irrigation in progress...</Text>
              </View>
            )}

            {item.status === 'completed' && (
              <View style={styles.completedIndicator}>
                <Text style={styles.completedText}>✅ Completed at {item.completedAt?.toLocaleTimeString()}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addScheduleButton}>
        <Text style={styles.addScheduleButtonText}>+ Add Irrigation Schedule</Text>
      </TouchableOpacity>
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
  soilMoistureCard: {
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
  moistureIndicator: {
    marginBottom: 10,
  },
  moistureBar: {
    height: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  moistureLevel: {
    height: '100%',
    borderRadius: 10,
  },
  moistureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  moistureTrend: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  waterBudgetCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  scheduleCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  cropArea: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scheduleDetail: {
    fontSize: 12,
    color: '#666',
  },
  executeButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressIndicator: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressText: {
    color: '#d97706',
    fontSize: 14,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  addScheduleButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addScheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
