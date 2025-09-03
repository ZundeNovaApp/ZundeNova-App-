import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface InsuranceApplicationProps {
  farmId: string;
  onApplicationComplete: (result: any) => void;
}

export default function InsuranceApplication({ farmId, onApplicationComplete }: InsuranceApplicationProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [step, setStep] = useState<'selection' | 'application' | 'result'>('selection');
  const [applicationResult, setApplicationResult] = useState<any>(null);

  const policyTypes = [
    {
      id: 'weather_index',
      name: 'Weather Index Insurance',
      description: 'Protection against weather-related crop losses',
      coverage: 'Up to $5,000 per hectare',
      premium: '5% of coverage amount',
      features: [
        'Automatic payouts based on weather data',
        'No field inspections required',
        'Quick claim processing',
        'Covers drought, excess rain, frost'
      ]
    },
    {
      id: 'crop_yield',
      name: 'Crop Yield Insurance',
      description: 'Comprehensive crop yield protection',
      coverage: 'Up to 80% of expected yield value',
      premium: '8% of coverage amount',
      features: [
        'Covers all yield losses',
        'Expert field assessment',
        'Multiple crop types supported',
        'Replanting cost coverage'
      ]
    },
    {
      id: 'livestock_mortality',
      name: 'Livestock Mortality Insurance',
      description: 'Protection against livestock losses',
      coverage: 'Up to market value per animal',
      premium: '6% of coverage amount',
      features: [
        'Disease outbreak coverage',
        'Accident protection',
        'Veterinary cost coverage',
        'Quick claim settlement'
      ]
    }
  ];

  const applyForInsurance = async () => {
    if (!selectedPolicy) {
      Alert.alert('Error', 'Please select an insurance policy');
      return;
    }

    setStep('application');

    setTimeout(async () => {
      const policy = policyTypes.find(p => p.id === selectedPolicy);
      const coverageAmount = 5000;
      const premium = coverageAmount * 0.05;

      const result = {
        id: `ins_${Date.now()}`,
        farmId,
        policyType: selectedPolicy,
        policyNumber: `POL-${Date.now()}`,
        coverageAmount,
        premium,
        currency: 'USD',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'active',
        parameters: selectedPolicy === 'weather_index' ? [
          { parameter: 'rainfall', threshold: 50, unit: 'mm', triggerCondition: 'below', payoutPercentage: 100 },
          { parameter: 'temperature', threshold: 35, unit: 'celsius', triggerCondition: 'above', payoutPercentage: 50 }
        ] : [],
        claims: []
      };

      await offlineStorageService.storeOfflineData({
        id: `insurance_${result.id}`,
        type: 'farm',
        data: result
      });

      setApplicationResult(result);
      setStep('result');
    }, 2000);
  };

  const renderPolicySelection = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose Insurance Policy</Text>
      <Text style={styles.subtitle}>Protect your farm with comprehensive insurance coverage</Text>

      {policyTypes.map(policy => (
        <TouchableOpacity
          key={policy.id}
          style={[
            styles.policyCard,
            selectedPolicy === policy.id && styles.selectedPolicyCard
          ]}
          onPress={() => setSelectedPolicy(policy.id)}
        >
          <View style={styles.policyHeader}>
            <Text style={styles.policyName}>{policy.name}</Text>
            {selectedPolicy === policy.id && <Text style={styles.selectedIcon}>✓</Text>}
          </View>
          
          <Text style={styles.policyDescription}>{policy.description}</Text>
          
          <View style={styles.policyDetails}>
            <Text style={styles.policyDetailItem}>Coverage: {policy.coverage}</Text>
            <Text style={styles.policyDetailItem}>Premium: {policy.premium}</Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features:</Text>
            {policy.features.map((feature, index) => (
              <Text key={index} style={styles.featureItem}>• {feature}</Text>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.applyButton, !selectedPolicy && styles.disabledButton]}
        onPress={applyForInsurance}
        disabled={!selectedPolicy}
      >
        <Text style={styles.applyButtonText}>Apply for Insurance</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderApplication = () => (
    <View style={styles.applicationContainer}>
      <Text style={styles.applicationTitle}>Processing Your Application</Text>
      <Text style={styles.applicationSubtitle}>Setting up your insurance policy...</Text>
      <View style={styles.loadingIndicator}>
        <Text style={styles.loadingText}>⏳ Please wait...</Text>
      </View>
    </View>
  );

  const renderResult = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insurance Policy Active</Text>
      
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>🛡️ Your farm is now protected!</Text>
        
        <View style={styles.policyCard}>
          <Text style={styles.policyNumber}>Policy Number: {applicationResult?.policyNumber}</Text>
          <Text style={styles.policyType}>
            Type: {policyTypes.find(p => p.id === applicationResult?.policyType)?.name}
          </Text>
          <Text style={styles.coverageAmount}>
            Coverage: ${applicationResult?.coverageAmount?.toLocaleString()}
          </Text>
          <Text style={styles.premium}>
            Annual Premium: ${applicationResult?.premium?.toFixed(2)}
          </Text>
          <Text style={styles.validity}>
            Valid until: {applicationResult?.endDate?.toLocaleDateString()}
          </Text>
        </View>

        {applicationResult?.parameters?.length > 0 && (
          <View style={styles.parametersCard}>
            <Text style={styles.parametersTitle}>Coverage Parameters:</Text>
            {applicationResult.parameters.map((param: any, index: number) => (
              <Text key={index} style={styles.parameterItem}>
                • {param.parameter}: {param.triggerCondition} {param.threshold}{param.unit} 
                ({param.payoutPercentage}% payout)
              </Text>
            ))}
          </View>
        )}

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next:</Text>
          <Text style={styles.nextStepItem}>• Your policy is immediately active</Text>
          <Text style={styles.nextStepItem}>• Monitor weather conditions in your dashboard</Text>
          <Text style={styles.nextStepItem}>• Automatic payouts for qualifying events</Text>
          <Text style={styles.nextStepItem}>• Contact support for any questions</Text>
        </View>

        <TouchableOpacity style={styles.claimButton}>
          <Text style={styles.claimButtonText}>File a Claim</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => onApplicationComplete(applicationResult)}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  switch (step) {
    case 'selection':
      return renderPolicySelection();
    case 'application':
      return renderApplication();
    case 'result':
      return renderResult();
    default:
      return renderPolicySelection();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  policyCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPolicyCard: {
    borderColor: '#10B981',
    backgroundColor: '#e8f5e8',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  selectedIcon: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  policyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  policyDetails: {
    marginBottom: 15,
  },
  policyDetailItem: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  applyButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  applicationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  applicationSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingIndicator: {
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#10B981',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 30,
  },
  policyNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  policyType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  coverageAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 5,
  },
  premium: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  validity: {
    fontSize: 14,
    color: '#666',
  },
  parametersCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
  },
  parametersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  parameterItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  nextStepsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nextStepItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  claimButton: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
