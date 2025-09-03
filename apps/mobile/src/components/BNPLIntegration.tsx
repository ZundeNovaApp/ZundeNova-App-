import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface CreditAssessment {
  farmerId: string;
  creditScore: number;
  maxLoanAmount: number;
  interestRate: number;
  repaymentTerms: string[];
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    farmHistory: number;
    yieldRecords: number;
    paymentHistory: number;
    landSize: number;
    cropDiversity: number;
  };
}

interface BNPLApplication {
  id: string;
  farmerId: string;
  productIds: string[];
  totalAmount: number;
  requestedAmount: number;
  selectedTerm: string;
  interestRate: number;
  monthlyPayment: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  applicationDate: Date;
  approvalDate?: Date;
  lenderPartner: string;
  collateral?: string;
  guarantor?: string;
}

interface LenderPartner {
  id: string;
  name: string;
  logo: string;
  minAmount: number;
  maxAmount: number;
  interestRates: { term: string; rate: number }[];
  requirements: string[];
  processingTime: string;
  features: string[];
}

export default function BNPLIntegration({ farmerId }: { farmerId: string }) {
  const [view, setView] = useState<'assessment' | 'partners' | 'application' | 'loans'>('assessment');
  const [creditAssessment, setCreditAssessment] = useState<CreditAssessment | null>(null);
  const [lenderPartners] = useState<LenderPartner[]>([
    {
      id: 'agri_finance',
      name: 'AgriFinance Plus',
      logo: '🏦',
      minAmount: 100,
      maxAmount: 10000,
      interestRates: [
        { term: '3 months', rate: 8.5 },
        { term: '6 months', rate: 12.0 },
        { term: '12 months', rate: 15.5 }
      ],
      requirements: ['Valid ID', 'Farm ownership proof', 'Previous harvest records'],
      processingTime: '24-48 hours',
      features: ['Flexible repayment', 'No collateral for amounts under $1000', 'Harvest-based payments']
    },
    {
      id: 'rural_credit',
      name: 'Rural Credit Union',
      logo: '🌾',
      minAmount: 50,
      maxAmount: 5000,
      interestRates: [
        { term: '3 months', rate: 7.0 },
        { term: '6 months', rate: 10.5 },
        { term: '12 months', rate: 14.0 }
      ],
      requirements: ['Community membership', 'Two guarantors', 'Land title'],
      processingTime: '3-5 days',
      features: ['Community-backed', 'Lower interest rates', 'Group lending options']
    },
    {
      id: 'micro_lend',
      name: 'MicroLend Africa',
      logo: '💳',
      minAmount: 25,
      maxAmount: 2000,
      interestRates: [
        { term: '1 month', rate: 5.0 },
        { term: '3 months', rate: 9.0 },
        { term: '6 months', rate: 13.0 }
      ],
      requirements: ['Mobile money account', 'Basic KYC', 'Phone verification'],
      processingTime: '1-2 hours',
      features: ['Instant approval', 'Mobile-first', 'Micro-loans for inputs']
    }
  ]);
  const [applications, setApplications] = useState<BNPLApplication[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<LenderPartner | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    amount: '',
    term: '',
    purpose: '',
    collateral: '',
    guarantor: ''
  });

  useEffect(() => {
    loadCreditData();
    performCreditAssessment();
  }, [farmerId]);

  const loadCreditData = async () => {
    try {
      const creditData = await offlineStorageService.getOfflineDataByType('credit');
      const farmerApplications = creditData.filter(data => data.data.farmerId === farmerId);
      setApplications(farmerApplications.map(data => data.data));
    } catch (error) {
      console.error('Failed to load credit data:', error);
    }
  };

  const performCreditAssessment = async () => {
    try {
      const farmData = await offlineStorageService.getOfflineDataByType('farm');
      const financialData = await offlineStorageService.getOfflineDataByType('financial');
      
      const farmerFarms = farmData.filter(data => data.data.ownerId === farmerId);
      const farmerFinancials = financialData.filter(data => data.data.farmerId === farmerId);

      const farmHistory = Math.min(farmerFarms.length * 20, 100);
      const yieldRecords = Math.min(farmerFinancials.length * 15, 100);
      const paymentHistory = 85;
      const landSize = Math.min(farmerFarms.reduce((sum, farm) => sum + (farm.data.size || 0), 0) * 10, 100);
      const cropDiversity = Math.min(farmerFarms.reduce((sum, farm) => sum + (farm.data.crops?.length || 0), 0) * 25, 100);

      const creditScore = Math.round((farmHistory + yieldRecords + paymentHistory + landSize + cropDiversity) / 5);
      
      let maxLoanAmount = 0;
      let interestRate = 20;
      let riskLevel: 'low' | 'medium' | 'high' = 'high';

      if (creditScore >= 80) {
        maxLoanAmount = 10000;
        interestRate = 8;
        riskLevel = 'low';
      } else if (creditScore >= 60) {
        maxLoanAmount = 5000;
        interestRate = 12;
        riskLevel = 'medium';
      } else {
        maxLoanAmount = 1000;
        interestRate = 18;
        riskLevel = 'high';
      }

      const assessment: CreditAssessment = {
        farmerId,
        creditScore,
        maxLoanAmount,
        interestRate,
        repaymentTerms: ['1 month', '3 months', '6 months', '12 months'],
        riskLevel,
        factors: {
          farmHistory,
          yieldRecords,
          paymentHistory,
          landSize,
          cropDiversity
        }
      };

      setCreditAssessment(assessment);

      await offlineStorageService.storeOfflineData({
        id: `assessment_${farmerId}`,
        type: 'credit',
        data: assessment
      });
    } catch (error) {
      console.error('Failed to perform credit assessment:', error);
    }
  };

  const submitApplication = async () => {
    if (!selectedPartner || !applicationForm.amount || !applicationForm.term) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(applicationForm.amount);
    if (amount > (creditAssessment?.maxLoanAmount || 0)) {
      Alert.alert('Error', `Amount exceeds your credit limit of $${creditAssessment?.maxLoanAmount}`);
      return;
    }

    const selectedRate = selectedPartner.interestRates.find(rate => rate.term === applicationForm.term);
    if (!selectedRate) {
      Alert.alert('Error', 'Invalid repayment term selected');
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(amount, selectedRate.rate, applicationForm.term);

    const application: BNPLApplication = {
      id: `bnpl_${Date.now()}`,
      farmerId,
      productIds: [],
      totalAmount: amount,
      requestedAmount: amount,
      selectedTerm: applicationForm.term,
      interestRate: selectedRate.rate,
      monthlyPayment,
      status: 'pending',
      applicationDate: new Date(),
      lenderPartner: selectedPartner.id,
      collateral: applicationForm.collateral,
      guarantor: applicationForm.guarantor
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: application.id,
        type: 'credit',
        data: application
      });

      setApplications([...applications, application]);
      setApplicationForm({ amount: '', term: '', purpose: '', collateral: '', guarantor: '' });
      setSelectedPartner(null);
      setView('loans');
      Alert.alert('Success', 'BNPL application submitted successfully');
    } catch (error) {
      console.error('Failed to submit application:', error);
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  const calculateMonthlyPayment = (amount: number, annualRate: number, term: string): number => {
    const months = parseInt(term.split(' ')[0]);
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) return amount / months;
    
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment * 100) / 100;
  };

  const renderCreditAssessment = () => {
    if (!creditAssessment) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Performing credit assessment...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Credit Assessment</Text>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{creditAssessment.creditScore}</Text>
          <Text style={styles.scoreLabel}>Credit Score</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(creditAssessment.riskLevel) }]}>
            <Text style={styles.riskText}>{creditAssessment.riskLevel.toUpperCase()} RISK</Text>
          </View>
        </View>

        <View style={styles.limitsCard}>
          <Text style={styles.cardTitle}>Credit Limits</Text>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Maximum Loan Amount:</Text>
            <Text style={styles.limitValue}>${creditAssessment.maxLoanAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Base Interest Rate:</Text>
            <Text style={styles.limitValue}>{creditAssessment.interestRate}% p.a.</Text>
          </View>
        </View>

        <View style={styles.factorsCard}>
          <Text style={styles.cardTitle}>Assessment Factors</Text>
          {Object.entries(creditAssessment.factors).map(([key, value]) => (
            <View key={key} style={styles.factorRow}>
              <Text style={styles.factorLabel}>{formatFactorName(key)}:</Text>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${value}%` }]} />
              </View>
              <Text style={styles.factorValue}>{value}%</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => setView('partners')}
        >
          <Text style={styles.continueButtonText}>View Lender Partners</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderLenderPartners = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lender Partners</Text>
      
      {lenderPartners.map(partner => (
        <View key={partner.id} style={styles.partnerCard}>
          <View style={styles.partnerHeader}>
            <Text style={styles.partnerLogo}>{partner.logo}</Text>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerRange}>
                ${partner.minAmount} - ${partner.maxAmount.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => {
                setSelectedPartner(partner);
                setView('application');
              }}
            >
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.partnerDetails}>
            <Text style={styles.detailLabel}>Interest Rates:</Text>
            {partner.interestRates.map(rate => (
              <Text key={rate.term} style={styles.detailText}>
                {rate.term}: {rate.rate}% p.a.
              </Text>
            ))}
            
            <Text style={styles.detailLabel}>Processing Time:</Text>
            <Text style={styles.detailText}>{partner.processingTime}</Text>
            
            <Text style={styles.detailLabel}>Key Features:</Text>
            {partner.features.map((feature, index) => (
              <Text key={index} style={styles.featureText}>• {feature}</Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderApplication = () => {
    if (!selectedPartner) return null;

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>BNPL Application</Text>
        <Text style={styles.subtitle}>Applying with {selectedPartner.name}</Text>
        
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Loan Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Min: $${selectedPartner.minAmount}, Max: $${Math.min(selectedPartner.maxAmount, creditAssessment?.maxLoanAmount || 0)}`}
            value={applicationForm.amount}
            onChangeText={(text) => setApplicationForm({ ...applicationForm, amount: text })}
            keyboardType="numeric"
          />

          <Text style={styles.formLabel}>Repayment Term</Text>
          <View style={styles.termSelector}>
            {selectedPartner.interestRates.map(rate => (
              <TouchableOpacity
                key={rate.term}
                style={[
                  styles.termButton,
                  applicationForm.term === rate.term && styles.selectedTerm
                ]}
                onPress={() => setApplicationForm({ ...applicationForm, term: rate.term })}
              >
                <Text style={styles.termText}>{rate.term}</Text>
                <Text style={styles.termRate}>{rate.rate}% p.a.</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Purpose of Loan</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Seeds and fertilizer for maize season"
            value={applicationForm.purpose}
            onChangeText={(text) => setApplicationForm({ ...applicationForm, purpose: text })}
            multiline
          />

          {selectedPartner.requirements.includes('collateral') && (
            <>
              <Text style={styles.formLabel}>Collateral (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Description of collateral"
                value={applicationForm.collateral}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, collateral: text })}
              />
            </>
          )}

          {selectedPartner.requirements.includes('Two guarantors') && (
            <>
              <Text style={styles.formLabel}>Guarantor Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Guarantor name and contact"
                value={applicationForm.guarantor}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, guarantor: text })}
              />
            </>
          )}

          {applicationForm.amount && applicationForm.term && (
            <View style={styles.calculationCard}>
              <Text style={styles.calculationTitle}>Loan Summary</Text>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Loan Amount:</Text>
                <Text style={styles.calculationValue}>${applicationForm.amount}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Monthly Payment:</Text>
                <Text style={styles.calculationValue}>
                  ${calculateMonthlyPayment(
                    parseFloat(applicationForm.amount) || 0,
                    selectedPartner.interestRates.find(r => r.term === applicationForm.term)?.rate || 0,
                    applicationForm.term
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={submitApplication}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderLoans = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My BNPL Loans</Text>
      
      {applications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No loan applications yet</Text>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setView('assessment')}
          >
            <Text style={styles.applyButtonText}>Apply for BNPL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        applications.map(application => (
          <View key={application.id} style={styles.loanCard}>
            <View style={styles.loanHeader}>
              <Text style={styles.loanAmount}>${application.requestedAmount}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                <Text style={styles.statusText}>{application.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.loanDetails}>
              <Text style={styles.loanLabel}>Lender: {getLenderName(application.lenderPartner)}</Text>
              <Text style={styles.loanLabel}>Term: {application.selectedTerm}</Text>
              <Text style={styles.loanLabel}>Monthly Payment: ${application.monthlyPayment}</Text>
              <Text style={styles.loanLabel}>
                Applied: {application.applicationDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#e8f5e8';
      case 'medium': return '#fff3cd';
      case 'high': return '#f8d7da';
      default: return '#f8f9fa';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#d4edda';
      case 'active': return '#cce5ff';
      case 'rejected': return '#f8d7da';
      case 'completed': return '#e2e3e5';
      default: return '#fff3cd';
    }
  };

  const formatFactorName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getLenderName = (partnerId: string) => {
    return lenderPartners.find(p => p.id === partnerId)?.name || 'Unknown Lender';
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, view === 'assessment' && styles.activeTab]}
          onPress={() => setView('assessment')}
        >
          <Text style={[styles.tabText, view === 'assessment' && styles.activeTabText]}>Assessment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'partners' && styles.activeTab]}
          onPress={() => setView('partners')}
        >
          <Text style={[styles.tabText, view === 'partners' && styles.activeTabText]}>Partners</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'loans' && styles.activeTab]}
          onPress={() => setView('loans')}
        >
          <Text style={[styles.tabText, view === 'loans' && styles.activeTabText]}>My Loans</Text>
        </TouchableOpacity>
      </View>

      {view === 'assessment' && renderCreditAssessment()}
      {view === 'partners' && renderLenderPartners()}
      {view === 'application' && renderApplication()}
      {view === 'loans' && renderLoans()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scoreCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#228B22',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  riskBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  limitsCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  limitLabel: {
    fontSize: 14,
    color: '#666',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  factorsCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  factorLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  factorBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  factorFill: {
    height: '100%',
    backgroundColor: '#228B22',
    borderRadius: 4,
  },
  factorValue: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: '#228B22',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  partnerLogo: {
    fontSize: 32,
    marginRight: 15,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  partnerRange: {
    fontSize: 14,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  partnerDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  formCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  termSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  termButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    minWidth: 100,
  },
  selectedTerm: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  termText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  termRate: {
    fontSize: 12,
    color: '#666',
  },
  calculationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loanCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  loanDetails: {
    gap: 5,
  },
  loanLabel: {
    fontSize: 14,
    color: '#666',
  },
});
