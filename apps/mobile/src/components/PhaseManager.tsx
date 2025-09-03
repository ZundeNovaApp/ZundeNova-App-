import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhaseAImplementation from './PhaseAImplementation';
import PhaseBImplementation from './PhaseBImplementation';
import PhaseAComplete from './PhaseAComplete';

type Phase = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

interface PhaseManagerProps {
  farmId: string;
}

export default function PhaseManager({ farmId }: PhaseManagerProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('A');
  const [completedPhases, setCompletedPhases] = useState<Phase[]>([]);

  const handlePhaseComplete = (phase: Phase) => {
    setCompletedPhases(prev => [...prev, phase]);
    
    const nextPhase = getNextPhase(phase);
    if (nextPhase) {
      setCurrentPhase(nextPhase);
    }
  };

  const getNextPhase = (phase: Phase): Phase | null => {
    const phases: Phase[] = ['A', 'B', 'C', 'D', 'E', 'F'];
    const currentIndex = phases.indexOf(phase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'A':
        return (
          <PhaseAImplementation
            farmId={farmId}
            onComplete={() => handlePhaseComplete('A')}
          />
        );
      case 'B':
        return (
          <PhaseBImplementation
            farmId={farmId}
            onComplete={() => handlePhaseComplete('B')}
          />
        );
      case 'C':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Phase C: Learning and Community</Text>
            <Text style={styles.comingSoonText}>Coming Soon...</Text>
          </View>
        );
      case 'D':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Phase D: Field Agent and Gamification</Text>
            <Text style={styles.comingSoonText}>Coming Soon...</Text>
          </View>
        );
      case 'E':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Phase E: Advanced Integrations</Text>
            <Text style={styles.comingSoonText}>Coming Soon...</Text>
          </View>
        );
      case 'F':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Phase F: Traceability and Enterprise</Text>
            <Text style={styles.comingSoonText}>Coming Soon...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.phaseIndicator}>
        <Text style={styles.phaseTitle}>ZundeNova Enhancement Phases</Text>
        <View style={styles.phaseProgress}>
          {(['A', 'B', 'C', 'D', 'E', 'F'] as Phase[]).map(phase => (
            <View
              key={phase}
              style={[
                styles.phaseStep,
                completedPhases.includes(phase) && styles.phaseCompleted,
                currentPhase === phase && styles.phaseCurrent
              ]}
            >
              <Text style={[
                styles.phaseStepText,
                (completedPhases.includes(phase) || currentPhase === phase) && styles.phaseStepTextActive
              ]}>
                {phase}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      {renderCurrentPhase()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  phaseIndicator: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  phaseProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCompleted: {
    backgroundColor: '#10B981',
  },
  phaseCurrent: {
    backgroundColor: '#228B22',
  },
  phaseStepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  phaseStepTextActive: {
    color: 'white',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
