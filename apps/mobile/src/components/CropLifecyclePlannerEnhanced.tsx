import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface CropPlan {
  id: string;
  crop_name: string;
  variety: string;
  field_id: string;
  field_name: string;
  area_hectares: number;
  planting_date: string;
  expected_harvest_date: string;
  growth_stages: GrowthStage[];
  irrigation_schedule: IrrigationEvent[];
  fertilizer_schedule: FertilizerEvent[];
  pest_management_schedule: PestManagementEvent[];
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface GrowthStage {
  id: string;
  stage_name: string;
  start_date: string;
  end_date: string;
  description: string;
  key_activities: string[];
  monitoring_points: string[];
  expected_conditions: {
    temperature_range: string;
    humidity_range: string;
    rainfall_requirement: string;
  };
}

interface IrrigationEvent {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  water_amount_liters: number;
  irrigation_type: 'drip' | 'sprinkler' | 'flood' | 'manual';
  field_section?: string;
  weather_dependent: boolean;
  status: 'scheduled' | 'completed' | 'skipped' | 'cancelled';
  actual_completion_time?: string;
  notes?: string;
}

interface FertilizerEvent {
  id: string;
  date: string;
  fertilizer_type: string;
  application_method: 'broadcast' | 'side_dress' | 'foliar' | 'fertigation';
  quantity_kg: number;
  cost_per_kg: number;
  target_nutrients: string[];
  application_instructions: string;
  safety_precautions: string[];
  weather_conditions_required: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  actual_application_date?: string;
  actual_quantity_used?: number;
  effectiveness_rating?: number;
  notes?: string;
}

interface PestManagementEvent {
  id: string;
  date: string;
  pest_type: string;
  treatment_type: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  product_name: string;
  application_rate: string;
  application_method: string;
  target_pest: string[];
  pre_harvest_interval_days: number;
  ppe_requirements: string[];
  environmental_conditions: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  actual_application_date?: string;
  effectiveness_rating?: number;
  side_effects_observed?: string[];
  notes?: string;
}

interface WeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed: number;
  conditions: string;
}

interface Reminder {
  id: string;
  crop_plan_id: string;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  type: 'irrigation' | 'fertilizer' | 'pest_management' | 'monitoring' | 'harvest';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'snoozed' | 'cancelled';
  notification_sent: boolean;
  created_at: string;
}

