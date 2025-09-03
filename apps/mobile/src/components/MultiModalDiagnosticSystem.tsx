import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { offlineStorageService } from '../services/OfflineStorageService';

interface DiagnosticData {
  id: string;
  type: 'crop' | 'livestock' | 'soil';
  imageUri?: string;
  audioUri?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  questionnaireData: Record<string, any>;
  timestamp: number;
  confidence?: number;
  aiResult?: any;
}

interface MultiModalDiagnosticSystemProps {
  farmId: string;
  onDiagnosticComplete: (result: DiagnosticData) => void;
}

export default function MultiModalDiagnosticSystem({ 
  farmId, 
  onDiagnosticComplete 
}: MultiModalDiagnosticSystemProps) {
  const [step, setStep] = useState<'type' | 'capture' | 'questionnaire' | 'processing'>('type');
  const [diagnosticType, setDiagnosticType] = useState<'crop' | 'livestock' | 'soil'>('crop');
  const [imageUri, setImageUri] = useState<string>();
  const [audioUri, setAudioUri] = useState<string>();
  const [gpsLocation, setGpsLocation] = useState<any>();
  const [questionnaireData, setQuestionnaireData] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<any>(null);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus !== 'granted') {
        Alert.alert('Permissions Required', 'Location permission is required for diagnostics.');
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setGpsLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const captureImage = async () => {
    try {
      const mockImageUri = `mock://captured-image-${Date.now()}.jpg`;
      setImageUri(mockImageUri);
      console.log('Image captured (mock):', mockImageUri);
    } catch (error) {
      console.error('Failed to capture image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setIsRecording(true);
      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start audio recording');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setAudioUri('mock://audio-recording.m4a');
      console.log('Audio recording stopped');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const getQuestionnaireQuestions = () => {
    const baseQuestions = [
      { key: 'symptoms', label: 'Describe the symptoms you observe', type: 'text' },
      { key: 'duration', label: 'How long have you noticed this issue?', type: 'select', options: ['1-2 days', '3-7 days', '1-2 weeks', 'More than 2 weeks'] },
      { key: 'severity', label: 'How severe is the issue?', type: 'select', options: ['Mild', 'Moderate', 'Severe'] },
    ];

    const typeSpecificQuestions = {
      crop: [
        { key: 'cropType', label: 'What type of crop is this?', type: 'text' },
        { key: 'growthStage', label: 'Growth stage', type: 'select', options: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature'] },
        { key: 'affectedArea', label: 'Percentage of crop affected', type: 'select', options: ['<10%', '10-25%', '25-50%', '50-75%', '>75%'] },
      ],
      livestock: [
        { key: 'animalType', label: 'Type of animal', type: 'text' },
        { key: 'age', label: 'Approximate age', type: 'text' },
        { key: 'behavior', label: 'Any behavioral changes?', type: 'text' },
        { key: 'appetite', label: 'Appetite changes?', type: 'select', options: ['Normal', 'Decreased', 'Increased', 'None'] },
      ],
      soil: [
        { key: 'soilType', label: 'Soil type', type: 'select', options: ['Clay', 'Sandy', 'Loam', 'Silt', 'Mixed'] },
        { key: 'drainage', label: 'Drainage condition', type: 'select', options: ['Good', 'Poor', 'Waterlogged'] },
        { key: 'previousCrop', label: 'Previous crop grown', type: 'text' },
      ],
    };

    return [...baseQuestions, ...typeSpecificQuestions[diagnosticType]];
  };

  const updateQuestionnaireData = (key: string, value: string) => {
    setQuestionnaireData(prev => ({ ...prev, [key]: value }));
  };

  const processMultiModalDiagnostic = async () => {
    setStep('processing');
    
    try {
      const diagnosticId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const diagnosticData: DiagnosticData = {
        id: diagnosticId,
        type: diagnosticType,
        imageUri,
        audioUri,
        gpsLocation,
        questionnaireData,
        timestamp: Date.now(),
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let calculatedConfidence = 0.3; // Base confidence
      if (imageUri) calculatedConfidence += 0.4;
      if (audioUri) calculatedConfidence += 0.2;
      if (gpsLocation) calculatedConfidence += 0.1;
      
      setConfidence(calculatedConfidence);
      diagnosticData.confidence = calculatedConfidence;
      
      diagnosticData.aiResult = {
        primaryDiagnosis: `${diagnosticType} issue detected`,
        confidence: calculatedConfidence,
        recommendations: [
          'Monitor closely for 24-48 hours',
          'Consider consulting with an expert if symptoms persist',
          'Document any changes in condition'
        ],
        alternativeHypotheses: [
          'Environmental stress',
          'Nutritional deficiency',
          'Pest/disease pressure'
        ],
        escalationRequired: calculatedConfidence < 0.7
      };

      await offlineStorageService.storeDiagnosticData(diagnosticData);
      
      onDiagnosticComplete(diagnosticData);
      
      resetDiagnostic();
      
    } catch (error) {
      console.error('Failed to process diagnostic:', error);
      Alert.alert('Error', 'Failed to process diagnostic. Data saved for later sync.');
    }
  };

  const resetDiagnostic = () => {
    setStep('type');
    setImageUri(undefined);
    setAudioUri(undefined);
    setQuestionnaireData({});
    setConfidence(0);
  };

  const renderTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Diagnostic Type</Text>
      <View style={styles.typeButtons}>
        {(['crop', 'livestock', 'soil'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              diagnosticType === type && styles.selectedTypeButton
            ]}
            onPress={() => setDiagnosticType(type)}
          >
            <Text style={[
              styles.typeButtonText,
              diagnosticType === type && styles.selectedTypeButtonText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep('capture')}
      >
        <Text style={styles.nextButtonText}>Next: Capture Data</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCapture = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Capture Image & Audio</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
        />
      </View>
      
      <View style={styles.captureButtons}>
        <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
          <Text style={styles.captureButtonText}>📷 Capture Image</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.captureButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.captureButtonText}>
            {isRecording ? '⏹️ Stop Recording' : '🎤 Record Audio'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.captureStatus}>
        <Text style={styles.statusText}>
          Image: {imageUri ? '✅ Captured' : '❌ Not captured'}
        </Text>
        <Text style={styles.statusText}>
          Audio: {audioUri ? '✅ Recorded' : '❌ Not recorded'}
        </Text>
        <Text style={styles.statusText}>
          Location: {gpsLocation ? '✅ Available' : '❌ Not available'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep('questionnaire')}
      >
        <Text style={styles.nextButtonText}>Next: Questionnaire</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestionnaire = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Diagnostic Questionnaire</Text>
      
      {getQuestionnaireQuestions().map(question => (
        <View key={question.key} style={styles.questionContainer}>
          <Text style={styles.questionLabel}>{question.label}</Text>
          {question.type === 'text' ? (
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => {
                Alert.prompt(
                  question.label,
                  'Enter your response:',
                  (text) => updateQuestionnaireData(question.key, text || '')
                );
              }}
            >
              <Text style={styles.textInputText}>
                {questionnaireData[question.key] || 'Tap to enter...'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.optionsContainer}>
              {question.options?.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    questionnaireData[question.key] === option && styles.selectedOption
                  ]}
                  onPress={() => updateQuestionnaireData(question.key, option)}
                >
                  <Text style={[
                    styles.optionText,
                    questionnaireData[question.key] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
      
      <TouchableOpacity
        style={styles.processButton}
        onPress={processMultiModalDiagnostic}
      >
        <Text style={styles.processButtonText}>Process Diagnostic</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Processing Diagnostic...</Text>
      <View style={styles.processingContainer}>
        <Text style={styles.processingText}>Analyzing multi-modal data...</Text>
        <Text style={styles.processingText}>Calculating confidence score...</Text>
        <Text style={styles.processingText}>Generating recommendations...</Text>
        
        {confidence > 0 && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceText}>
              Confidence: {(confidence * 100).toFixed(0)}%
            </Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${confidence * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 'type' && renderTypeSelection()}
      {step === 'capture' && renderCapture()}
      {step === 'questionnaire' && renderQuestionnaire()}
      {step === 'processing' && renderProcessing()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 30,
  },
  typeButtons: {
    gap: 15,
    marginBottom: 30,
  },
  typeButton: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedTypeButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  typeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedTypeButtonText: {
    color: '#228B22',
  },
  nextButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#dc2626',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  captureStatus: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInputText: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#228B22',
    fontWeight: '600',
  },
  processButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    alignItems: 'center',
    gap: 20,
  },
  processingText: {
    fontSize: 16,
    color: '#666',
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 10,
  },
  confidenceBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
});
