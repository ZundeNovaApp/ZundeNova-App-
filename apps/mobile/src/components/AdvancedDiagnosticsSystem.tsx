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
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface DiagnosticInput {
  id: string;
  type: 'image' | 'audio' | 'gps' | 'questionnaire';
  data: any;
  timestamp: string;
  confidence?: number;
}

interface DiagnosticResult {
  id: string;
  diagnosis: string;
  confidence: number;
  alternative_hypotheses: Array<{
    diagnosis: string;
    confidence: number;
    reasoning: string;
  }>;
  explanation: string;
  recommended_actions: string[];
  escalation_required: boolean;
  expert_consultation_suggested: boolean;
  decision_pack?: {
    products: Array<{
      id: string;
      name: string;
      type: string;
      usage_instructions: string;
      safety_precautions: string[];
      withdrawal_period?: string;
    }>;
    ppe_requirements: string[];
    application_schedule: Array<{
      day: number;
      action: string;
      notes: string;
    }>;
  };
  created_at: string;
}

interface QuestionnaireQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'boolean';
  options?: string[];
  required: boolean;
}

interface SymptomTimeline {
  id: string;
  diagnostic_id: string;
  day: number;
  images: string[];
  notes: string;
  severity_rating: number;
  weather_conditions?: string;
  treatments_applied?: string[];
  created_at: string;
}

