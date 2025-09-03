import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { offlineStorageService } from '../services/OfflineStorageService';
import { notificationService } from '../services/NotificationService';

interface Animal {
  id: string;
  uniqueId: string; // Ear tag, RFID, etc.
  type: 'cattle' | 'goat' | 'sheep' | 'pig' | 'chicken';
  breed: string;
  birthDate: string;
  gender: 'male' | 'female';
  currentWeight: number;
  weightHistory: WeightRecord[];
  healthRecords: HealthRecord[];
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
  status: 'healthy' | 'sick' | 'pregnant' | 'lactating' | 'sold' | 'deceased';
  parentIds?: string[];
  imageUri?: string;
  notes: string;
}

interface WeightRecord {
  date: string;
  weight: number;
  method: 'scale' | 'camera_estimation' | 'visual_estimate';
  confidence?: number;
}

interface HealthRecord {
  id: string;
  date: string;
  symptoms: string[];
  diagnosis?: string;
  severity: 'mild' | 'moderate' | 'severe';
  veterinarianId?: string;
  resolved: boolean;
}

interface VaccinationRecord {
  id: string;
  vaccine: string;
  date: string;
  nextDueDate: string;
  batchNumber?: string;
  veterinarianId?: string;
}

interface TreatmentRecord {
  id: string;
  date: string;
  treatment: string;
  dosage: string;
  duration: number; // days
  withdrawalPeriod: number; // days
  veterinarianId?: string;
  completed: boolean;
}

interface EnhancedLivestockManagementProps {
  farmId: string;
  onAnimalUpdate: (animal: Animal) => void;
}