const CropLifecyclePlannerEnhanced: React.FC = () => {
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CropPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'irrigation' | 'fertilizer' | 'pest' | 'reminders'>('overview');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [eventType, setEventType] = useState<'irrigation' | 'fertilizer' | 'pest'>('irrigation');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCropPlannerData();
    loadWeatherData();
    loadReminders();
  }, []);

  const loadCropPlannerData = async () => {
    try {
      setLoading(true);
      const plansData = await offlineStorageService.getOfflineDataByType('crop_plans').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleCropPlans()
      );
      setCropPlans(plansData);
    } catch (error) {
      console.error('Error loading crop planner data:', error);
      setCropPlans(getSampleCropPlans());
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weatherData = await offlineStorageService.getOfflineDataByType('weather').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleWeatherData()
      );
      setWeatherData(weatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
      setWeatherData(getSampleWeatherData());
    }
  };

  const loadReminders = async () => {
    try {
      const remindersData = await offlineStorageService.getOfflineDataByType('reminders').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleReminders()
      );
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setReminders(getSampleReminders());
    }
  };

  const getSampleCropPlans = (): CropPlan[] => [
    {
      id: 'plan_001',
      crop_name: 'Maize',
      variety: 'DK 8031',
      field_id: 'field_001',
      field_name: 'North Field',
      area_hectares: 2.5,
      planting_date: '2024-03-15',
      expected_harvest_date: '2024-07-15',
      growth_stages: [
        {
          id: 'stage_001',
          stage_name: 'Germination',
          start_date: '2024-03-15',
          end_date: '2024-03-25',
          description: 'Seed germination and emergence',
          key_activities: ['Monitor soil moisture', 'Check for pests', 'Ensure proper spacing'],
          monitoring_points: ['Emergence rate', 'Soil temperature', 'Moisture levels'],
          expected_conditions: {
            temperature_range: '20-25°C',
            humidity_range: '60-80%',
            rainfall_requirement: '25-50mm'
          }
        },
        {
          id: 'stage_002',
          stage_name: 'Vegetative Growth',
          start_date: '2024-03-26',
          end_date: '2024-05-15',
          description: 'Leaf and stem development',
          key_activities: ['First fertilizer application', 'Weed control', 'Pest monitoring'],
          monitoring_points: ['Plant height', 'Leaf color', 'Pest presence'],
          expected_conditions: {
            temperature_range: '22-28°C',
            humidity_range: '65-85%',
            rainfall_requirement: '100-150mm'
          }
        }
      ],
      irrigation_schedule: [
        {
          id: 'irr_001',
          date: '2024-03-20',
          time: '06:00',
          duration_minutes: 45,
          water_amount_liters: 500,
          irrigation_type: 'drip',
          weather_dependent: true,
          status: 'scheduled'
        }
      ],
      fertilizer_schedule: [
        {
          id: 'fert_001',
          date: '2024-04-01',
          fertilizer_type: 'NPK 17-17-17',
          application_method: 'broadcast',
          quantity_kg: 50,
          cost_per_kg: 1.2,
          target_nutrients: ['Nitrogen', 'Phosphorus', 'Potassium'],
          application_instructions: 'Apply evenly across field before rain or irrigation',
          safety_precautions: ['Wear gloves', 'Avoid windy conditions'],
          weather_conditions_required: 'No rain expected for 4 hours after application',
          status: 'scheduled'
        }
      ],
      pest_management_schedule: [
        {
          id: 'pest_001',
          date: '2024-04-15',
          pest_type: 'Fall Armyworm',
          treatment_type: 'biological',
          product_name: 'Bt Spray',
          application_rate: '2ml per liter',
          application_method: 'Foliar spray',
          target_pest: ['Fall Armyworm', 'Cutworm'],
          pre_harvest_interval_days: 7,
          ppe_requirements: ['Protective clothing', 'Face mask'],
          environmental_conditions: 'Apply in evening, no wind',
          status: 'scheduled'
        }
      ],
      status: 'active',
      created_at: '2024-03-01T08:00:00Z',
      updated_at: '2024-03-10T14:30:00Z'
    }
  ];

  const getSampleWeatherData = (): WeatherData[] => [
    {
      date: '2024-03-15',
      temperature_max: 28,
      temperature_min: 18,
      humidity: 75,
      rainfall_mm: 5,
      wind_speed: 12,
      conditions: 'Partly cloudy'
    },
    {
      date: '2024-03-16',
      temperature_max: 30,
      temperature_min: 20,
      humidity: 70,
      rainfall_mm: 0,
      wind_speed: 8,
      conditions: 'Sunny'
    }
  ];

  const getSampleReminders = (): Reminder[] => [
    {
      id: 'rem_001',
      crop_plan_id: 'plan_001',
      title: 'First Irrigation Due',
      description: 'Apply 500L water using drip irrigation system',
      due_date: '2024-03-20',
      due_time: '06:00',
      type: 'irrigation',
      priority: 'high',
      status: 'pending',
      notification_sent: false,
      created_at: '2024-03-15T08:00:00Z'
    },
    {
      id: 'rem_002',
      crop_plan_id: 'plan_001',
      title: 'NPK Fertilizer Application',
      description: 'Apply 50kg NPK 17-17-17 fertilizer',
      due_date: '2024-04-01',
      due_time: '07:00',
      type: 'fertilizer',
      priority: 'medium',
      status: 'pending',
      notification_sent: false,
      created_at: '2024-03-15T08:00:00Z'
    }
  ];

  const saveCropPlannerData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'crop_plans_data',
        type: 'crop_plans' as any,
        data: cropPlans
      });
      await offlineStorageService.storeOfflineData({
        id: 'reminders_data',
        type: 'reminders' as any,
        data: reminders
      });
    } catch (error) {
      console.error('Error saving crop planner data:', error);
    }
  };

  const createNewPlan = async (planData: Partial<CropPlan>) => {
    const newPlan: CropPlan = {
      id: `plan_${Date.now()}`,
      crop_name: planData.crop_name || '',
      variety: planData.variety || '',
      field_id: planData.field_id || '',
      field_name: planData.field_name || '',
      area_hectares: planData.area_hectares || 0,
      planting_date: planData.planting_date || '',
      expected_harvest_date: planData.expected_harvest_date || '',
      growth_stages: planData.growth_stages || [],
      irrigation_schedule: planData.irrigation_schedule || [],
      fertilizer_schedule: planData.fertilizer_schedule || [],
      pest_management_schedule: planData.pest_management_schedule || [],
      status: 'planned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCropPlans([...cropPlans, newPlan]);
    await saveCropPlannerData();
    Alert.alert('Success', 'New crop plan created successfully');
  };

  const completeEvent = async (planId: string, eventType: string, eventId: string) => {
    const updatedPlans = cropPlans.map(plan => {
      if (plan.id === planId) {
        const updatedPlan = { ...plan };
        
        if (eventType === 'irrigation') {
          updatedPlan.irrigation_schedule = plan.irrigation_schedule.map(event =>
            event.id === eventId 
              ? { ...event, status: 'completed' as const, actual_completion_time: new Date().toISOString() }
              : event
          );
        } else if (eventType === 'fertilizer') {
          updatedPlan.fertilizer_schedule = plan.fertilizer_schedule.map(event =>
            event.id === eventId 
              ? { ...event, status: 'completed' as const, actual_application_date: new Date().toISOString().split('T')[0] }
              : event
          );
        } else if (eventType === 'pest') {
          updatedPlan.pest_management_schedule = plan.pest_management_schedule.map(event =>
            event.id === eventId 
              ? { ...event, status: 'completed' as const, actual_application_date: new Date().toISOString().split('T')[0] }
              : event
          );
        }
        
        return updatedPlan;
      }
      return plan;
    });

    setCropPlans(updatedPlans);
    await saveCropPlannerData();
    Alert.alert('Event Completed', 'Event has been marked as completed');
  };

  const getCalendarMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};
    
    if (selectedPlan) {
      selectedPlan.irrigation_schedule.forEach(event => {
        markedDates[event.date] = {
          ...markedDates[event.date],
          dots: [...(markedDates[event.date]?.dots || []), { color: '#3B82F6' }]
        };
      });
      
      selectedPlan.fertilizer_schedule.forEach(event => {
        markedDates[event.date] = {
          ...markedDates[event.date],
          dots: [...(markedDates[event.date]?.dots || []), { color: '#10B981' }]
        };
      });
      
      selectedPlan.pest_management_schedule.forEach(event => {
        markedDates[event.date] = {
          ...markedDates[event.date],
          dots: [...(markedDates[event.date]?.dots || []), { color: '#F59E0B' }]
        };
      });
    }
    
    return markedDates;
  };

  const renderOverview = () => {
    if (!selectedPlan) return null;

    const upcomingEvents = [
      ...selectedPlan.irrigation_schedule.filter(e => e.status === 'scheduled').map(e => ({ ...e, type: 'irrigation' })),
      ...selectedPlan.fertilizer_schedule.filter(e => e.status === 'scheduled').map(e => ({ ...e, type: 'fertilizer' })),
      ...selectedPlan.pest_management_schedule.filter(e => e.status === 'scheduled').map(e => ({ ...e, type: 'pest' }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{selectedPlan.crop_name} - {selectedPlan.variety}</Text>
          <Text style={styles.planField}>{selectedPlan.field_name} ({selectedPlan.area_hectares} ha)</Text>
          <View style={styles.planDates}>
            <Text style={styles.dateText}>Planted: {selectedPlan.planting_date}</Text>
            <Text style={styles.dateText}>Harvest: {selectedPlan.expected_harvest_date}</Text>
          </View>
        </View>

        <View style={styles.currentStageContainer}>
          <Text style={styles.sectionTitle}>Current Growth Stage</Text>
          {selectedPlan.growth_stages.length > 0 && (
            <View style={styles.stageCard}>
              <Text style={styles.stageName}>{selectedPlan.growth_stages[0].stage_name}</Text>
              <Text style={styles.stageDescription}>{selectedPlan.growth_stages[0].description}</Text>
              <Text style={styles.stageDates}>
                {selectedPlan.growth_stages[0].start_date} - {selectedPlan.growth_stages[0].end_date}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.upcomingEventsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents.map((event, index) => (
            <View key={`${event.type}_${event.id}`} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventType}>{event.type.toUpperCase()}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
              <Text style={styles.eventDescription}>
                {event.type === 'irrigation' && `${(event as any).water_amount_liters}L - ${(event as any).irrigation_type}`}
                {event.type === 'fertilizer' && `${(event as any).quantity_kg}kg ${(event as any).fertilizer_type}`}
                {event.type === 'pest' && `${(event as any).product_name} for ${(event as any).target_pest?.join(', ')}`}
              </Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => completeEvent(selectedPlan.id, event.type, event.id)}
              >
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.weatherContainer}>
          <Text style={styles.sectionTitle}>Weather Forecast</Text>
          {weatherData.slice(0, 3).map(weather => (
            <View key={weather.date} style={styles.weatherCard}>
              <Text style={styles.weatherDate}>{weather.date}</Text>
              <Text style={styles.weatherTemp}>{weather.temperature_min}°C - {weather.temperature_max}°C</Text>
              <Text style={styles.weatherConditions}>{weather.conditions}</Text>
              <Text style={styles.weatherRain}>Rain: {weather.rainfall_mm}mm</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderCalendar = () => (
    <View style={styles.tabContent}>
      <Calendar
        markedDates={getCalendarMarkedDates()}
        markingType="multi-dot"
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#228B22',
          todayTextColor: '#228B22',
          arrowColor: '#228B22',
        }}
      />
      
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Irrigation</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Fertilizer</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Pest Management</Text>
        </View>
      </View>
    </View>
  );

  const renderReminders = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Active Reminders</Text>
      {reminders.filter(r => r.status === 'pending').map(reminder => (
        <View key={reminder.id} style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(reminder.priority) }]}>
              <Text style={styles.priorityText}>{reminder.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.reminderDescription}>{reminder.description}</Text>
          <Text style={styles.reminderDue}>Due: {reminder.due_date} at {reminder.due_time}</Text>
          <View style={styles.reminderActions}>
            <TouchableOpacity style={styles.snoozeButton}>
              <Text style={styles.snoozeButtonText}>Snooze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeReminderButton}>
              <Text style={styles.completeReminderButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Lifecycle Planner</Text>
        <Text style={styles.subtitle}>Smart farming schedule & reminders</Text>
      </View>

      <View style={styles.planSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cropPlans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planTab, selectedPlan?.id === plan.id && styles.activePlanTab]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Text style={[styles.planTabText, selectedPlan?.id === plan.id && styles.activePlanTabText]}>
                {plan.crop_name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPlanButton} onPress={() => setShowPlanModal(true)}>
            <Text style={styles.addPlanButtonText}>+ Add Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {selectedPlan && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
              Calendar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reminders' && styles.activeTab]}
            onPress={() => setActiveTab('reminders')}
          >
            <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>
              Reminders ({reminders.filter(r => r.status === 'pending').length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedPlan && activeTab === 'overview' && renderOverview()}
      {selectedPlan && activeTab === 'calendar' && renderCalendar()}
      {selectedPlan && activeTab === 'reminders' && renderReminders()}
      
      {!selectedPlan && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Select a crop plan to view details</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  planSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  planTab: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activePlanTab: {
    backgroundColor: '#228B22',
  },
  planTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activePlanTabText: {
    color: '#FFFFFF',
  },
  addPlanButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  addPlanButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  planHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  planField: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  planDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  currentStageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  stageCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#228B22',
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stageDates: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  upcomingEventsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#228B22',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  weatherContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  weatherTemp: {
    fontSize: 14,
    color: '#374151',
  },
  weatherConditions: {
    fontSize: 12,
    color: '#6B7280',
  },
  weatherRain: {
    fontSize: 12,
    color: '#3B82F6',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  reminderDue: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  snoozeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  snoozeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  completeReminderButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeReminderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default CropLifecyclePlannerEnhanced;
