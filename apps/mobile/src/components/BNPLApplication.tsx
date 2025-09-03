import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface BNPLApplicationProps {
  farmId: string;
  onApplicationComplete: (result: any) => void;
}

export default function BNPLApplication({ farmId, onApplicationComplete }: BNPLApplicationProps) {
  const [application, setApplication] = useState({
    requestedAmount: '',
    purpose: '',
    products: [] as any[]
  });
  const [step, setStep] = useState<'form' | 'assessment' | 'result'>('form');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const submitApplication = async () => {
    if (!application.requestedAmount || !application.purpose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setStep('assessment');

    setTimeout(async () => {
      const mockAssessment = {
        score: Math.floor(Math.random() * 300) + 500,
        riskLevel: 'medium',
        recommendedLimit: parseFloat(application.requestedAmount) * 0.8,
        factors: [
          { factor: 'Farm size', value: 25, weight: 0.3, impact: 'positive' },
          { factor: 'Transaction history', value: 85, weight: 0.4, impact: 'positive' },
          { factor: 'Crop diversity', value: 3, weight: 0.3, impact: 'positive' }
        ]
      };

      const result: any = {
        id: `bnpl_${Date.now()}`,
        farmId,
        requestedAmount: parseFloat(application.requestedAmount),
        purpose: application.purpose,
        creditAssessment: mockAssessment,
        status: mockAssessment.score > 650 ? 'approved' : 'pending',
        applicationDate: new Date()
      };

      if (result.status === 'approved') {
        result.approvedAmount = mockAssessment.recommendedLimit;
        result.interestRate = 12.5;
        result.repaymentTerms = {
          totalAmount: mockAssessment.recommendedLimit * 1.125,
          installments: 6,
          installmentAmount: (mockAssessment.recommendedLimit * 1.125) / 6,
          frequency: 'monthly'
        };
      }

      await offlineStorageService.storeOfflineData({
        id: `bnpl_${result.id}`,
        type: 'farm',
        data: result
      });

      setAssessmentResult(result);
      setStep('result');
    }, 3000);
  };

  const renderForm = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Apply for Input Financing</Text>
      <Text style={styles.subtitle}>Get the inputs you need now, pay later</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Requested Amount (USD)</Text>
          <TextInput
            style={styles.textInput}
            value={application.requestedAmount}
            onChangeText={(text) => setApplication({ ...application, requestedAmount: text })}
            placeholder="Enter amount needed"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Purpose</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={application.purpose}
            onChangeText={(text) => setApplication({ ...application, purpose: text })}
            placeholder="What will you use this financing for?"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          <Text style={styles.benefitItem}>• No collateral required</Text>
          <Text style={styles.benefitItem}>• Flexible repayment terms</Text>
          <Text style={styles.benefitItem}>• Competitive interest rates</Text>
          <Text style={styles.benefitItem}>• Quick approval process</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={submitApplication}>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAssessment = () => (
    <View style={styles.assessmentContainer}>
      <Text style={styles.assessmentTitle}>Processing Your Application</Text>
      <Text style={styles.assessmentSubtitle}>Analyzing your farm data and credit profile...</Text>
      <View style={styles.loadingIndicator}>
        <Text style={styles.loadingText}>⏳ Please wait...</Text>
      </View>
    </View>
  );

  const renderResult = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Application Result</Text>
      
      {assessmentResult?.status === 'approved' ? (
        <View style={styles.approvedContainer}>
          <Text style={styles.approvedTitle}>✅ Congratulations! Your application is approved</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Approved Amount</Text>
            <Text style={styles.approvedAmount}>${assessmentResult.approvedAmount?.toFixed(2)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Repayment Terms</Text>
            <Text style={styles.resultDetail}>
              {assessmentResult.repaymentTerms?.installments} monthly payments of ${assessmentResult.repaymentTerms?.installmentAmount?.toFixed(2)}
            </Text>
            <Text style={styles.resultDetail}>
              Interest Rate: {assessmentResult.interestRate}%
            </Text>
          </View>

          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept Terms & Proceed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingTitle}>⏳ Application Under Review</Text>
          <Text style={styles.pendingText}>
            Your application is being reviewed. We'll notify you within 24 hours.
          </Text>
        </View>
      )}

      <View style={styles.creditScoreCard}>
        <Text style={styles.creditScoreTitle}>Credit Assessment</Text>
        <Text style={styles.creditScore}>Score: {assessmentResult?.creditAssessment?.score}</Text>
        <Text style={styles.riskLevel}>Risk Level: {assessmentResult?.creditAssessment?.riskLevel}</Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => onApplicationComplete(assessmentResult)}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  switch (step) {
    case 'form':
      return renderForm();
    case 'assessment':
      return renderAssessment();
    case 'result':
      return renderResult();
    default:
      return renderForm();
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
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  benefitItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assessmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  assessmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  assessmentSubtitle: {
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
  approvedContainer: {
    alignItems: 'center',
  },
  approvedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  approvedAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  resultDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 15,
  },
  pendingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  creditScoreCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  creditScoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  creditScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 5,
  },
  riskLevel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
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
