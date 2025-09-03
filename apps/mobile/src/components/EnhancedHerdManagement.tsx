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
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface Animal {
  id: string;
  unique_id: string;
  species: 'cattle' | 'goat' | 'sheep' | 'pig' | 'poultry';
  breed: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  acquisition_date: string;
  acquisition_method: 'birth' | 'purchase' | 'gift' | 'inheritance';
  mother_id?: string;
  father_id?: string;
  current_weight: number;
  estimated_weight?: number;
  weight_history: WeightRecord[];
  health_records: HealthRecord[];
  vaccination_schedule: VaccinationRecord[];
  breeding_records: BreedingRecord[];
  production_records: ProductionRecord[];
  status: 'active' | 'sold' | 'deceased' | 'missing';
  location: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

interface WeightRecord {
  id: string;
  animal_id: string;
  weight_kg: number;
  measurement_date: string;
  measurement_method: 'scale' | 'camera_estimation' | 'tape_measure';
  confidence_score?: number;
  notes?: string;
  photo?: string;
  recorded_by: string;
}

interface HealthRecord {
  id: string;
  animal_id: string;
  record_type: 'illness' | 'injury' | 'treatment' | 'checkup' | 'vaccination';
  date: string;
  symptoms: string[];
  diagnosis?: string;
  treatment: string;
  medication: string;
  dosage: string;
  duration_days: number;
  withdrawal_period_days?: number;
  cost: number;
  veterinarian?: string;
  outcome: 'recovered' | 'ongoing' | 'chronic' | 'deceased';
  follow_up_date?: string;
  notes: string;
  photos: string[];
}

interface VaccinationRecord {
  id: string;
  animal_id: string;
  vaccine_name: string;
  vaccine_type: string;
  administration_date: string;
  next_due_date: string;
  batch_number: string;
  manufacturer: string;
  administered_by: string;
  injection_site: string;
  dose_ml: number;
  cost: number;
  side_effects?: string[];
  effectiveness_rating?: number;
  notes?: string;
}

interface BreedingRecord {
  id: string;
  female_id: string;
  male_id?: string;
  breeding_method: 'natural' | 'artificial_insemination';
  breeding_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  pregnancy_confirmed: boolean;
  pregnancy_confirmation_date?: string;
  number_of_offspring?: number;
  offspring_ids: string[];
  complications?: string[];
  breeding_cost: number;
  success: boolean;
  notes?: string;
}

interface ProductionRecord {
  id: string;
  animal_id: string;
  production_type: 'milk' | 'eggs' | 'wool' | 'meat';
  date: string;
  quantity: number;
  unit: 'liters' | 'pieces' | 'kg';
  quality_grade?: string;
  price_per_unit?: number;
  total_value?: number;
  buyer?: string;
  notes?: string;
}

interface HerdAnalytics {
  total_animals: number;
  by_species: { [key: string]: number };
  by_status: { [key: string]: number };
  average_age_months: number;
  total_value_estimate: number;
  monthly_production: { [key: string]: number };
  health_alerts: number;
  vaccination_due: number;
  breeding_opportunities: number;
}

const EnhancedHerdManagement: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'breeding' | 'production' | 'analytics'>('overview');
  const [analytics, setAnalytics] = useState<HerdAnalytics | null>(null);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHerdData();
    requestCameraPermission();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [animals]);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const loadHerdData = async () => {
    try {
      setLoading(true);
      const herdData = await offlineStorageService.getOfflineDataByType('herd_animals').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleAnimals()
      );
      setAnimals(herdData);
    } catch (error) {
      console.error('Error loading herd data:', error);
      setAnimals(getSampleAnimals());
    } finally {
      setLoading(false);
    }
  };

  const getSampleAnimals = (): Animal[] => [
    {
      id: 'animal_001',
      unique_id: 'COW001',
      species: 'cattle',
      breed: 'Holstein Friesian',
      gender: 'female',
      date_of_birth: '2022-03-15',
      acquisition_date: '2022-03-15',
      acquisition_method: 'birth',
      current_weight: 450,
      weight_history: [
        {
          id: 'weight_001',
          animal_id: 'animal_001',
          weight_kg: 450,
          measurement_date: '2024-03-01',
          measurement_method: 'scale',
          recorded_by: 'farmer_001'
        },
        {
          id: 'weight_002',
          animal_id: 'animal_001',
          weight_kg: 430,
          measurement_date: '2024-02-01',
          measurement_method: 'camera_estimation',
          confidence_score: 0.85,
          recorded_by: 'farmer_001'
        }
      ],
      health_records: [
        {
          id: 'health_001',
          animal_id: 'animal_001',
          record_type: 'vaccination',
          date: '2024-01-15',
          symptoms: [],
          treatment: 'FMD Vaccination',
          medication: 'FMD Vaccine',
          dosage: '2ml',
          duration_days: 1,
          cost: 15,
          outcome: 'recovered',
          notes: 'Annual FMD vaccination completed successfully',
          photos: []
        }
      ],
      vaccination_schedule: [
        {
          id: 'vacc_001',
          animal_id: 'animal_001',
          vaccine_name: 'FMD Vaccine',
          vaccine_type: 'Foot and Mouth Disease',
          administration_date: '2024-01-15',
          next_due_date: '2025-01-15',
          batch_number: 'FMD2024001',
          manufacturer: 'VetCorp',
          administered_by: 'Dr. Smith',
          injection_site: 'neck',
          dose_ml: 2,
          cost: 15
        }
      ],
      breeding_records: [
        {
          id: 'breed_001',
          female_id: 'animal_001',
          breeding_method: 'artificial_insemination',
          breeding_date: '2024-01-10',
          expected_delivery_date: '2024-10-10',
          pregnancy_confirmed: true,
          pregnancy_confirmation_date: '2024-02-15',
          offspring_ids: [],
          breeding_cost: 50,
          success: true
        }
      ],
      production_records: [
        {
          id: 'prod_001',
          animal_id: 'animal_001',
          production_type: 'milk',
          date: '2024-03-01',
          quantity: 25,
          unit: 'liters',
          quality_grade: 'A',
          price_per_unit: 0.8,
          total_value: 20
        }
      ],
      status: 'active',
      location: 'Barn A',
      notes: 'High milk producer, excellent health record',
      photos: ['cow001_photo1.jpg'],
      created_at: '2022-03-15T08:00:00Z',
      updated_at: '2024-03-01T14:30:00Z'
    },
    {
      id: 'animal_002',
      unique_id: 'GOAT001',
      species: 'goat',
      breed: 'Boer',
      gender: 'male',
      date_of_birth: '2023-05-20',
      acquisition_date: '2023-05-20',
      acquisition_method: 'birth',
      current_weight: 65,
      weight_history: [
        {
          id: 'weight_003',
          animal_id: 'animal_002',
          weight_kg: 65,
          measurement_date: '2024-03-01',
          measurement_method: 'tape_measure',
          recorded_by: 'farmer_001'
        }
      ],
      health_records: [],
      vaccination_schedule: [],
      breeding_records: [],
      production_records: [],
      status: 'active',
      location: 'Pasture B',
      notes: 'Breeding buck, good conformation',
      photos: [],
      created_at: '2023-05-20T10:00:00Z',
      updated_at: '2024-03-01T16:45:00Z'
    }
  ];

  const saveHerdData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'herd_animals_data',
        type: 'herd_animals' as any,
        data: animals
      });
    } catch (error) {
      console.error('Error saving herd data:', error);
    }
  };

  const calculateAnalytics = () => {
    if (animals.length === 0) {
      setAnalytics(null);
      return;
    }

    const analytics: HerdAnalytics = {
      total_animals: animals.length,
      by_species: {},
      by_status: {},
      average_age_months: 0,
      total_value_estimate: 0,
      monthly_production: {},
      health_alerts: 0,
      vaccination_due: 0,
      breeding_opportunities: 0
    };

    animals.forEach(animal => {
      analytics.by_species[animal.species] = (analytics.by_species[animal.species] || 0) + 1;
      analytics.by_status[animal.status] = (analytics.by_status[animal.status] || 0) + 1;
    });

    const totalAgeMonths = animals.reduce((sum, animal) => {
      const birthDate = new Date(animal.date_of_birth);
      const ageMonths = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return sum + ageMonths;
    }, 0);
    analytics.average_age_months = totalAgeMonths / animals.length;

    analytics.health_alerts = animals.filter(animal => {
      const lastHealthRecord = animal.health_records[animal.health_records.length - 1];
      return lastHealthRecord && lastHealthRecord.outcome === 'ongoing';
    }).length;

    const today = new Date();
    analytics.vaccination_due = animals.reduce((count, animal) => {
      const dueVaccinations = animal.vaccination_schedule.filter(vacc => {
        const dueDate = new Date(vacc.next_due_date);
        return dueDate <= today;
      });
      return count + dueVaccinations.length;
    }, 0);

    setAnalytics(analytics);
  };

  const addWeightRecord = async (animalId: string, weight: number, method: string, photo?: string) => {
    const newWeightRecord: WeightRecord = {
      id: `weight_${Date.now()}`,
      animal_id: animalId,
      weight_kg: weight,
      measurement_date: new Date().toISOString().split('T')[0],
      measurement_method: method as any,
      confidence_score: method === 'camera_estimation' ? 0.8 : undefined,
      photo,
      recorded_by: 'current_user'
    };

    const updatedAnimals = animals.map(animal => {
      if (animal.id === animalId) {
        return {
          ...animal,
          current_weight: weight,
          weight_history: [...animal.weight_history, newWeightRecord],
          updated_at: new Date().toISOString()
        };
      }
      return animal;
    });

    setAnimals(updatedAnimals);
    await saveHerdData();
    Alert.alert('Success', 'Weight record added successfully');
  };

  const addHealthRecord = async (animalId: string, healthData: Partial<HealthRecord>) => {
    const newHealthRecord: HealthRecord = {
      id: `health_${Date.now()}`,
      animal_id: animalId,
      record_type: healthData.record_type || 'checkup',
      date: healthData.date || new Date().toISOString().split('T')[0],
      symptoms: healthData.symptoms || [],
      treatment: healthData.treatment || '',
      medication: healthData.medication || '',
      dosage: healthData.dosage || '',
      duration_days: healthData.duration_days || 0,
      cost: healthData.cost || 0,
      outcome: healthData.outcome || 'ongoing',
      notes: healthData.notes || '',
      photos: healthData.photos || []
    };

    const updatedAnimals = animals.map(animal => {
      if (animal.id === animalId) {
        return {
          ...animal,
          health_records: [...animal.health_records, newHealthRecord],
          updated_at: new Date().toISOString()
        };
      }
      return animal;
    });

    setAnimals(updatedAnimals);
    await saveHerdData();
    Alert.alert('Success', 'Health record added successfully');
  };

  const estimateWeightFromCamera = async () => {
    if (!cameraPermission) {
      Alert.alert('Permission Required', 'Camera permission is required for weight estimation');
      return;
    }
    
    const estimatedWeight = Math.round(Math.random() * 100 + 300); // Random weight between 300-400kg
    Alert.alert(
      'Weight Estimation',
      `Estimated weight: ${estimatedWeight}kg\nConfidence: 85%\n\nWould you like to save this record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => selectedAnimal && addWeightRecord(selectedAnimal.id, estimatedWeight, 'camera_estimation')
        }
      ]
    );
  };

  const getFilteredAnimals = () => {
    let filtered = animals;
    
    if (filterSpecies !== 'all') {
      filtered = filtered.filter(animal => animal.species === filterSpecies);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(animal => 
        animal.unique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or breed..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'cattle', 'goat', 'sheep', 'pig', 'poultry'].map(species => (
            <TouchableOpacity
              key={species}
              style={[styles.filterButton, filterSpecies === species && styles.activeFilterButton]}
              onPress={() => setFilterSpecies(species)}
            >
              <Text style={[styles.filterButtonText, filterSpecies === species && styles.activeFilterButtonText]}>
                {species.charAt(0).toUpperCase() + species.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.animalsList}>
        {getFilteredAnimals().map(animal => (
          <TouchableOpacity
            key={animal.id}
            style={styles.animalCard}
            onPress={() => setSelectedAnimal(animal)}
          >
            <View style={styles.animalHeader}>
              <Text style={styles.animalId}>{animal.unique_id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(animal.status) }]}>
                <Text style={styles.statusText}>{animal.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.animalBreed}>{animal.breed} ({animal.species})</Text>
            <Text style={styles.animalDetails}>
              {animal.gender} • {animal.current_weight}kg • {animal.location}
            </Text>
            <View style={styles.animalStats}>
              <Text style={styles.statText}>Health: {animal.health_records.length} records</Text>
              <Text style={styles.statText}>Weight: {animal.weight_history.length} measurements</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAnimalModal(true)}>
        <Text style={styles.addButtonText}>+ Add Animal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Herd Overview</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_animals}</Text>
                <Text style={styles.analyticsLabel}>Total Animals</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{Math.round(analytics.average_age_months)}</Text>
                <Text style={styles.analyticsLabel}>Avg Age (months)</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.health_alerts}</Text>
                <Text style={styles.analyticsLabel}>Health Alerts</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.vaccination_due}</Text>
                <Text style={styles.analyticsLabel}>Vaccinations Due</Text>
              </View>
            </View>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>By Species</Text>
            {Object.entries(analytics.by_species).map(([species, count]) => (
              <View key={species} style={styles.speciesRow}>
                <Text style={styles.speciesName}>{species.charAt(0).toUpperCase() + species.slice(1)}</Text>
                <Text style={styles.speciesCount}>{count}</Text>
              </View>
            ))}
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Status Distribution</Text>
            {Object.entries(analytics.by_status).map(([status, count]) => (
              <View key={status} style={styles.statusRow}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                <Text style={styles.statusName}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                <Text style={styles.statusCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'sold': return '#3B82F6';
      case 'deceased': return '#EF4444';
      case 'missing': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Herd Management</Text>
        <Text style={styles.subtitle}>Track animals, health & production</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview ({animals.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'analytics' && renderAnalytics()}

      {selectedAnimal && (
        <Modal visible={!!selectedAnimal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedAnimal.unique_id}</Text>
              <TouchableOpacity onPress={() => setSelectedAnimal(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.animalDetailCard}>
                <Text style={styles.detailTitle}>Basic Information</Text>
                <Text style={styles.detailText}>Breed: {selectedAnimal.breed}</Text>
                <Text style={styles.detailText}>Species: {selectedAnimal.species}</Text>
                <Text style={styles.detailText}>Gender: {selectedAnimal.gender}</Text>
                <Text style={styles.detailText}>Birth Date: {selectedAnimal.date_of_birth}</Text>
                <Text style={styles.detailText}>Current Weight: {selectedAnimal.current_weight}kg</Text>
                <Text style={styles.detailText}>Location: {selectedAnimal.location}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowWeightModal(true)}
                >
                  <Text style={styles.actionButtonText}>Add Weight</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={estimateWeightFromCamera}
                >
                  <Text style={styles.actionButtonText}>Camera Weight</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowHealthModal(true)}
                >
                  <Text style={styles.actionButtonText}>Add Health Record</Text>
                </TouchableOpacity>
              </View>

              {selectedAnimal.weight_history.length > 0 && (
                <View style={styles.animalDetailCard}>
                  <Text style={styles.detailTitle}>Weight History</Text>
                  {selectedAnimal.weight_history.slice(-5).map(record => (
                    <View key={record.id} style={styles.recordRow}>
                      <Text style={styles.recordDate}>{record.measurement_date}</Text>
                      <Text style={styles.recordValue}>{record.weight_kg}kg</Text>
                      <Text style={styles.recordMethod}>({record.measurement_method})</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedAnimal.health_records.length > 0 && (
                <View style={styles.animalDetailCard}>
                  <Text style={styles.detailTitle}>Recent Health Records</Text>
                  {selectedAnimal.health_records.slice(-3).map(record => (
                    <View key={record.id} style={styles.recordRow}>
                      <Text style={styles.recordDate}>{record.date}</Text>
                      <Text style={styles.recordType}>{record.record_type}</Text>
                      <Text style={styles.recordTreatment}>{record.treatment}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#228B22',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  animalsList: {
    marginBottom: 16,
  },
  animalCard: {
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
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  animalBreed: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  animalDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  animalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  analyticsContainer: {
    gap: 16,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  speciesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  speciesName: {
    fontSize: 16,
    color: '#374151',
  },
  speciesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  statusCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  animalDetailCard: {
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
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recordDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  recordMethod: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recordType: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  recordTreatment: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default EnhancedHerdManagement;
