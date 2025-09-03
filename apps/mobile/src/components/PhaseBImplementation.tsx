import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface PhaseBStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  component?: string;
}

const PHASE_B_STEPS: PhaseBStep[] = [
  {
    id: 'quality_grading',
    title: 'Quality Grading & Lot Management',
    description: 'Enable sellers to list lots with QC grade, photos, lab certificates',
    status: 'pending',
    component: 'QualityGrading'
  },
  {
    id: 'escrow_payments',
    title: 'Escrow & Milestone Payments',
    description: 'Support deposits, staged payments for large orders',
    status: 'pending',
    component: 'EscrowPayment'
  },
  {
    id: 'cross_border_trade',
    title: 'Cross-Border Trade Module',
    description: 'Auto-generate customs forms, estimate duties, show routes',
    status: 'pending',
    component: 'CrossBorderTrade'
  },
  {
    id: 'buyer_rating',
    title: 'Buyer Rating & Contract System',
    description: 'Standard sale agreements, dispute resolution workflow',
    status: 'pending',
    component: 'BuyerRating'
  },
  {
    id: 'enhanced_catalog',
    title: 'Enhanced Product Catalog',
    description: 'Product variants, tenant-specific availability, promotional pricing',
    status: 'pending',
    component: 'EnhancedCatalog'
  }
];

export const PhaseBImplementation: React.FC = () => {
  const [steps, setSteps] = useState<PhaseBStep[]>(PHASE_B_STEPS);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedSteps = await offlineStorageService.getOfflineDataByType('phase_b_progress');
      if (savedSteps.length > 0) {
        setSteps(savedSteps[0].data.steps);
        setCurrentStep(savedSteps[0].data.currentStep);
        calculateProgress(savedSteps[0].data.steps);
      }
    } catch (error) {
      console.error('Failed to load Phase B progress:', error);
    }
  };

  const saveProgress = async (updatedSteps: PhaseBStep[], current: string | null) => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'phase_b_progress',
        type: 'phase_b_progress' as any,
        data: {
          steps: updatedSteps,
          currentStep: current,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to save Phase B progress:', error);
    }
  };

  const calculateProgress = (stepList: PhaseBStep[]) => {
    const completed = stepList.filter(step => step.status === 'completed').length;
    const progressPercent = (completed / stepList.length) * 100;
    setProgress(progressPercent);
  };

  const startStep = async (stepId: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId 
        ? { ...step, status: 'in_progress' as const }
        : step
    );
    
    setSteps(updatedSteps);
    setCurrentStep(stepId);
    calculateProgress(updatedSteps);
    await saveProgress(updatedSteps, stepId);

    Alert.alert(
      'Step Started',
      `Starting implementation of ${steps.find(s => s.id === stepId)?.title}`,
      [{ text: 'OK' }]
    );
  };

  const completeStep = async (stepId: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId 
        ? { ...step, status: 'completed' as const }
        : step
    );
    
    setSteps(updatedSteps);
    setCurrentStep(null);
    calculateProgress(updatedSteps);
    await saveProgress(updatedSteps, null);

    Alert.alert(
      'Step Completed',
      `Successfully completed ${steps.find(s => s.id === stepId)?.title}`,
      [{ text: 'OK' }]
    );
  };

  const resetProgress = async () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all Phase B progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const resetSteps = PHASE_B_STEPS.map(step => ({ ...step, status: 'pending' as const }));
            setSteps(resetSteps);
            setCurrentStep(null);
            setProgress(0);
            await saveProgress(resetSteps, null);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22C55E';
      case 'in_progress': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phase B: Marketplace & Trade Enhancements</Text>
        <Text style={styles.subtitle}>Advanced marketplace features and cross-border trade</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              <View style={styles.stepStatus}>
                <Text style={styles.statusIcon}>{getStatusIcon(step.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(step.status) }]}>
                  {step.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.stepActions}>
              {step.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => startStep(step.id)}
                >
                  <Text style={styles.buttonText}>Start Implementation</Text>
                </TouchableOpacity>
              )}
              
              {step.status === 'in_progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => completeStep(step.id)}
                >
                  <Text style={styles.buttonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}

              {step.status === 'completed' && (
                <View style={styles.completedIndicator}>
                  <Text style={styles.completedText}>✅ Implementation Complete</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Phase B focuses on advanced marketplace features including quality grading,
          escrow payments, cross-border trade, and enhanced product catalogs.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  stepsContainer: {
    padding: 16,
  },
  stepCard: {
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#228B22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepActions: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#228B22',
  },
  completeButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedIndicator: {
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PhaseBImplementation;