const AdvancedDiagnosticsSystem: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'capture' | 'questionnaire' | 'timeline' | 'results'>('capture');
  const [diagnosticInputs, setDiagnosticInputs] = useState<DiagnosticInput[]>([]);
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [timeline, setTimeline] = useState<SymptomTimeline[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireQuestion[]>([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<{ [key: string]: any }>({});
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestPermissions();
    loadQuestionnaire();
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      const audioStatus = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status === 'granted');

      if (locationStatus.status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const loadQuestionnaire = () => {
    const sampleQuestionnaire: QuestionnaireQuestion[] = [
      {
        id: 'q1',
        question: 'What type of crop/animal are you diagnosing?',
        type: 'single_choice',
        options: ['Maize', 'Tomato', 'Beans', 'Cattle', 'Poultry', 'Goats', 'Other'],
        required: true
      },
      {
        id: 'q2',
        question: 'When did you first notice the symptoms?',
        type: 'single_choice',
        options: ['Today', '1-2 days ago', '3-7 days ago', '1-2 weeks ago', 'More than 2 weeks ago'],
        required: true
      },
      {
        id: 'q3',
        question: 'What symptoms are you observing?',
        type: 'multiple_choice',
        options: [
          'Yellowing leaves',
          'Brown spots',
          'Wilting',
          'Stunted growth',
          'Unusual behavior (animals)',
          'Loss of appetite',
          'Discharge',
          'Other'
        ],
        required: true
      },
      {
        id: 'q4',
        question: 'Have you applied any treatments recently?',
        type: 'text',
        required: false
      },
      {
        id: 'q5',
        question: 'Rate the severity of the problem (1-10)',
        type: 'number',
        required: true
      }
    ];
    setQuestionnaire(sampleQuestionnaire);
  };

  const captureImage = async () => {
    if (!cameraPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to capture images');
      return;
    }
    setShowCamera(true);
  };

  const startAudioRecording = async () => {
    if (!audioPermission) {
      Alert.alert('Permission Required', 'Audio permission is required to record sounds');
      return;
    }

    try {
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
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start audio recording');
    }
  };

  const stopAudioRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const audioInput: DiagnosticInput = {
          id: `audio_${Date.now()}`,
          type: 'audio',
          data: { uri },
          timestamp: new Date().toISOString()
        };
        setDiagnosticInputs([...diagnosticInputs, audioInput]);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop audio recording');
    }
  };

  const captureGPSLocation = async () => {
    if (!locationPermission) {
      Alert.alert('Permission Required', 'Location permission is required to capture GPS data');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const gpsInput: DiagnosticInput = {
        id: `gps_${Date.now()}`,
        type: 'gps',
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude
        },
        timestamp: new Date().toISOString()
      };
      setDiagnosticInputs([...diagnosticInputs, gpsInput]);
      Alert.alert('Success', 'GPS location captured successfully');
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Error', 'Failed to capture GPS location');
    }
  };

  const submitQuestionnaire = () => {
    const requiredQuestions = questionnaire.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !questionnaireResponses[q.id]);

    if (missingAnswers.length > 0) {
      Alert.alert('Incomplete', 'Please answer all required questions');
      return;
    }

    const questionnaireInput: DiagnosticInput = {
      id: `questionnaire_${Date.now()}`,
      type: 'questionnaire',
      data: questionnaireResponses,
      timestamp: new Date().toISOString()
    };

    setDiagnosticInputs([...diagnosticInputs, questionnaireInput]);
    setActiveStep('results');
    processDiagnostic();
  };

  const processDiagnostic = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockResult: DiagnosticResult = {
        id: `result_${Date.now()}`,
        diagnosis: 'Maize Leaf Blight (Probable)',
        confidence: 0.85,
        alternative_hypotheses: [
          {
            diagnosis: 'Nutrient Deficiency (Nitrogen)',
            confidence: 0.65,
            reasoning: 'Yellowing pattern suggests possible nitrogen deficiency'
          },
          {
            diagnosis: 'Water Stress',
            confidence: 0.45,
            reasoning: 'Leaf curling could indicate water stress'
          }
        ],
        explanation: 'Based on the leaf discoloration patterns, environmental conditions, and farmer responses, this appears to be fungal leaf blight. The brown spots with yellow halos are characteristic of this condition.',
        recommended_actions: [
          'Apply copper-based fungicide',
          'Improve field drainage',
          'Remove affected plant debris',
          'Monitor weather conditions'
        ],
        escalation_required: false,
        expert_consultation_suggested: true,
        decision_pack: {
          products: [
            {
              id: 'fungicide_001',
              name: 'Copper Oxychloride 50% WP',
              type: 'Fungicide',
              usage_instructions: 'Mix 2g per liter of water. Spray in early morning or evening.',
              safety_precautions: ['Wear protective clothing', 'Avoid spraying in windy conditions'],
              withdrawal_period: '14 days before harvest'
            }
          ],
          ppe_requirements: ['Gloves', 'Face mask', 'Long sleeves'],
          application_schedule: [
            { day: 1, action: 'First fungicide application', notes: 'Cover all affected areas' },
            { day: 7, action: 'Second application if symptoms persist', notes: 'Monitor improvement' },
            { day: 14, action: 'Final assessment', notes: 'Consider expert consultation if no improvement' }
          ]
        },
        created_at: new Date().toISOString()
      };

      setCurrentResult(mockResult);
      saveDiagnosticResult(mockResult);
      setLoading(false);
    }, 3000);
  };

  const saveDiagnosticResult = async (result: DiagnosticResult) => {
    try {
      await offlineStorageService.storeOfflineData({
        id: result.id,
        type: 'diagnostic' as any,
        data: {
          result,
          inputs: diagnosticInputs,
          timeline
        }
      });
    } catch (error) {
      console.error('Error saving diagnostic result:', error);
    }
  };

  const addTimelineEntry = (day: number, images: string[], notes: string, severity: number) => {
    const timelineEntry: SymptomTimeline = {
      id: `timeline_${Date.now()}`,
      diagnostic_id: currentResult?.id || '',
      day,
      images,
      notes,
      severity_rating: severity,
      created_at: new Date().toISOString()
    };

    setTimeline([...timeline, timelineEntry]);
  };

  const renderCaptureStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Capture Diagnostic Data</Text>
      <Text style={styles.stepDescription}>
        Collect multiple types of data for more accurate diagnosis
      </Text>

      <View style={styles.captureOptions}>
        <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
          <Text style={styles.captureIcon}>📷</Text>
          <Text style={styles.captureLabel}>Take Photos</Text>
          <Text style={styles.captureCount}>{capturedImages.length} captured</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={isRecording ? stopAudioRecording : startAudioRecording}
        >
          <Text style={styles.captureIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
          <Text style={styles.captureLabel}>
            {isRecording ? 'Stop Recording' : 'Record Audio'}
          </Text>
          <Text style={styles.captureCount}>
            {diagnosticInputs.filter(i => i.type === 'audio').length} recorded
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={captureGPSLocation}>
          <Text style={styles.captureIcon}>📍</Text>
          <Text style={styles.captureLabel}>GPS Location</Text>
          <Text style={styles.captureCount}>
            {diagnosticInputs.filter(i => i.type === 'gps').length > 0 ? 'Captured' : 'Not captured'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setActiveStep('questionnaire')}
      >
        <Text style={styles.nextButtonText}>Continue to Questionnaire</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderQuestionnaireStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Symptom Questionnaire</Text>
      <Text style={styles.stepDescription}>
        Answer these questions to help improve diagnostic accuracy
      </Text>

      {questionnaire.map(question => (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {question.question}
            {question.required && <Text style={styles.required}> *</Text>}
          </Text>

          {question.type === 'single_choice' && (
            <View style={styles.optionsContainer}>
              {question.options?.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    questionnaireResponses[question.id] === option && styles.selectedOption
                  ]}
                  onPress={() => setQuestionnaireResponses({
                    ...questionnaireResponses,
                    [question.id]: option
                  })}
                >
                  <Text style={[
                    styles.optionText,
                    questionnaireResponses[question.id] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {question.type === 'multiple_choice' && (
            <View style={styles.optionsContainer}>
              {question.options?.map(option => {
                const currentAnswers = questionnaireResponses[question.id] || [];
                const isSelected = currentAnswers.includes(option);
                
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, isSelected && styles.selectedOption]}
                    onPress={() => {
                      const newAnswers = isSelected
                        ? currentAnswers.filter((a: string) => a !== option)
                        : [...currentAnswers, option];
                      setQuestionnaireResponses({
                        ...questionnaireResponses,
                        [question.id]: newAnswers
                      });
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {(question.type === 'text' || question.type === 'number') && (
            <TextInput
              style={styles.textInput}
              value={questionnaireResponses[question.id] || ''}
              onChangeText={(text) => setQuestionnaireResponses({
                ...questionnaireResponses,
                [question.id]: question.type === 'number' ? parseFloat(text) || 0 : text
              })}
              placeholder={`Enter ${question.type === 'number' ? 'number' : 'text'}`}
              keyboardType={question.type === 'number' ? 'numeric' : 'default'}
            />
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.nextButton} onPress={submitQuestionnaire}>
        <Text style={styles.nextButtonText}>Submit & Get Diagnosis</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderResultsStep = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing diagnostic data...</Text>
          <Text style={styles.loadingSubtext}>Analyzing images, audio, and responses</Text>
        </View>
      );
    }

    if (!currentResult) return null;

    return (
      <ScrollView style={styles.stepContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.diagnosisTitle}>{currentResult.diagnosis}</Text>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {Math.round(currentResult.confidence * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.sectionTitle}>Explanation</Text>
          <Text style={styles.explanationText}>{currentResult.explanation}</Text>
        </View>

        {currentResult.alternative_hypotheses.length > 0 && (
          <View style={styles.alternativesContainer}>
            <Text style={styles.sectionTitle}>Alternative Possibilities</Text>
            {currentResult.alternative_hypotheses.map((alt, index) => (
              <View key={index} style={styles.alternativeItem}>
                <Text style={styles.alternativeDiagnosis}>{alt.diagnosis}</Text>
                <Text style={styles.alternativeConfidence}>
                  {Math.round(alt.confidence * 100)}%
                </Text>
                <Text style={styles.alternativeReasoning}>{alt.reasoning}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {currentResult.recommended_actions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <Text style={styles.actionText}>• {action}</Text>
            </View>
          ))}
        </View>

        {currentResult.decision_pack && (
          <View style={styles.decisionPackContainer}>
            <Text style={styles.sectionTitle}>Action Pack</Text>
            
            {currentResult.decision_pack.products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productType}>{product.type}</Text>
                <Text style={styles.productInstructions}>{product.usage_instructions}</Text>
                
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {currentResult.expert_consultation_suggested && (
          <TouchableOpacity style={styles.expertButton}>
            <Text style={styles.expertButtonText}>Consult Expert</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Diagnostics</Text>
        <Text style={styles.subtitle}>Multi-modal AI analysis</Text>
      </View>

      <View style={styles.progressBar}>
        {['capture', 'questionnaire', 'results'].map((step, index) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              activeStep === step && styles.activeProgressStep
            ]}
          >
            <Text style={[
              styles.progressStepText,
              activeStep === step && styles.activeProgressStepText
            ]}>
              {index + 1}
            </Text>
          </View>
        ))}
      </View>

      {activeStep === 'capture' && renderCaptureStep()}
      {activeStep === 'questionnaire' && renderQuestionnaireStep()}
      {activeStep === 'results' && renderResultsStep()}
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
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeProgressStep: {
    backgroundColor: '#228B22',
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeProgressStepText: {
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  captureOptions: {
    marginBottom: 32,
  },
  captureButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  captureLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  captureCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionContainer: {
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
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#228B22',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultHeader: {
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
  diagnosisTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#228B22',
  },
  explanationContainer: {
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
  explanationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  alternativesContainer: {
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
  alternativeItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: 12,
    marginBottom: 12,
  },
  alternativeDiagnosis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alternativeConfidence: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
    marginBottom: 4,
  },
  alternativeReasoning: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionsContainer: {
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
  actionItem: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  decisionPackContainer: {
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
  productCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productInstructions: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  orderButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expertButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  expertButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdvancedDiagnosticsSystem;
