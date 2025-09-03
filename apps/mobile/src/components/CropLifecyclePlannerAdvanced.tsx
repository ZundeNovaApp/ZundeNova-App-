import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { notificationService } from '../services/NotificationService';
import { weatherService } from '../services/WeatherService';
import { offlineStorageService } from '../services/OfflineStorageService';

interface CropActivity {
  id: string;
  type: 'planting' | 'fertilizer' | 'irrigation' | 'spraying' | 'harvest';
  title: string;
  description: string;
  scheduledDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  weatherDependent: boolean;
  reminderSet: boolean;
}

interface CropPlan {
  id: string;
  cropType: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  fieldId: string;
  activities: CropActivity[];
  status: 'planned' | 'active' | 'completed';
}

interface CropLifecyclePlannerAdvancedProps {
  farmId: string;
  onPlanUpdate: (plan: CropPlan) => void;
}

export default function CropLifecyclePlannerAdvanced({ 
  farmId, 
  onPlanUpdate 
}: CropLifecyclePlannerAdvancedProps) {
  const [currentPlan, setCurrentPlan] = useState<CropPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [weatherData, setWeatherData] = useState<any>(null);
  const [view, setView] = useState<'calendar' | 'activities' | 'create'>('calendar');

  useEffect(() => {
    loadExistingPlan();
    loadWeatherData();
  }, [farmId]);

  useEffect(() => {
    if (currentPlan) {
      updateMarkedDates();
      scheduleReminders();
    }
  }, [currentPlan]);

  const loadExistingPlan = async () => {
    try {
      const offlineData = await offlineStorageService.getOfflineDataByType('crop_plan');
      const existingPlan = offlineData.find(data => data.data.farmId === farmId);
      
      if (existingPlan) {
        setCurrentPlan(existingPlan.data);
      }
    } catch (error) {
      console.error('Failed to load existing plan:', error);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weather = await weatherService.getCurrentWeather();
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const updateMarkedDates = () => {
    if (!currentPlan) return;

    const marked: any = {};
    
    currentPlan.activities.forEach(activity => {
      const color = getActivityColor(activity.type);
      marked[activity.scheduledDate] = {
        marked: true,
        dotColor: color,
        selectedColor: color,
        customStyles: {
          container: {
            backgroundColor: activity.completed ? '#10B981' : color,
            borderRadius: 8,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    });

    setMarkedDates(marked);
  };

  const getActivityColor = (type: string) => {
    const colors = {
      planting: '#228B22',
      fertilizer: '#F59E0B',
      irrigation: '#3B82F6',
      spraying: '#EF4444',
      harvest: '#10B981',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const createDefaultPlan = (cropType: string, plantingDate: string) => {
    const plantDate = new Date(plantingDate);
    const activities: CropActivity[] = [];

    const cropTemplates = {
      maize: [
        { type: 'planting', title: 'Plant Seeds', days: 0, priority: 'high' },
        { type: 'fertilizer', title: 'First Fertilizer Application', days: 14, priority: 'high' },
        { type: 'irrigation', title: 'First Irrigation', days: 7, priority: 'medium' },
        { type: 'fertilizer', title: 'Side Dressing', days: 45, priority: 'medium' },
        { type: 'spraying', title: 'Pest Control', days: 30, priority: 'medium' },
        { type: 'irrigation', title: 'Flowering Stage Irrigation', days: 60, priority: 'high' },
        { type: 'harvest', title: 'Harvest', days: 120, priority: 'high' },
      ],
      tomato: [
        { type: 'planting', title: 'Transplant Seedlings', days: 0, priority: 'high' },
        { type: 'irrigation', title: 'Initial Watering', days: 1, priority: 'high' },
        { type: 'fertilizer', title: 'Starter Fertilizer', days: 7, priority: 'high' },
        { type: 'spraying', title: 'Disease Prevention', days: 21, priority: 'medium' },
        { type: 'fertilizer', title: 'Flowering Fertilizer', days: 35, priority: 'medium' },
        { type: 'harvest', title: 'First Harvest', days: 75, priority: 'high' },
      ],
    };

    const template = cropTemplates[cropType as keyof typeof cropTemplates] || cropTemplates.maize;

    template.forEach((activity, index) => {
      const activityDate = new Date(plantDate);
      activityDate.setDate(activityDate.getDate() + activity.days);

      activities.push({
        id: `activity_${Date.now()}_${index}`,
        type: activity.type as any,
        title: activity.title,
        description: `${activity.title} for ${cropType}`,
        scheduledDate: activityDate.toISOString().split('T')[0],
        completed: false,
        priority: activity.priority as any,
        weatherDependent: activity.type === 'irrigation' || activity.type === 'spraying',
        reminderSet: false,
      });
    });

    const harvestDate = new Date(plantDate);
    harvestDate.setDate(harvestDate.getDate() + (template[template.length - 1]?.days || 120));

    return {
      id: `plan_${Date.now()}`,
      cropType,
      variety: 'Standard',
      plantingDate,
      expectedHarvestDate: harvestDate.toISOString().split('T')[0],
      fieldId: `field_${farmId}`,
      activities,
      status: 'planned' as const,
    };
  };

  const scheduleReminders = async () => {
    if (!currentPlan) return;

    for (const activity of currentPlan.activities) {
      if (!activity.completed && !activity.reminderSet) {
        const activityDate = new Date(activity.scheduledDate);
        const reminderDate = new Date(activityDate);
        reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before

        if (reminderDate > new Date()) {
          await notificationService.scheduleActivityReminder(
            activity.id,
            activity.title,
            activity.description,
            reminderDate
          );
          
          activity.reminderSet = true;
        }
      }
    }

    await savePlan(currentPlan);
  };

  const savePlan = async (plan: CropPlan) => {
    try {
      await offlineStorageService.storeOfflineData({
        id: plan.id,
        type: 'crop_plan',
        data: { ...plan, farmId },
      });
      
      setCurrentPlan(plan);
      onPlanUpdate(plan);
    } catch (error) {
      console.error('Failed to save plan:', error);
      Alert.alert('Error', 'Failed to save crop plan');
    }
  };

  const completeActivity = async (activityId: string) => {
    if (!currentPlan) return;

    const updatedPlan = {
      ...currentPlan,
      activities: currentPlan.activities.map(activity =>
        activity.id === activityId
          ? { ...activity, completed: true }
          : activity
      ),
    };

    await savePlan(updatedPlan);
    Alert.alert('Success', 'Activity marked as completed!');
  };

  const checkWeatherSuitability = (activity: CropActivity) => {
    if (!weatherData || !activity.weatherDependent) return true;

    const today = new Date().toISOString().split('T')[0];
    if (activity.scheduledDate !== today) return true;

    if (activity.type === 'irrigation' && weatherData.precipitation > 5) {
      return false; // Don't irrigate if it's raining
    }
    
    if (activity.type === 'spraying' && weatherData.windSpeed > 15) {
      return false; // Don't spray in high winds
    }

    return true;
  };

  const renderCalendarView = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Lifecycle Calendar</Text>
        {currentPlan && (
          <Text style={styles.subtitle}>
            {currentPlan.cropType} - {currentPlan.variety}
          </Text>
        )}
      </View>

      <Calendar
        current={selectedDate || new Date().toISOString().split('T')[0]}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="custom"
        theme={{
          selectedDayBackgroundColor: '#228B22',
          todayTextColor: '#228B22',
          arrowColor: '#228B22',
        }}
      />

      {selectedDate && (
        <View style={styles.selectedDateInfo}>
          <Text style={styles.selectedDateTitle}>
            Activities for {selectedDate}
          </Text>
          {currentPlan?.activities
            .filter(activity => activity.scheduledDate === selectedDate)
            .map(activity => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(activity.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{activity.priority}</Text>
                  </View>
                </View>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                
                {activity.weatherDependent && !checkWeatherSuitability(activity) && (
                  <Text style={styles.weatherWarning}>
                    ⚠️ Weather conditions not suitable
                  </Text>
                )}
                
                {!activity.completed && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => completeActivity(activity.id)}
                  >
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setView('activities')}
        >
          <Text style={styles.actionButtonText}>View All Activities</Text>
        </TouchableOpacity>
        
        {!currentPlan && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setView('create')}
          >
            <Text style={styles.actionButtonText}>Create Plan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  };

  const renderActivitiesView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Activities</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setView('calendar')}
        >
          <Text style={styles.backButtonText}>← Back to Calendar</Text>
        </TouchableOpacity>
      </View>

      {currentPlan?.activities.map(activity => (
        <View key={activity.id} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDate}>{activity.scheduledDate}</Text>
          </View>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          
          <View style={styles.activityMeta}>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(activity.priority) }
            ]}>
              <Text style={styles.priorityText}>{activity.priority}</Text>
            </View>
            
            {activity.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✅ Completed</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCreateView = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Crop Plan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setView('calendar')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.createForm}>
        <Text style={styles.formLabel}>Select Crop Type:</Text>
        <View style={styles.cropButtons}>
          {['maize', 'tomato', 'beans', 'cabbage'].map(crop => (
            <TouchableOpacity
              key={crop}
              style={styles.cropButton}
              onPress={() => {
                const today = new Date().toISOString().split('T')[0];
                const plan = createDefaultPlan(crop, today);
                savePlan(plan);
                setView('calendar');
              }}
            >
              <Text style={styles.cropButtonText}>
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <>
      {view === 'calendar' && renderCalendarView()}
      {view === 'activities' && renderActivitiesView()}
      {view === 'create' && renderCreateView()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  selectedDateInfo: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weatherWarning: {
    color: '#F59E0B',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#10B981',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  backButtonText: {
    color: '#228B22',
    fontSize: 14,
    fontWeight: '600',
  },
  createForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cropButtons: {
    gap: 15,
  },
  cropButton: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  cropButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
