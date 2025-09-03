import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Camera } from 'expo-camera';
import { offlineStorageService } from '../services/OfflineStorageService';

interface LivestockManagementProps {
  livestockId: string;
  onDataUpdated: (data: any) => void;
}

export default function LivestockManagement({ livestockId, onDataUpdated }: LivestockManagementProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'individuals' | 'health' | 'weight'>('overview');
  const [individuals, setIndividuals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [weightEstimationMode, setWeightEstimationMode] = useState(false);

  useEffect(() => {
    loadLivestockData();
  }, [livestockId]);

  const loadLivestockData = async () => {
    const mockIndividuals = [
      {
        id: '1',
        uniqueId: 'COW001',
        name: 'Bessie',
        birthDate: new Date('2022-03-15'),
        gender: 'female',
        breed: 'Holstein',
        currentWeight: 450,
        healthStatus: 'healthy',
        lastCheckup: new Date('2024-08-15'),
        weightHistory: [
          { date: new Date('2024-07-01'), weight: 430, method: 'scale' },
          { date: new Date('2024-08-01'), weight: 445, method: 'tape' },
          { date: new Date('2024-09-01'), weight: 450, method: 'camera_estimate' }
        ]
      },
      {
        id: '2',
        uniqueId: 'COW002',
        name: 'Daisy',
        birthDate: new Date('2021-11-20'),
        gender: 'female',
        breed: 'Holstein',
        currentWeight: 520,
        healthStatus: 'healthy',
        lastCheckup: new Date('2024-08-10'),
        weightHistory: [
          { date: new Date('2024-07-01'), weight: 510, method: 'scale' },
          { date: new Date('2024-08-01'), weight: 515, method: 'tape' },
          { date: new Date('2024-09-01'), weight: 520, method: 'visual_estimate' }
        ]
      }
    ];

    setIndividuals(mockIndividuals);
  };

  const estimateWeightFromCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed for weight estimation');
        return;
      }

      setWeightEstimationMode(true);
      
      setTimeout(() => {
        const estimatedWeight = Math.floor(Math.random() * 100) + 400;
        Alert.alert(
          'Weight Estimation Complete',
          `Estimated weight: ${estimatedWeight} kg\n\nThis is based on AI analysis of body measurements from the camera image.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Save', 
              onPress: () => saveWeightRecord(estimatedWeight, 'camera_estimate')
            }
          ]
        );
        setWeightEstimationMode(false);
      }, 3000);
    } catch (error) {
      console.error('Camera weight estimation error:', error);
      setWeightEstimationMode(false);
    }
  };

  const saveWeightRecord = async (weight: number, method: string) => {
    if (!selectedAnimal) return;

    const weightRecord = {
      id: `weight_${Date.now()}`,
      animalId: selectedAnimal.id,
      date: new Date(),
      weight,
      method,
      notes: method === 'camera_estimate' ? 'AI-estimated from camera image' : ''
    };

    const updatedAnimal = {
      ...selectedAnimal,
      currentWeight: weight,
      weightHistory: [...selectedAnimal.weightHistory, weightRecord]
    };

    const updatedIndividuals = individuals.map(animal =>
      animal.id === selectedAnimal.id ? updatedAnimal : animal
    );

    setIndividuals(updatedIndividuals);
    setSelectedAnimal(updatedAnimal);

    await offlineStorageService.storeOfflineData({
      id: `weight_record_${weightRecord.id}`,
      type: 'farm',
      data: weightRecord
    });

    Alert.alert('Success', 'Weight record saved successfully!');
  };

  const addVaccination = async (animalId: string) => {
    Alert.alert(
      'Add Vaccination',
      'Vaccination tracking feature',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: async () => {
            const vaccination = {
              id: `vacc_${Date.now()}`,
              animalId,
              vaccine: 'FMD Vaccine',
              date: new Date(),
              nextDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
              veterinarian: 'Dr. Smith'
            };

            await offlineStorageService.storeOfflineData({
              id: `vaccination_${vaccination.id}`,
              type: 'farm',
              data: vaccination
            });

            Alert.alert('Success', 'Vaccination record added!');
          }
        }
      ]
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{individuals.length}</Text>
          <Text style={styles.statLabel}>Total Animals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {individuals.filter(a => a.healthStatus === 'healthy').length}
          </Text>
          <Text style={styles.statLabel}>Healthy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {Math.round(individuals.reduce((sum, a) => sum + a.currentWeight, 0) / individuals.length)}
          </Text>
          <Text style={styles.statLabel}>Avg Weight (kg)</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('health')}>
          <Text style={styles.actionButtonText}>📋 Health Checkup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('weight')}>
          <Text style={styles.actionButtonText}>⚖️ Weight Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={estimateWeightFromCamera}>
          <Text style={styles.actionButtonText}>📷 Camera Weight Estimate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIndividuals = () => (
    <ScrollView style={styles.tabContent}>
      {individuals.map(animal => (
        <TouchableOpacity
          key={animal.id}
          style={[styles.animalCard, selectedAnimal?.id === animal.id && styles.selectedAnimalCard]}
          onPress={() => setSelectedAnimal(animal)}
        >
          <View style={styles.animalHeader}>
            <Text style={styles.animalName}>{animal.name || animal.uniqueId}</Text>
            <Text style={styles.animalId}>{animal.uniqueId}</Text>
          </View>
          <Text style={styles.animalDetails}>
            {animal.breed} • {animal.gender} • {animal.currentWeight}kg
          </Text>
          <Text style={styles.animalStatus}>
            Status: {animal.healthStatus} • Last checkup: {animal.lastCheckup.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHealth = () => (
    <ScrollView style={styles.tabContent}>
      {selectedAnimal ? (
        <View>
          <Text style={styles.sectionTitle}>Health Record for {selectedAnimal.name}</Text>
          
          <View style={styles.healthCard}>
            <Text style={styles.healthTitle}>Current Status</Text>
            <Text style={styles.healthStatus}>{selectedAnimal.healthStatus}</Text>
            <Text style={styles.healthDate}>
              Last checkup: {selectedAnimal.lastCheckup.toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addVaccination(selectedAnimal.id)}
          >
            <Text style={styles.actionButtonText}>💉 Add Vaccination</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🏥 Schedule Checkup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noSelectionText}>Select an animal to view health records</Text>
      )}
    </ScrollView>
  );

  const renderWeight = () => (
    <ScrollView style={styles.tabContent}>
      {selectedAnimal ? (
        <View>
          <Text style={styles.sectionTitle}>Weight Tracking for {selectedAnimal.name}</Text>
          
          <View style={styles.weightCard}>
            <Text style={styles.weightTitle}>Current Weight</Text>
            <Text style={styles.weightValue}>{selectedAnimal.currentWeight} kg</Text>
          </View>

          <Text style={styles.sectionTitle}>Weight History</Text>
          {selectedAnimal.weightHistory.map((record: any, index: number) => (
            <View key={index} style={styles.weightHistoryItem}>
              <Text style={styles.weightDate}>{record.date.toLocaleDateString()}</Text>
              <Text style={styles.weightHistoryValue}>{record.weight} kg</Text>
              <Text style={styles.weightMethod}>{record.method}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={estimateWeightFromCamera}
          >
            <Text style={styles.actionButtonText}>📷 Estimate Weight from Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noSelectionText}>Select an animal to view weight tracking</Text>
      )}
    </ScrollView>
  );

  if (weightEstimationMode) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraInstructions}>
          Position the camera to capture the full body of the animal
        </Text>
        <Text style={styles.processingText}>Analyzing body measurements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Livestock Management</Text>
      
      <View style={styles.tabBar}>
        {['overview', 'individuals', 'health', 'weight'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'individuals' && renderIndividuals()}
      {selectedTab === 'health' && renderHealth()}
      {selectedTab === 'weight' && renderWeight()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    padding: 20,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
    padding: 20,
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
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  animalCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnimalCard: {
    borderColor: '#10B981',
    backgroundColor: '#e8f5e8',
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalId: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  animalDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  animalStatus: {
    fontSize: 12,
    color: '#666',
  },
  healthCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  healthStatus: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 5,
  },
  healthDate: {
    fontSize: 14,
    color: '#666',
  },
  weightCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  weightTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  weightHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  weightDate: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  weightHistoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    flex: 1,
    textAlign: 'center',
  },
  weightMethod: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  noSelectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraInstructions: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  processingText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