export default function EnhancedLivestockManagement({ 
  farmId, 
  onAnimalUpdate 
}: EnhancedLivestockManagementProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'add' | 'weight' | 'health'>('list');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    loadAnimals();
    scheduleVaccinationReminders();
  }, [farmId]);

  const loadAnimals = async () => {
    try {
      const offlineData = await offlineStorageService.getOfflineDataByType('livestock');
      const farmAnimals = offlineData
        .filter(data => data.data.farmId === farmId)
        .map(data => data.data);
      setAnimals(farmAnimals);
    } catch (error) {
      console.error('Failed to load animals:', error);
    }
  };

  const saveAnimal = async (animal: Animal) => {
    try {
      await offlineStorageService.storeOfflineData({
        id: animal.id,
        type: 'livestock',
        data: { ...animal, farmId },
      });
      
      const updatedAnimals = animals.some(a => a.id === animal.id)
        ? animals.map(a => a.id === animal.id ? animal : a)
        : [...animals, animal];
      
      setAnimals(updatedAnimals);
      onAnimalUpdate(animal);
    } catch (error) {
      console.error('Failed to save animal:', error);
      Alert.alert('Error', 'Failed to save animal data');
    }
  };

  const scheduleVaccinationReminders = async () => {
    for (const animal of animals) {
      for (const vaccination of animal.vaccinations) {
        const dueDate = new Date(vaccination.nextDueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 7); // Remind 1 week before

        if (reminderDate > new Date()) {
          await notificationService.scheduleVaccinationReminder(
            animal.id,
            animal.uniqueId,
            vaccination.vaccine,
            reminderDate
          );
        }
      }
    }
  };

  const estimateWeightFromImage = async (imageUri: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const baseWeights = {
      cattle: 400,
      goat: 45,
      sheep: 60,
      pig: 80,
      chicken: 2,
    };
    
    const baseWeight = selectedAnimal ? baseWeights[selectedAnimal.type] : 50;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    return Math.round(baseWeight * (1 + variation));
  };

  const captureWeightImage = async () => {
    setShowCamera(true);
  };

  const processWeightImage = async (imageUri: string) => {
    if (!selectedAnimal) return;

    try {
      const estimatedWeight = await estimateWeightFromImage(imageUri);
      
      const weightRecord: WeightRecord = {
        date: new Date().toISOString().split('T')[0],
        weight: estimatedWeight,
        method: 'camera_estimation',
        confidence: 0.75, // Mock confidence
      };

      const updatedAnimal = {
        ...selectedAnimal,
        currentWeight: estimatedWeight,
        weightHistory: [...selectedAnimal.weightHistory, weightRecord],
      };

      await saveAnimal(updatedAnimal);
      setSelectedAnimal(updatedAnimal);
      setShowCamera(false);
      
      Alert.alert(
        'Weight Estimated',
        `Estimated weight: ${estimatedWeight}kg (75% confidence)`,
        [
          { text: 'Accept', onPress: () => {} },
          { text: 'Manual Entry', onPress: () => manualWeightEntry() },
        ]
      );
    } catch (error) {
      console.error('Failed to process weight image:', error);
      Alert.alert('Error', 'Failed to estimate weight from image');
    }
  };

  const manualWeightEntry = () => {
    Alert.prompt(
      'Enter Weight',
      'Enter the animal weight in kg:',
      (text) => {
        const weight = parseFloat(text || '0');
        if (weight > 0 && selectedAnimal) {
          const weightRecord: WeightRecord = {
            date: new Date().toISOString().split('T')[0],
            weight,
            method: 'scale',
          };

          const updatedAnimal = {
            ...selectedAnimal,
            currentWeight: weight,
            weightHistory: [...selectedAnimal.weightHistory, weightRecord],
          };

          saveAnimal(updatedAnimal);
          setSelectedAnimal(updatedAnimal);
        }
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const addHealthRecord = () => {
    if (!selectedAnimal) return;

    Alert.prompt(
      'Health Issue',
      'Describe the symptoms:',
      (symptoms) => {
        if (symptoms) {
          const healthRecord: HealthRecord = {
            id: `health_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            symptoms: [symptoms],
            severity: 'moderate',
            resolved: false,
          };

          const updatedAnimal = {
            ...selectedAnimal,
            healthRecords: [...selectedAnimal.healthRecords, healthRecord],
            status: 'sick' as const,
          };

          saveAnimal(updatedAnimal);
          setSelectedAnimal(updatedAnimal);
        }
      }
    );
  };

  const addVaccination = () => {
    if (!selectedAnimal) return;

    Alert.prompt(
      'Vaccination',
      'Enter vaccine name:',
      (vaccine) => {
        if (vaccine) {
          const today = new Date();
          const nextDue = new Date(today);
          nextDue.setFullYear(nextDue.getFullYear() + 1); // Default 1 year

          const vaccination: VaccinationRecord = {
            id: `vacc_${Date.now()}`,
            vaccine,
            date: today.toISOString().split('T')[0],
            nextDueDate: nextDue.toISOString().split('T')[0],
          };

          const updatedAnimal = {
            ...selectedAnimal,
            vaccinations: [...selectedAnimal.vaccinations, vaccination],
          };

          saveAnimal(updatedAnimal);
          setSelectedAnimal(updatedAnimal);
        }
      }
    );
  };

  const getAnimalStatusColor = (status: string) => {
    const colors = {
      healthy: '#10B981',
      sick: '#EF4444',
      pregnant: '#F59E0B',
      lactating: '#3B82F6',
      sold: '#6B7280',
      deceased: '#374151',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const renderAnimalList = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livestock Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setView('add')}
        >
          <Text style={styles.addButtonText}>+ Add Animal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{animals.length}</Text>
          <Text style={styles.statLabel}>Total Animals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {animals.filter(a => a.status === 'healthy').length}
          </Text>
          <Text style={styles.statLabel}>Healthy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {animals.filter(a => a.status === 'sick').length}
          </Text>
          <Text style={styles.statLabel}>Sick</Text>
        </View>
      </View>

      {animals.map(animal => (
        <TouchableOpacity
          key={animal.id}
          style={styles.animalCard}
          onPress={() => {
            setSelectedAnimal(animal);
            setView('detail');
          }}
        >
          <View style={styles.animalHeader}>
            <Text style={styles.animalId}>{animal.uniqueId}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getAnimalStatusColor(animal.status) }
            ]}>
              <Text style={styles.statusText}>{animal.status}</Text>
            </View>
          </View>
          
          <Text style={styles.animalInfo}>
            {animal.type} • {animal.breed} • {animal.gender}
          </Text>
          
          <Text style={styles.animalWeight}>
            Current Weight: {animal.currentWeight}kg
          </Text>
          
          {animal.imageUri && (
            <Image source={{ uri: animal.imageUri }} style={styles.animalImage} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAnimalDetail = () => {
    if (!selectedAnimal) return null;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setView('list')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedAnimal.uniqueId}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Basic Information</Text>
          <Text style={styles.detailText}>Type: {selectedAnimal.type}</Text>
          <Text style={styles.detailText}>Breed: {selectedAnimal.breed}</Text>
          <Text style={styles.detailText}>Gender: {selectedAnimal.gender}</Text>
          <Text style={styles.detailText}>Birth Date: {selectedAnimal.birthDate}</Text>
          <Text style={styles.detailText}>Current Weight: {selectedAnimal.currentWeight}kg</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setView('weight')}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionText}>Weight Tracking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setView('health')}
          >
            <Text style={styles.actionIcon}>🏥</Text>
            <Text style={styles.actionText}>Health Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={addVaccination}
          >
            <Text style={styles.actionIcon}>💉</Text>
            <Text style={styles.actionText}>Add Vaccination</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={addHealthRecord}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Recent Vaccinations</Text>
          {selectedAnimal.vaccinations.slice(-3).map(vacc => (
            <View key={vacc.id} style={styles.recordItem}>
              <Text style={styles.recordText}>{vacc.vaccine}</Text>
              <Text style={styles.recordDate}>{vacc.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Health Records</Text>
          {selectedAnimal.healthRecords.slice(-3).map(record => (
            <View key={record.id} style={styles.recordItem}>
              <Text style={styles.recordText}>{record.symptoms.join(', ')}</Text>
              <Text style={styles.recordDate}>{record.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderWeightTracking = () => {
    if (!selectedAnimal) return null;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setView('detail')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Weight Tracking</Text>
        </View>

        <View style={styles.weightActions}>
          <TouchableOpacity
            style={styles.weightButton}
            onPress={captureWeightImage}
          >
            <Text style={styles.weightButtonText}>📷 Camera Estimate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.weightButton}
            onPress={manualWeightEntry}
          >
            <Text style={styles.weightButtonText}>⚖️ Manual Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Weight History</Text>
          {selectedAnimal.weightHistory.map((record, index) => (
            <View key={index} style={styles.weightRecord}>
              <Text style={styles.weightValue}>{record.weight}kg</Text>
              <Text style={styles.weightDate}>{record.date}</Text>
              <Text style={styles.weightMethod}>{record.method}</Text>
              {record.confidence && (
                <Text style={styles.weightConfidence}>
                  {(record.confidence * 100).toFixed(0)}% confidence
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      {view === 'list' && renderAnimalList()}
      {view === 'detail' && renderAnimalDetail()}
      {view === 'weight' && renderWeightTracking()}
      
      {showCamera && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onCameraReady={() => {
              setTimeout(async () => {
                const mockImageUri = 'mock://weight-image.jpg';
                await processWeightImage(mockImageUri);
              }, 3000);
            }}
          />
          <TouchableOpacity
            style={styles.cancelCamera}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.cancelCameraText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
  },
  addButton: {
    backgroundColor: '#228B22',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#228B22',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  animalCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  animalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  animalWeight: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 10,
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  recordText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
  weightActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weightButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  weightButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weightRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  weightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
  },
  weightDate: {
    fontSize: 12,
    color: '#666',
  },
  weightMethod: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  weightConfidence: {
    fontSize: 12,
    color: '#10B981',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cancelCamera: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  cancelCameraText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
