import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { offlineStorageService } from '../services/OfflineStorageService';

interface MultiModalDiagnosticProps {
  onDiagnosisComplete: (result: any) => void;
  diagnosticType: 'crop' | 'livestock' | 'soil';
}

interface QuestionnaireData {
  symptoms: string[];
  duration: string;
  severity: string;
  previousTreatments: string[];
  environmentalFactors: string[];
}

export default function MultiModalDiagnostic({ 
  onDiagnosisComplete, 
  diagnosticType 
}: MultiModalDiagnosticProps) {
  const [step, setStep] = useState<'questionnaire' | 'camera' | 'audio' | 'processing'>('questionnaire');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<any>(null);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    symptoms: [],
    duration: '',
    severity: '',
    previousTreatments: [],
    environmentalFactors: []
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<any>(null);

  const startQuestionnaire = () => {
    setStep('questionnaire');
  };

  const completeQuestionnaire = () => {
    setStep('camera');
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setGpsLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setImageUri(photo.uri);
        setStep('audio');
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is needed');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording start error:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      processMultiModalDiagnosis();
    } catch (error) {
      console.error('Recording stop error:', error);
    }
  };

  const skipAudio = () => {
    processMultiModalDiagnosis();
  };

  const processMultiModalDiagnosis = async () => {
    setStep('processing');

    const diagnosticData = {
      id: `diag_${Date.now()}`,
      type: diagnosticType,
      imageUri,
      audioUri,
      gpsLocation,
      questionnaireData,
      timestamp: Date.now()
    };

    try {
      await offlineStorageService.storeDiagnosticData(diagnosticData);

      const mockResult = {
        diagnosis: 'Multi-modal analysis complete',
        confidence: 0.85,
        severity: 'medium' as const,
        recommendations: [
          'Based on image analysis: Possible nutrient deficiency detected',
          'Based on questionnaire: Symptoms suggest early stage condition',
          'Based on location: Weather conditions may be contributing factor',
          ...(audioUri ? ['Based on audio: Environmental stress indicators detected'] : [])
        ],
        explainability: {
          imageConfidence: 0.82,
          questionnaireScore: 0.88,
          locationRelevance: 0.75,
          audioConfidence: audioUri ? 0.79 : null
        },
        alternativeHypotheses: [
          { diagnosis: 'Pest damage', confidence: 0.65 },
          { diagnosis: 'Water stress', confidence: 0.58 },
          { diagnosis: 'Disease infection', confidence: 0.72 }
        ],
        escalationRecommended: false,
        source: 'multimodal'
      };

      onDiagnosisComplete(mockResult);
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', 'Failed to process diagnosis');
    }
  };

  const renderQuestionnaire = () => (
    <ScrollView style={styles.questionnaireContainer}>
      <Text style={styles.title}>Diagnostic Questionnaire</Text>
      <Text style={styles.subtitle}>Please provide details about the issue:</Text>
      
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>What symptoms have you observed?</Text>
        {['Yellowing leaves', 'Brown spots', 'Wilting', 'Stunted growth', 'Unusual odor'].map(symptom => (
          <TouchableOpacity
            key={symptom}
            style={[
              styles.optionButton,
              questionnaireData.symptoms.includes(symptom) && styles.selectedOption
            ]}
            onPress={() => {
              const symptoms = questionnaireData.symptoms.includes(symptom)
                ? questionnaireData.symptoms.filter(s => s !== symptom)
                : [...questionnaireData.symptoms, symptom];
              setQuestionnaireData({ ...questionnaireData, symptoms });
            }}
          >
            <Text style={styles.optionText}>{symptom}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>How long have you noticed these symptoms?</Text>
        {['1-2 days', '3-7 days', '1-2 weeks', 'More than 2 weeks'].map(duration => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.optionButton,
              questionnaireData.duration === duration && styles.selectedOption
            ]}
            onPress={() => setQuestionnaireData({ ...questionnaireData, duration })}
          >
            <Text style={styles.optionText}>{duration}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, questionnaireData.symptoms.length === 0 && styles.disabledButton]}
        onPress={completeQuestionnaire}
        disabled={questionnaireData.symptoms.length === 0}
      >
        <Text style={styles.continueButtonText}>Continue to Camera</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCamera = () => (
    <View style={styles.container}>
      <View style={styles.camera}>
        <View style={styles.cameraOverlay}>
          <Text style={styles.instructionText}>Take a clear photo of the affected area</Text>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.captureButtonText}>📷</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAudio = () => (
    <View style={styles.audioContainer}>
      <Text style={styles.title}>Audio Recording (Optional)</Text>
      <Text style={styles.subtitle}>Record environmental sounds or describe the issue</Text>
      
      {!isRecording ? (
        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
          <Text style={styles.recordButtonText}>🎤 Start Recording</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.stopButtonText}>⏹️ Stop Recording</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={skipAudio}>
        <Text style={styles.skipButtonText}>Skip Audio</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <Text style={styles.processingText}>Processing multi-modal diagnosis...</Text>
      <Text style={styles.processingSubtext}>Analyzing image, questionnaire, and location data</Text>
    </View>
  );

  switch (step) {
    case 'questionnaire':
      return renderQuestionnaire();
    case 'camera':
      return renderCamera();
    case 'audio':
      return renderAudio();
    case 'processing':
      return renderProcessing();
    default:
      return renderQuestionnaire();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionnaireContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  questionSection: {
    marginBottom: 25,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#228B22',
    borderColor: '#FFD700',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  captureButton: {
    alignSelf: 'center',
    backgroundColor: '#228B22',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 30,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  recordButton: {
    backgroundColor: '#228B22',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#dc3545',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#228B22',
  },
  skipButtonText: {
    color: '#228B22',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  processingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 10,
  },
  processingSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
