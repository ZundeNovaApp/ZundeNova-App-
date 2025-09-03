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
import { Picker } from '@react-native-picker/picker';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface CreditApplication {
  id: string;
  farmer_id: string;
  application_date: string;
  requested_amount: number;
  currency: string;
  purpose: 'seeds' | 'fertilizer' | 'equipment' | 'livestock' | 'land_preparation' | 'harvest' | 'other';
  purpose_description: string;
  repayment_period_months: number;
  preferred_repayment_schedule: 'weekly' | 'bi_weekly' | 'monthly' | 'seasonal';
  collateral_type?: 'land' | 'livestock' | 'equipment' | 'crop_insurance' | 'guarantor' | 'none';
  collateral_description?: string;
  farm_records: FarmRecord[];
  income_sources: IncomeSource[];
  expenses: ExpenseRecord[];
  credit_history: CreditHistoryItem[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  credit_score?: number;
  risk_assessment?: RiskAssessment;
  approval_amount?: number;
  interest_rate?: number;
  processing_fee?: number;
  disbursement_date?: string;
  repayment_schedule?: RepaymentSchedule[];
  partner_lender_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FarmRecord {
  id: string;
  farm_size_acres: number;
  crops_grown: string[];
  livestock_count: number;
  annual_production_value: number;
  years_farming: number;
  land_ownership: 'owned' | 'rented' | 'communal' | 'family';
  irrigation_access: boolean;
  storage_facilities: boolean;
  market_access_distance_km: number;
}

interface IncomeSource {
  id: string;
  source: string;
  monthly_amount: number;
  reliability: 'high' | 'medium' | 'low';
  seasonal_variation: boolean;
  documentation_available: boolean;
}

interface ExpenseRecord {
  id: string;
  category: string;
  monthly_amount: number;
  essential: boolean;
  seasonal: boolean;
}

interface CreditHistoryItem {
  id: string;
  lender: string;
  amount: number;
  purpose: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'defaulted';
  payment_history: 'excellent' | 'good' | 'fair' | 'poor';
}

interface RiskAssessment {
  overall_score: number;
  factors: {
    farm_productivity: number;
    income_stability: number;
    debt_to_income_ratio: number;
    credit_history: number;
    collateral_value: number;
    market_access: number;
    climate_risk: number;
  };
  recommendations: string[];
  approval_probability: number;
}

interface RepaymentSchedule {
  id: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'defaulted';
  payment_date?: string;
  payment_method?: string;
}

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  interest_rate_min: number;
  interest_rate_max: number;
  processing_fee_percentage: number;
  collateral_required: boolean;
  target_farmers: string[];
  eligibility_criteria: string[];
  partner_lender: string;
  approval_time_days: number;
}

interface PartnerLender {
  id: string;
  name: string;
  logo: string;
  description: string;
  loan_products: LoanProduct[];
  approval_rate: number;
  average_approval_time_days: number;
  customer_rating: number;
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  supported_regions: string[];
}

const BNPLIntegrationEnhanced: React.FC = () => {
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [partnerLenders, setPartnerLenders] = useState<PartnerLender[]>([]);
  const [activeTab, setActiveTab] = useState<'apply' | 'products' | 'applications' | 'repayments'>('products');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [currentApplication, setCurrentApplication] = useState<Partial<CreditApplication>>({});
  const [loading, setLoading] = useState(true);

  const [applicationForm, setApplicationForm] = useState({
    requested_amount: '',
    purpose: 'seeds' as any,
    purpose_description: '',
    repayment_period_months: '12',
    preferred_repayment_schedule: 'monthly' as any,
    collateral_type: 'none' as any,
    collateral_description: '',
    farm_size_acres: '',
    annual_production_value: '',
    years_farming: '',
    monthly_income: '',
    monthly_expenses: ''
  });

  useEffect(() => {
    loadBNPLData();
  }, []);

  const loadBNPLData = async () => {
    try {
      setLoading(true);
      
      const applicationsData = await offlineStorageService.getOfflineDataByType('credit').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleApplications()
      );
      setApplications(applicationsData);

      const productsData = getSampleLoanProducts();
      setLoanProducts(productsData);

      const lendersData = getSamplePartnerLenders();
      setPartnerLenders(lendersData);

    } catch (error) {
      console.error('Error loading BNPL data:', error);
      setApplications(getSampleApplications());
      setLoanProducts(getSampleLoanProducts());
      setPartnerLenders(getSamplePartnerLenders());
    } finally {
      setLoading(false);
    }
  };

  const getSampleApplications = (): CreditApplication[] => [
    {
      id: 'app_001',
      farmer_id: 'farmer_001',
      application_date: '2024-03-01',
      requested_amount: 1000,
      currency: 'USD',
      purpose: 'seeds',
      purpose_description: 'Purchase hybrid maize seeds for 5-acre plot',
      repayment_period_months: 6,
      preferred_repayment_schedule: 'monthly',
      collateral_type: 'crop_insurance',
      collateral_description: 'Crop insurance policy covering 5 acres of maize',
      farm_records: [
        {
          id: 'farm_001',
          farm_size_acres: 5,
          crops_grown: ['maize', 'beans'],
          livestock_count: 10,
          annual_production_value: 8000,
          years_farming: 8,
          land_ownership: 'owned',
          irrigation_access: true,
          storage_facilities: true,
          market_access_distance_km: 15
        }
      ],
      income_sources: [
        {
          id: 'income_001',
          source: 'Crop Sales',
          monthly_amount: 800,
          reliability: 'high',
          seasonal_variation: true,
          documentation_available: true
        }
      ],
      expenses: [
        {
          id: 'expense_001',
          category: 'Farm Inputs',
          monthly_amount: 300,
          essential: true,
          seasonal: true
        }
      ],
      credit_history: [
        {
          id: 'credit_001',
          lender: 'Village Savings Group',
          amount: 500,
          purpose: 'Fertilizer purchase',
          start_date: '2023-01-01',
          end_date: '2023-06-01',
          status: 'completed',
          payment_history: 'excellent'
        }
      ],
      status: 'approved',
      credit_score: 750,
      risk_assessment: {
        overall_score: 75,
        factors: {
          farm_productivity: 80,
          income_stability: 70,
          debt_to_income_ratio: 85,
          credit_history: 90,
          collateral_value: 60,
          market_access: 75,
          climate_risk: 65
        },
        recommendations: [
          'Strong credit history and farm productivity',
          'Consider crop insurance for climate risk mitigation'
        ],
        approval_probability: 85
      },
      approval_amount: 1000,
      interest_rate: 12,
      processing_fee: 50,
      disbursement_date: '2024-03-05',
      partner_lender_id: 'lender_001',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-05T14:30:00Z'
    }
  ];

  const getSampleLoanProducts = (): LoanProduct[] => [
    {
      id: 'product_001',
      name: 'Seed & Input Financing',
      description: 'Short-term financing for seeds, fertilizers, and other farm inputs',
      min_amount: 100,
      max_amount: 5000,
      min_term_months: 3,
      max_term_months: 12,
      interest_rate_min: 10,
      interest_rate_max: 18,
      processing_fee_percentage: 2,
      collateral_required: false,
      target_farmers: ['smallholder', 'emerging'],
      eligibility_criteria: [
        'Minimum 2 years farming experience',
        'Valid farm registration',
        'No outstanding defaults'
      ],
      partner_lender: 'AgriFinance Plus',
      approval_time_days: 3
    },
    {
      id: 'product_002',
      name: 'Equipment Purchase Loan',
      description: 'Medium-term financing for farm equipment and machinery',
      min_amount: 2000,
      max_amount: 50000,
      min_term_months: 12,
      max_term_months: 60,
      interest_rate_min: 12,
      interest_rate_max: 20,
      processing_fee_percentage: 3,
      collateral_required: true,
      target_farmers: ['emerging', 'commercial'],
      eligibility_criteria: [
        'Minimum 5 years farming experience',
        'Collateral worth 120% of loan amount',
        'Proven income stream'
      ],
      partner_lender: 'Rural Development Bank',
      approval_time_days: 7
    },
    {
      id: 'product_003',
      name: 'Harvest Bridge Loan',
      description: 'Pre-harvest financing to cover immediate expenses',
      min_amount: 500,
      max_amount: 10000,
      min_term_months: 1,
      max_term_months: 6,
      interest_rate_min: 8,
      interest_rate_max: 15,
      processing_fee_percentage: 1.5,
      collateral_required: false,
      target_farmers: ['smallholder', 'emerging', 'commercial'],
      eligibility_criteria: [
        'Standing crop as collateral',
        'Crop insurance recommended',
        'Market contract preferred'
      ],
      partner_lender: 'Harvest Finance Co.',
      approval_time_days: 2
    }
  ];

  const getSamplePartnerLenders = (): PartnerLender[] => {
    const products = getSampleLoanProducts();
    return [
      {
        id: 'lender_001',
        name: 'AgriFinance Plus',
        logo: 'agrifinance_logo.png',
        description: 'Leading agricultural lender specializing in smallholder farmer financing',
        loan_products: [products[0]],
        approval_rate: 78,
        average_approval_time_days: 3,
        customer_rating: 4.2,
        contact_info: {
          phone: '+1234567890',
          email: 'info@agrifinanceplus.com',
          website: 'www.agrifinanceplus.com'
        },
        supported_regions: ['East Africa', 'Southern Africa']
      },
      {
        id: 'lender_002',
        name: 'Rural Development Bank',
        logo: 'rdb_logo.png',
        description: 'Government-backed development bank focused on rural economic growth',
        loan_products: [products[1]],
        approval_rate: 65,
        average_approval_time_days: 7,
        customer_rating: 4.0,
        contact_info: {
          phone: '+1234567891',
          email: 'loans@rdb.gov',
          website: 'www.rdb.gov'
        },
        supported_regions: ['East Africa', 'West Africa', 'Southern Africa']
      }
    ];
  };

  const saveBNPLData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'credit_applications',
        type: 'credit' as any,
        data: applications
      });
    } catch (error) {
      console.error('Error saving BNPL data:', error);
    }
  };

  const calculateCreditScore = (application: Partial<CreditApplication>): number => {
    let score = 600; // Base score

    const yearsExperience = parseInt(applicationForm.years_farming) || 0;
    if (yearsExperience >= 5) score += 50;
    else if (yearsExperience >= 2) score += 25;

    const farmSize = parseFloat(applicationForm.farm_size_acres) || 0;
    const annualValue = parseFloat(applicationForm.annual_production_value) || 0;
    if (farmSize > 0 && annualValue > 0) {
      const productivityPerAcre = annualValue / farmSize;
      if (productivityPerAcre > 1500) score += 75;
      else if (productivityPerAcre > 1000) score += 50;
      else if (productivityPerAcre > 500) score += 25;
    }

    const monthlyIncome = parseFloat(applicationForm.monthly_income) || 0;
    const requestedAmount = parseFloat(applicationForm.requested_amount) || 0;
    if (monthlyIncome > 0 && requestedAmount > 0) {
      const incomeToLoanRatio = (monthlyIncome * 12) / requestedAmount;
      if (incomeToLoanRatio > 3) score += 100;
      else if (incomeToLoanRatio > 2) score += 75;
      else if (incomeToLoanRatio > 1.5) score += 50;
      else if (incomeToLoanRatio > 1) score += 25;
    }

    if (applicationForm.collateral_type !== 'none') {
      score += 50;
    }

    return Math.min(850, Math.max(300, score));
  };

  const submitApplication = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a loan product first');
      return;
    }

    if (!applicationForm.requested_amount || !applicationForm.purpose_description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const requestedAmount = parseFloat(applicationForm.requested_amount);
    if (requestedAmount < selectedProduct.min_amount || requestedAmount > selectedProduct.max_amount) {
      Alert.alert('Error', `Loan amount must be between $${selectedProduct.min_amount} and $${selectedProduct.max_amount}`);
      return;
    }

    const creditScore = calculateCreditScore(currentApplication);

    const newApplication: CreditApplication = {
      id: `app_${Date.now()}`,
      farmer_id: 'current_user',
      application_date: new Date().toISOString().split('T')[0],
      requested_amount: requestedAmount,
      currency: 'USD',
      purpose: applicationForm.purpose,
      purpose_description: applicationForm.purpose_description,
      repayment_period_months: parseInt(applicationForm.repayment_period_months),
      preferred_repayment_schedule: applicationForm.preferred_repayment_schedule,
      collateral_type: applicationForm.collateral_type,
      collateral_description: applicationForm.collateral_description,
      farm_records: [
        {
          id: 'farm_current',
          farm_size_acres: parseFloat(applicationForm.farm_size_acres) || 0,
          crops_grown: ['maize'], // Default
          livestock_count: 0,
          annual_production_value: parseFloat(applicationForm.annual_production_value) || 0,
          years_farming: parseInt(applicationForm.years_farming) || 0,
          land_ownership: 'owned',
          irrigation_access: false,
          storage_facilities: false,
          market_access_distance_km: 20
        }
      ],
      income_sources: [
        {
          id: 'income_current',
          source: 'Farm Income',
          monthly_amount: parseFloat(applicationForm.monthly_income) || 0,
          reliability: 'medium',
          seasonal_variation: true,
          documentation_available: false
        }
      ],
      expenses: [
        {
          id: 'expense_current',
          category: 'Living Expenses',
          monthly_amount: parseFloat(applicationForm.monthly_expenses) || 0,
          essential: true,
          seasonal: false
        }
      ],
      credit_history: [],
      status: 'submitted',
      credit_score: creditScore,
      partner_lender_id: selectedProduct.partner_lender,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setApplications([...applications, newApplication]);
    await saveBNPLData();

    setApplicationForm({
      requested_amount: '',
      purpose: 'seeds',
      purpose_description: '',
      repayment_period_months: '12',
      preferred_repayment_schedule: 'monthly',
      collateral_type: 'none',
      collateral_description: '',
      farm_size_acres: '',
      annual_production_value: '',
      years_farming: '',
      monthly_income: '',
      monthly_expenses: ''
    });

    setShowApplicationModal(false);
    setSelectedProduct(null);
    Alert.alert('Success', `Application submitted successfully! Your credit score is ${creditScore}. You will receive a response within ${selectedProduct.approval_time_days} days.`);
  };

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Loan Products</Text>
      {loanProducts.map(product => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productLender}>{product.partner_lender}</Text>
          </View>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Range:</Text>
              <Text style={styles.detailValue}>${product.min_amount} - ${product.max_amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Term:</Text>
              <Text style={styles.detailValue}>{product.min_term_months} - {product.max_term_months} months</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate:</Text>
              <Text style={styles.detailValue}>{product.interest_rate_min}% - {product.interest_rate_max}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Fee:</Text>
              <Text style={styles.detailValue}>{product.processing_fee_percentage}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Approval Time:</Text>
              <Text style={styles.detailValue}>{product.approval_time_days} days</Text>
            </View>
          </View>

          <View style={styles.eligibilitySection}>
            <Text style={styles.eligibilityTitle}>Eligibility Criteria:</Text>
            {product.eligibility_criteria.map((criteria, index) => (
              <Text key={index} style={styles.eligibilityItem}>• {criteria}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              setSelectedProduct(product);
              setShowApplicationModal(true);
            }}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderApplications = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My Applications</Text>
      {applications.map(application => (
        <View key={application.id} style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <Text style={styles.applicationAmount}>${application.requested_amount}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
              <Text style={styles.statusText}>{application.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.applicationPurpose}>{application.purpose_description}</Text>
          <Text style={styles.applicationDate}>Applied: {application.application_date}</Text>
          
          {application.credit_score && (
            <View style={styles.creditScoreContainer}>
              <Text style={styles.creditScoreLabel}>Credit Score:</Text>
              <Text style={[styles.creditScoreValue, { color: getCreditScoreColor(application.credit_score) }]}>
                {application.credit_score}
              </Text>
            </View>
          )}

          {application.status === 'approved' && application.approval_amount && (
            <View style={styles.approvalDetails}>
              <Text style={styles.approvalTitle}>Approved Details:</Text>
              <Text style={styles.approvalText}>Amount: ${application.approval_amount}</Text>
              <Text style={styles.approvalText}>Interest Rate: {application.interest_rate}%</Text>
              <Text style={styles.approvalText}>Processing Fee: ${application.processing_fee}</Text>
              {application.disbursement_date && (
                <Text style={styles.approvalText}>Disbursed: {application.disbursement_date}</Text>
              )}
            </View>
          )}

          {application.risk_assessment && (
            <View style={styles.riskAssessment}>
              <Text style={styles.riskTitle}>Risk Assessment Score: {application.risk_assessment.overall_score}/100</Text>
              <Text style={styles.riskProbability}>
                Approval Probability: {application.risk_assessment.approval_probability}%
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'disbursed': return '#3B82F6';
      case 'rejected': return '#EF4444';
      case 'under_review': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return '#10B981';
    if (score >= 650) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BNPL Integration</Text>
        <Text style={styles.subtitle}>Buy Now, Pay Later for farm inputs</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            My Applications ({applications.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'applications' && renderApplications()}

      {/* Application Modal */}
      <Modal visible={showApplicationModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Loan Application</Text>
            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedProduct && (
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                <Text style={styles.selectedProductRange}>
                  ${selectedProduct.min_amount} - ${selectedProduct.max_amount} | {selectedProduct.interest_rate_min}% - {selectedProduct.interest_rate_max}%
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Requested Amount ($) *</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.requested_amount}
                onChangeText={(text) => setApplicationForm({...applicationForm, requested_amount: text})}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Purpose *</Text>
              <Picker
                selectedValue={applicationForm.purpose}
                onValueChange={(value) => setApplicationForm({...applicationForm, purpose: value})}
                style={styles.picker}
              >
                <Picker.Item label="Seeds" value="seeds" />
                <Picker.Item label="Fertilizer" value="fertilizer" />
                <Picker.Item label="Equipment" value="equipment" />
                <Picker.Item label="Livestock" value="livestock" />
                <Picker.Item label="Land Preparation" value="land_preparation" />
                <Picker.Item label="Harvest" value="harvest" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Purpose Description *</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.purpose_description}
                onChangeText={(text) => setApplicationForm({...applicationForm, purpose_description: text})}
                placeholder="Describe how you will use the loan"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Repayment Period (months)</Text>
              <Picker
                selectedValue={applicationForm.repayment_period_months}
                onValueChange={(value) => setApplicationForm({...applicationForm, repayment_period_months: value})}
                style={styles.picker}
              >
                <Picker.Item label="3 months" value="3" />
                <Picker.Item label="6 months" value="6" />
                <Picker.Item label="12 months" value="12" />
                <Picker.Item label="18 months" value="18" />
                <Picker.Item label="24 months" value="24" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Farm Size (acres)</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.farm_size_acres}
                onChangeText={(text) => setApplicationForm({...applicationForm, farm_size_acres: text})}
                placeholder="Enter farm size"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Years of Farming Experience</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.years_farming}
                onChangeText={(text) => setApplicationForm({...applicationForm, years_farming: text})}
                placeholder="Enter years of experience"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Monthly Income ($)</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.monthly_income}
                onChangeText={(text) => setApplicationForm({...applicationForm, monthly_income: text})}
                placeholder="Enter monthly income"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Monthly Expenses ($)</Text>
              <TextInput
                style={styles.formInput}
                value={applicationForm.monthly_expenses}
                onChangeText={(text) => setApplicationForm({...applicationForm, monthly_expenses: text})}
                placeholder="Enter monthly expenses"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Collateral Type</Text>
              <Picker
                selectedValue={applicationForm.collateral_type}
                onValueChange={(value) => setApplicationForm({...applicationForm, collateral_type: value})}
                style={styles.picker}
              >
                <Picker.Item label="None" value="none" />
                <Picker.Item label="Land" value="land" />
                <Picker.Item label="Livestock" value="livestock" />
                <Picker.Item label="Equipment" value="equipment" />
                <Picker.Item label="Crop Insurance" value="crop_insurance" />
                <Picker.Item label="Guarantor" value="guarantor" />
              </Picker>
            </View>

            {applicationForm.collateral_type !== 'none' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Collateral Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={applicationForm.collateral_description}
                  onChangeText={(text) => setApplicationForm({...applicationForm, collateral_description: text})}
                  placeholder="Describe your collateral"
                  multiline
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={submitApplication}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  productCard: {
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
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productLender: {
    fontSize: 14,
    color: '#6B7280',
  },
  productDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  productDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  eligibilitySection: {
    marginBottom: 16,
  },
  eligibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  eligibilityItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  applyButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  applicationPurpose: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  creditScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditScoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  creditScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  approvalDetails: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  approvalText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  riskAssessment: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  riskProbability: {
    fontSize: 14,
    color: '#92400E',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  selectedProductInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedProductRange: {
    fontSize: 14,
    color: '#6B7280',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BNPLIntegrationEnhanced;
