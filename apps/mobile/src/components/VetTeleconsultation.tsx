import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface ConsultationSession {
  id: string;
  animalId: string;
  vetId: string;
  farmerId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  notes: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired: boolean;
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

interface VetProfile {
  id: string;
  name: string;
  specialization: string[];
  experience: number;
  rating: number;
  availability: string[];
  hourlyRate: number;
  languages: string[];
  verified: boolean;
}

export default function VetTeleconsultation({ 
  animalId, 
  farmerId 
}: { 
  animalId: string; 
  farmerId: string; 
}) {
  const [availableVets, setAvailableVets] = useState<VetProfile[]>([]);
  const [selectedVet, setSelectedVet] = useState<VetProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<ConsultationSession | null>(null);
  const [showVetSelection, setShowVetSelection] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const sessionStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAvailableVets();
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const loadAvailableVets = async () => {
    try {
      const vetsData = await offlineStorageService.getOfflineDataByType('veterinarians');
      
      if (vetsData.length > 0) {
        setAvailableVets(vetsData[0].data);
      } else {
        const mockVets = getMockVeterinarians();
        setAvailableVets(mockVets);
        
        await offlineStorageService.storeOfflineData({
          id: 'veterinarians',
          type: 'veterinarians',
          data: mockVets
        });
      }
    } catch (error) {
      console.error('Failed to load veterinarians:', error);
      setAvailableVets(getMockVeterinarians());
    }
  };

  const getMockVeterinarians = (): VetProfile[] => [
    {
      id: 'vet_001',
      name: 'Dr. Sarah Kimani',
      specialization: ['Cattle', 'Goats', 'General Practice'],
      experience: 8,
      rating: 4.8,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      hourlyRate: 50,
      languages: ['English', 'Swahili'],
      verified: true
    },
    {
      id: 'vet_002',
      name: 'Dr. James Mwangi',
      specialization: ['Poultry', 'Pigs', 'Disease Prevention'],
      experience: 12,
      rating: 4.9,
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      hourlyRate: 60,
      languages: ['English', 'Kikuyu'],
      verified: true
    },
    {
      id: 'vet_003',
      name: 'Dr. Grace Wanjiku',
      specialization: ['Sheep', 'Goats', 'Nutrition'],
      experience: 6,
      rating: 4.7,
      availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      hourlyRate: 45,
      languages: ['English', 'Swahili', 'Kikuyu'],
      verified: true
    }
  ];

  const initiateConsultation = async (vet: VetProfile) => {
    try {
      setIsConnecting(true);
      setSelectedVet(vet);

      const session: ConsultationSession = {
        id: `consultation_${Date.now()}`,
        animalId,
        vetId: vet.id,
        farmerId,
        status: 'pending',
        startTime: new Date().toISOString(),
        notes: '',
        followUpRequired: false,
        cost: vet.hourlyRate,
        paymentStatus: 'pending'
      };

      setCurrentSession(session);
      
      await offlineStorageService.storeOfflineData({
        id: session.id,
        type: 'consultation',
        data: session
      });

      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnecting(false);
        setShowConsultation(true);
        startSessionTimer();
      }, 3000);

    } catch (error) {
      console.error('Failed to initiate consultation:', error);
      setIsConnecting(false);
      Alert.alert('Connection Failed', 'Unable to connect to veterinarian. Please try again.');
    }
  };

  const startSessionTimer = () => {
    sessionStartTime.current = Date.now();
    durationInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      setSessionDuration(elapsed);
    }, 1000);
  };

  const endConsultation = async () => {
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      if (currentSession) {
        const updatedSession: ConsultationSession = {
          ...currentSession,
          status: 'completed',
          endTime: new Date().toISOString(),
          notes: consultationNotes
        };

        await offlineStorageService.storeOfflineData({
          id: updatedSession.id,
          type: 'consultation',
          data: updatedSession
        });

        setCurrentSession(updatedSession);
      }

      setShowConsultation(false);
      setConnectionStatus('disconnected');
      setSessionDuration(0);
      setConsultationNotes('');

      Alert.alert(
        'Consultation Completed',
        `Session duration: ${Math.floor(sessionDuration / 60)}:${(sessionDuration % 60).toString().padStart(2, '0')}\nCost: $${selectedVet?.hourlyRate}`,
        [{ text: 'OK', onPress: () => setSelectedVet(null) }]
      );

    } catch (error) {
      console.error('Failed to end consultation:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVetCard = (vet: VetProfile) => (
    <TouchableOpacity
      key={vet.id}
      style={styles.vetCard}
      onPress={() => initiateConsultation(vet)}
    >
      <View style={styles.vetHeader}>
        <Text style={styles.vetName}>{vet.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {vet.rating}</Text>
          {vet.verified && <Text style={styles.verified}>✅</Text>}
        </View>
      </View>
      
      <Text style={styles.experience}>{vet.experience} years experience</Text>
      
      <View style={styles.specializations}>
        {vet.specialization.map((spec, index) => (
          <Text key={index} style={styles.specializationTag}>{spec}</Text>
        ))}
      </View>
      
      <View style={styles.vetDetails}>
        <Text style={styles.hourlyRate}>${vet.hourlyRate}/hour</Text>
        <Text style={styles.languages}>
          Languages: {vet.languages.join(', ')}
        </Text>
      </View>
      
      <Text style={styles.availability}>
        Available: {vet.availability.join(', ')}
      </Text>
    </TouchableOpacity>
  );

  const renderConsultationInterface = () => (
    <Modal visible={showConsultation} animationType="slide">
      <View style={styles.consultationContainer}>
        <View style={styles.consultationHeader}>
          <Text style={styles.consultationTitle}>
            Consultation with {selectedVet?.name}
          </Text>
          <Text style={styles.sessionDuration}>
            Duration: {formatDuration(sessionDuration)}
          </Text>
        </View>

        <View style={styles.videoContainer}>
          <View style={styles.mockVideo}>
            <Text style={styles.videoPlaceholder}>📹 Video Call Active</Text>
            <Text style={styles.connectionStatus}>
              Status: {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Connecting...'}
            </Text>
          </View>
        </View>

        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Consultation Notes:</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Enter consultation notes, diagnosis, and treatment recommendations..."
            value={consultationNotes}
            onChangeText={setConsultationNotes}
          />
        </View>

        <View style={styles.consultationActions}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={endConsultation}
          >
            <Text style={styles.endCallButtonText}>End Consultation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isConnecting) {
    return (
      <View style={styles.connectingContainer}>
        <Text style={styles.connectingText}>Connecting to {selectedVet?.name}...</Text>
        <Text style={styles.connectingSubtext}>Please wait while we establish the connection</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Veterinary Teleconsultation</Text>
        <Text style={styles.subtitle}>Connect with certified veterinarians</Text>
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => setShowVetSelection(true)}
      >
        <Text style={styles.requestButtonText}>Request Consultation</Text>
      </TouchableOpacity>

      <Modal visible={showVetSelection} animationType="slide">
        <View style={styles.vetSelectionContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Veterinarian</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVetSelection(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.vetsList}>
            {availableVets.map(renderVetCard)}
          </ScrollView>
        </View>
      </Modal>

      {renderConsultationInterface()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00684b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  requestButton: {
    backgroundColor: '#00684b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  vetSelectionContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  vetsList: {
    flex: 1,
    padding: 16,
  },
  vetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  verified: {
    fontSize: 12,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: '#e8f5e8',
    color: '#00684b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  vetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00684b',
  },
  languages: {
    fontSize: 12,
    color: '#666',
  },
  availability: {
    fontSize: 12,
    color: '#666',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  connectingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00684b',
    marginBottom: 8,
  },
  connectingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  consultationContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  consultationHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionDuration: {
    fontSize: 16,
    color: '#00684b',
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mockVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
  },
  connectionStatus: {
    fontSize: 16,
    color: 'white',
  },
  notesContainer: {
    padding: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  consultationActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  endCallButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endCallButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
