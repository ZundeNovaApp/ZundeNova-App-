import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AIDiagnosticCamera from '../components/AIDiagnosticCamera';
import MultiModalDiagnostic from '../components/MultiModalDiagnostic';

export default function DiagnosticScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [useMultiModal, setUseMultiModal] = useState(false);
  const [diagnosticType, setDiagnosticType] = useState<'crop' | 'livestock' | 'soil'>('crop');

  const handleDiagnosisComplete = (result: any) => {
    setShowCamera(false);
    Alert.alert(
      'Diagnosis Complete',
      `Diagnosis: ${result.diagnosis}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\nSeverity: ${result.severity}`,
      [{ text: 'OK' }]
    );
  };

  if (showCamera) {
    if (useMultiModal) {
      return (
        <MultiModalDiagnostic
          onDiagnosisComplete={handleDiagnosisComplete}
          diagnosticType={diagnosticType}
        />
      );
    } else {
      return (
        <AIDiagnosticCamera
          onDiagnosisComplete={handleDiagnosisComplete}
          diagnosticType={diagnosticType}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Diagnostic Tool</Text>
      <Text style={styles.subtitle}>Select what you want to diagnose:</Text>
      
      <TouchableOpacity
        style={[styles.button, diagnosticType === 'crop' && styles.selectedButton]}
        onPress={() => setDiagnosticType('crop')}
      >
        <Text style={styles.buttonText}>Crop Disease</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, diagnosticType === 'livestock' && styles.selectedButton]}
        onPress={() => setDiagnosticType('livestock')}
      >
        <Text style={styles.buttonText}>Livestock Health</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, diagnosticType === 'soil' && styles.selectedButton]}
        onPress={() => setDiagnosticType('soil')}
      >
        <Text style={styles.buttonText}>Soil Analysis</Text>
      </TouchableOpacity>
      
      <View style={styles.diagnosticModeContainer}>
        <Text style={styles.modeTitle}>Diagnostic Mode:</Text>
        <TouchableOpacity
          style={[styles.modeButton, !useMultiModal && styles.selectedModeButton]}
          onPress={() => setUseMultiModal(false)}
        >
          <Text style={styles.modeButtonText}>Quick Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, useMultiModal && styles.selectedModeButton]}
          onPress={() => setUseMultiModal(true)}
        >
          <Text style={styles.modeButtonText}>Enhanced Multi-Modal</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.startButtonText}>
          {useMultiModal ? 'Start Enhanced Diagnosis' : 'Start Quick Diagnosis'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#228B22',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: '#228B22',
    borderColor: '#FFD700',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#228B22',
    padding: 20,
    borderRadius: 10,
    marginTop: 30,
  },
  startButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  diagnosticModeContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedModeButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  modeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
