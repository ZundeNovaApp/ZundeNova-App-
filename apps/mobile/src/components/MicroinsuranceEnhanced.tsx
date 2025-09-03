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

interface InsurancePolicy {
  id: string;
  policy_number: string;
  farmer_id: string;
  policy_type: 'weather_index' | 'crop_yield' | 'livestock_mortality' | 'multi_peril' | 'area_yield';
  coverage_type: 'parametric' | 'indemnity' | 'hybrid';
  insured_asset: {
    type: 'crop' | 'livestock' | 'equipment' | 'farm_infrastructure';
    description: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    value: number;
  };
  coverage_details: {
    sum_insured: number;
    premium_amount: number;
    deductible: number;
    coverage_percentage: number;
    policy_period_start: string;
    policy_period_end: string;
  };
  weather_parameters?: {
    rainfall_threshold_mm: number;
    temperature_threshold_celsius: number;
    drought_days_threshold: number;
    flood_threshold_mm: number;
    wind_speed_threshold_kmh: number;
  };
  triggers: InsuranceTrigger[];
  claims: InsuranceClaim[];
  premium_payments: PremiumPayment[];
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending_approval';
  insurance_provider: string;
  agent_id?: string;
  documents: PolicyDocument[];
  created_at: string;
  updated_at: string;
}

interface InsuranceTrigger {
  id: string;
  trigger_type: 'weather_event' | 'yield_loss' | 'mortality_rate' | 'price_drop';
  parameter: string;
  threshold_value: number;
  actual_value?: number;
  measurement_date?: string;
  data_source: string;
  verification_status: 'pending' | 'verified' | 'disputed';
  payout_percentage: number;
  triggered: boolean;
  triggered_date?: string;
}

interface InsuranceClaim {
  id: string;
  policy_id: string;
  claim_number: string;
  claim_date: string;
  claim_type: 'automatic_trigger' | 'manual_submission';
  claimed_amount: number;
  loss_description: string;
  loss_date: string;
  evidence: ClaimEvidence[];
  assessment: ClaimAssessment;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'disputed';
  payout_amount?: number;
  payout_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface ClaimEvidence {
  id: string;
  evidence_type: 'photo' | 'video' | 'document' | 'weather_data' | 'satellite_imagery';
  file_path: string;
  description: string;
  capture_date: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface ClaimAssessment {
  assessor_id: string;
  assessment_date: string;
  loss_percentage: number;
  recommended_payout: number;
  assessment_notes: string;
  field_visit_required: boolean;
  field_visit_date?: string;
  final_assessment: boolean;
}

interface PremiumPayment {
  id: string;
  policy_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'crop_proceeds';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_reference: string;
  due_date: string;
  late_fee?: number;
}

interface PolicyDocument {
  id: string;
  document_type: 'policy_certificate' | 'terms_conditions' | 'claim_form' | 'payment_receipt';
  file_path: string;
  upload_date: string;
  verified: boolean;
}

interface InsuranceProduct {
  id: string;
  name: string;
  description: string;
  policy_type: 'weather_index' | 'crop_yield' | 'livestock_mortality' | 'multi_peril' | 'area_yield';
  coverage_type: 'parametric' | 'indemnity' | 'hybrid';
  target_crops: string[];
  target_livestock: string[];
  premium_rate_percentage: number;
  minimum_coverage: number;
  maximum_coverage: number;
  deductible_percentage: number;
  policy_duration_months: number;
  eligibility_criteria: string[];
  exclusions: string[];
  provider: string;
  available_regions: string[];
  weather_stations_required: boolean;
  satellite_data_source: string;
}

interface WeatherData {
  date: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rainfall_mm: number;
  temperature_max_celsius: number;
  temperature_min_celsius: number;
  humidity_percentage: number;
  wind_speed_kmh: number;
  data_source: string;
  quality_score: number;
}

const MicroinsuranceEnhanced: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [insuranceProducts, setInsuranceProducts] = useState<InsuranceProduct[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'policies' | 'claims' | 'weather'>('products');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const [policyForm, setPolicyForm] = useState({
    asset_type: 'crop' as 'crop' | 'livestock' | 'equipment' | 'farm_infrastructure',
    asset_description: '',
    asset_value: '',
    coverage_percentage: '80',
    farm_location: '',
    latitude: '',
    longitude: ''
  });

  const [claimForm, setClaimForm] = useState({
    loss_description: '',
    loss_date: new Date().toISOString().split('T')[0],
    claimed_amount: '',
    evidence_description: ''
  });

  useEffect(() => {
    loadInsuranceData();
  }, []);

  const loadInsuranceData = async () => {
    try {
      setLoading(true);
      
      const policiesData = await offlineStorageService.getOfflineDataByType('insurance').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSamplePolicies()
      );
      setPolicies(policiesData);

      const productsData = getSampleInsuranceProducts();
      setInsuranceProducts(productsData);

      const claimsData = await offlineStorageService.getOfflineDataByType('claims').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleClaims()
      );
      setClaims(claimsData);

      const weatherDataSample = getSampleWeatherData();
      setWeatherData(weatherDataSample);

    } catch (error) {
      console.error('Error loading insurance data:', error);
      setPolicies(getSamplePolicies());
      setInsuranceProducts(getSampleInsuranceProducts());
      setClaims(getSampleClaims());
      setWeatherData(getSampleWeatherData());
    } finally {
      setLoading(false);
    }
  };

  const getSamplePolicies = (): InsurancePolicy[] => [
    {
      id: 'policy_001',
      policy_number: 'WI-2024-001',
      farmer_id: 'farmer_001',
      policy_type: 'weather_index',
      coverage_type: 'parametric',
      insured_asset: {
        type: 'crop',
        description: '5 acres of maize crop',
        location: {
          latitude: -1.2921,
          longitude: 36.8219,
          address: 'Kiambu County, Kenya'
        },
        value: 5000
      },
      coverage_details: {
        sum_insured: 4000,
        premium_amount: 200,
        deductible: 0,
        coverage_percentage: 80,
        policy_period_start: '2024-03-01',
        policy_period_end: '2024-08-31'
      },
      weather_parameters: {
        rainfall_threshold_mm: 50,
        temperature_threshold_celsius: 35,
        drought_days_threshold: 21,
        flood_threshold_mm: 100,
        wind_speed_threshold_kmh: 60
      },
      triggers: [
        {
          id: 'trigger_001',
          trigger_type: 'weather_event',
          parameter: 'rainfall_deficit',
          threshold_value: 50,
          actual_value: 30,
          measurement_date: '2024-04-15',
          data_source: 'Kenya Meteorological Department',
          verification_status: 'verified',
          payout_percentage: 60,
          triggered: true,
          triggered_date: '2024-04-16'
        }
      ],
      claims: [],
      premium_payments: [
        {
          id: 'payment_001',
          policy_id: 'policy_001',
          payment_date: '2024-03-01',
          amount: 200,
          payment_method: 'mobile_money',
          payment_status: 'completed',
          transaction_reference: 'MPESA123456',
          due_date: '2024-03-01'
        }
      ],
      status: 'active',
      insurance_provider: 'Kenya Agricultural Insurance',
      documents: [
        {
          id: 'doc_001',
          document_type: 'policy_certificate',
          file_path: 'policy_001_certificate.pdf',
          upload_date: '2024-03-01',
          verified: true
        }
      ],
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-04-16T14:30:00Z'
    }
  ];

  const getSampleInsuranceProducts = (): InsuranceProduct[] => [
    {
      id: 'product_001',
      name: 'Weather Index Crop Insurance',
      description: 'Parametric insurance based on weather data for crop protection',
      policy_type: 'weather_index',
      coverage_type: 'parametric',
      target_crops: ['maize', 'wheat', 'rice', 'beans', 'sorghum'],
      target_livestock: [],
      premium_rate_percentage: 4,
      minimum_coverage: 1000,
      maximum_coverage: 50000,
      deductible_percentage: 0,
      policy_duration_months: 6,
      eligibility_criteria: [
        'Minimum 1 acre of insured crop',
        'Farm located within 20km of weather station',
        'No history of insurance fraud'
      ],
      exclusions: [
        'War and civil unrest',
        'Nuclear risks',
        'Intentional damage'
      ],
      provider: 'Kenya Agricultural Insurance',
      available_regions: ['Central Kenya', 'Eastern Kenya', 'Western Kenya'],
      weather_stations_required: true,
      satellite_data_source: 'Sentinel-2'
    },
    {
      id: 'product_002',
      name: 'Livestock Mortality Insurance',
      description: 'Coverage for livestock death due to disease or accident',
      policy_type: 'livestock_mortality',
      coverage_type: 'indemnity',
      target_crops: [],
      target_livestock: ['cattle', 'goats', 'sheep', 'pigs', 'poultry'],
      premium_rate_percentage: 6,
      minimum_coverage: 500,
      maximum_coverage: 100000,
      deductible_percentage: 10,
      policy_duration_months: 12,
      eligibility_criteria: [
        'Veterinary health certificate required',
        'Minimum 5 animals for coverage',
        'Regular vaccination records'
      ],
      exclusions: [
        'Pre-existing conditions',
        'Epidemic diseases without vaccination',
        'Theft or rustling'
      ],
      provider: 'East Africa Livestock Insurance',
      available_regions: ['All regions'],
      weather_stations_required: false,
      satellite_data_source: 'N/A'
    },
    {
      id: 'product_003',
      name: 'Multi-Peril Crop Insurance',
      description: 'Comprehensive coverage for multiple risks affecting crops',
      policy_type: 'multi_peril',
      coverage_type: 'hybrid',
      target_crops: ['coffee', 'tea', 'sugarcane', 'cotton', 'tobacco'],
      target_livestock: [],
      premium_rate_percentage: 8,
      minimum_coverage: 5000,
      maximum_coverage: 200000,
      deductible_percentage: 15,
      policy_duration_months: 12,
      eligibility_criteria: [
        'Commercial farming operation',
        'Minimum 10 acres under cultivation',
        'Good agricultural practices certification'
      ],
      exclusions: [
        'Market price fluctuations',
        'Poor farming practices',
        'Failure to follow recommendations'
      ],
      provider: 'Agricultural Risk Management',
      available_regions: ['Central Kenya', 'Western Kenya'],
      weather_stations_required: true,
      satellite_data_source: 'Planet Labs'
    }
  ];

  const getSampleClaims = (): InsuranceClaim[] => [
    {
      id: 'claim_001',
      policy_id: 'policy_001',
      claim_number: 'CLM-2024-001',
      claim_date: '2024-04-16',
      claim_type: 'automatic_trigger',
      claimed_amount: 2400,
      loss_description: 'Drought conditions triggered automatic payout',
      loss_date: '2024-04-15',
      evidence: [
        {
          id: 'evidence_001',
          evidence_type: 'weather_data',
          file_path: 'weather_report_april_2024.pdf',
          description: 'Official weather data showing rainfall deficit',
          capture_date: '2024-04-15',
          verification_status: 'verified'
        }
      ],
      assessment: {
        assessor_id: 'assessor_001',
        assessment_date: '2024-04-16',
        loss_percentage: 60,
        recommended_payout: 2400,
        assessment_notes: 'Weather trigger conditions met, automatic payout approved',
        field_visit_required: false,
        final_assessment: true
      },
      status: 'approved',
      payout_amount: 2400,
      payout_date: '2024-04-18',
      created_at: '2024-04-16T09:00:00Z',
      updated_at: '2024-04-18T15:30:00Z'
    }
  ];

  const getSampleWeatherData = (): WeatherData[] => [
    {
      date: '2024-04-15',
      location: {
        latitude: -1.2921,
        longitude: 36.8219
      },
      rainfall_mm: 2.5,
      temperature_max_celsius: 28,
      temperature_min_celsius: 18,
      humidity_percentage: 65,
      wind_speed_kmh: 15,
      data_source: 'Kenya Meteorological Department',
      quality_score: 0.95
    },
    {
      date: '2024-04-14',
      location: {
        latitude: -1.2921,
        longitude: 36.8219
      },
      rainfall_mm: 0,
      temperature_max_celsius: 32,
      temperature_min_celsius: 20,
      humidity_percentage: 45,
      wind_speed_kmh: 12,
      data_source: 'Kenya Meteorological Department',
      quality_score: 0.92
    }
  ];

  const saveInsuranceData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'insurance_policies',
        type: 'insurance' as any,
        data: policies
      });
      await offlineStorageService.storeOfflineData({
        id: 'insurance_claims',
        type: 'claims' as any,
        data: claims
      });
    } catch (error) {
      console.error('Error saving insurance data:', error);
    }
  };

  const purchasePolicy = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select an insurance product first');
      return;
    }

    if (!policyForm.asset_description || !policyForm.asset_value) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const assetValue = parseFloat(policyForm.asset_value);
    const coveragePercentage = parseFloat(policyForm.coverage_percentage) / 100;
    const sumInsured = assetValue * coveragePercentage;
    const premiumAmount = sumInsured * (selectedProduct.premium_rate_percentage / 100);

    const newPolicy: InsurancePolicy = {
      id: `policy_${Date.now()}`,
      policy_number: `${selectedProduct.policy_type.toUpperCase()}-${new Date().getFullYear()}-${String(policies.length + 1).padStart(3, '0')}`,
      farmer_id: 'current_user',
      policy_type: selectedProduct.policy_type,
      coverage_type: selectedProduct.coverage_type,
      insured_asset: {
        type: policyForm.asset_type,
        description: policyForm.asset_description,
        location: {
          latitude: parseFloat(policyForm.latitude) || 0,
          longitude: parseFloat(policyForm.longitude) || 0,
          address: policyForm.farm_location
        },
        value: assetValue
      },
      coverage_details: {
        sum_insured: sumInsured,
        premium_amount: premiumAmount,
        deductible: sumInsured * (selectedProduct.deductible_percentage / 100),
        coverage_percentage: coveragePercentage * 100,
        policy_period_start: new Date().toISOString().split('T')[0],
        policy_period_end: new Date(Date.now() + selectedProduct.policy_duration_months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      triggers: [],
      claims: [],
      premium_payments: [],
      status: 'pending_approval',
      insurance_provider: selectedProduct.provider,
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPolicies([...policies, newPolicy]);
    await saveInsuranceData();

    setPolicyForm({
      asset_type: 'crop',
      asset_description: '',
      asset_value: '',
      coverage_percentage: '80',
      farm_location: '',
      latitude: '',
      longitude: ''
    });

    setShowPolicyModal(false);
    setSelectedProduct(null);
    Alert.alert('Success', `Insurance policy application submitted! Policy Number: ${newPolicy.policy_number}\nPremium: $${premiumAmount.toFixed(2)}`);
  };

  const submitClaim = async () => {
    if (!selectedPolicy) {
      Alert.alert('Error', 'Please select a policy first');
      return;
    }

    if (!claimForm.loss_description || !claimForm.claimed_amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newClaim: InsuranceClaim = {
      id: `claim_${Date.now()}`,
      policy_id: selectedPolicy.id,
      claim_number: `CLM-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`,
      claim_date: new Date().toISOString().split('T')[0],
      claim_type: 'manual_submission',
      claimed_amount: parseFloat(claimForm.claimed_amount),
      loss_description: claimForm.loss_description,
      loss_date: claimForm.loss_date,
      evidence: [
        {
          id: `evidence_${Date.now()}`,
          evidence_type: 'photo',
          file_path: 'claim_photo.jpg',
          description: claimForm.evidence_description,
          capture_date: new Date().toISOString().split('T')[0],
          verification_status: 'pending'
        }
      ],
      assessment: {
        assessor_id: '',
        assessment_date: '',
        loss_percentage: 0,
        recommended_payout: 0,
        assessment_notes: '',
        field_visit_required: true,
        final_assessment: false
      },
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClaims([...claims, newClaim]);
    await saveInsuranceData();

    setClaimForm({
      loss_description: '',
      loss_date: new Date().toISOString().split('T')[0],
      claimed_amount: '',
      evidence_description: ''
    });

    setShowClaimModal(false);
    setSelectedPolicy(null);
    Alert.alert('Success', `Claim submitted successfully! Claim Number: ${newClaim.claim_number}`);
  };

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Insurance Products</Text>
      {insuranceProducts.map(product => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productProvider}>{product.provider}</Text>
          </View>
          <Text style={styles.productDescription}>{product.description}</Text>
          
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coverage Type:</Text>
              <Text style={styles.detailValue}>{product.coverage_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Premium Rate:</Text>
              <Text style={styles.detailValue}>{product.premium_rate_percentage}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coverage Range:</Text>
              <Text style={styles.detailValue}>${product.minimum_coverage} - ${product.maximum_coverage}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{product.policy_duration_months} months</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deductible:</Text>
              <Text style={styles.detailValue}>{product.deductible_percentage}%</Text>
            </View>
          </View>

          {product.target_crops.length > 0 && (
            <View style={styles.targetSection}>
              <Text style={styles.targetTitle}>Target Crops:</Text>
              <Text style={styles.targetList}>{product.target_crops.join(', ')}</Text>
            </View>
          )}

          {product.target_livestock.length > 0 && (
            <View style={styles.targetSection}>
              <Text style={styles.targetTitle}>Target Livestock:</Text>
              <Text style={styles.targetList}>{product.target_livestock.join(', ')}</Text>
            </View>
          )}

          <View style={styles.eligibilitySection}>
            <Text style={styles.eligibilityTitle}>Eligibility Criteria:</Text>
            {product.eligibility_criteria.map((criteria, index) => (
              <Text key={index} style={styles.eligibilityItem}>• {criteria}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => {
              setSelectedProduct(product);
              setShowPolicyModal(true);
            }}
          >
            <Text style={styles.purchaseButtonText}>Get Quote</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderPolicies = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My Insurance Policies</Text>
      {policies.map(policy => (
        <View key={policy.id} style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyNumber}>{policy.policy_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(policy.status) }]}>
              <Text style={styles.statusText}>{policy.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.policyType}>{policy.policy_type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.assetDescription}>{policy.insured_asset.description}</Text>
          
          <View style={styles.coverageDetails}>
            <View style={styles.coverageRow}>
              <Text style={styles.coverageLabel}>Sum Insured:</Text>
              <Text style={styles.coverageValue}>${policy.coverage_details.sum_insured}</Text>
            </View>
            <View style={styles.coverageRow}>
              <Text style={styles.coverageLabel}>Premium:</Text>
              <Text style={styles.coverageValue}>${policy.coverage_details.premium_amount}</Text>
            </View>
            <View style={styles.coverageRow}>
              <Text style={styles.coverageLabel}>Period:</Text>
              <Text style={styles.coverageValue}>
                {policy.coverage_details.policy_period_start} to {policy.coverage_details.policy_period_end}
              </Text>
            </View>
          </View>

          {policy.triggers.length > 0 && (
            <View style={styles.triggersSection}>
              <Text style={styles.triggersTitle}>Active Triggers:</Text>
              {policy.triggers.map(trigger => (
                <View key={trigger.id} style={styles.triggerItem}>
                  <Text style={styles.triggerParameter}>{trigger.parameter}</Text>
                  <Text style={[
                    styles.triggerStatus,
                    { color: trigger.triggered ? '#EF4444' : '#10B981' }
                  ]}>
                    {trigger.triggered ? 'TRIGGERED' : 'MONITORING'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.policyActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedPolicy(policy);
                setShowClaimModal(true);
              }}
            >
              <Text style={styles.actionButtonText}>File Claim</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderClaims = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Insurance Claims</Text>
      {claims.map(claim => (
        <View key={claim.id} style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <Text style={styles.claimNumber}>{claim.claim_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getClaimStatusColor(claim.status) }]}>
              <Text style={styles.statusText}>{claim.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.claimAmount}>${claim.claimed_amount}</Text>
          <Text style={styles.claimDescription}>{claim.loss_description}</Text>
          <Text style={styles.claimDate}>Loss Date: {claim.loss_date}</Text>
          <Text style={styles.claimDate}>Claim Date: {claim.claim_date}</Text>

          {claim.payout_amount && (
            <View style={styles.payoutSection}>
              <Text style={styles.payoutTitle}>Payout Details:</Text>
              <Text style={styles.payoutAmount}>Amount: ${claim.payout_amount}</Text>
              {claim.payout_date && (
                <Text style={styles.payoutDate}>Date: {claim.payout_date}</Text>
              )}
            </View>
          )}

          {claim.assessment.final_assessment && (
            <View style={styles.assessmentSection}>
              <Text style={styles.assessmentTitle}>Assessment:</Text>
              <Text style={styles.assessmentLoss}>Loss: {claim.assessment.loss_percentage}%</Text>
              <Text style={styles.assessmentNotes}>{claim.assessment.assessment_notes}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderWeather = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Weather Monitoring</Text>
      <Text style={styles.weatherDescription}>
        Real-time weather data for parametric insurance triggers
      </Text>
      
      {weatherData.map((data, index) => (
        <View key={index} style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherDate}>{data.date}</Text>
            <Text style={styles.weatherSource}>{data.data_source}</Text>
          </View>
          
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Rainfall</Text>
              <Text style={styles.weatherValue}>{data.rainfall_mm}mm</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Max Temp</Text>
              <Text style={styles.weatherValue}>{data.temperature_max_celsius}°C</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Min Temp</Text>
              <Text style={styles.weatherValue}>{data.temperature_min_celsius}°C</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Humidity</Text>
              <Text style={styles.weatherValue}>{data.humidity_percentage}%</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Wind Speed</Text>
              <Text style={styles.weatherValue}>{data.wind_speed_kmh}km/h</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Quality</Text>
              <Text style={styles.weatherValue}>{Math.round(data.quality_score * 100)}%</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'expired': return '#6B7280';
      case 'cancelled': return '#EF4444';
      case 'suspended': return '#F59E0B';
      case 'pending_approval': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'paid': return '#059669';
      case 'rejected': return '#EF4444';
      case 'disputed': return '#F59E0B';
      case 'under_review': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Microinsurance</Text>
        <Text style={styles.subtitle}>Protect your farm with smart insurance</Text>
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
          style={[styles.tab, activeTab === 'policies' && styles.activeTab]}
          onPress={() => setActiveTab('policies')}
        >
          <Text style={[styles.tabText, activeTab === 'policies' && styles.activeTabText]}>
            My Policies ({policies.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claims' && styles.activeTab]}
          onPress={() => setActiveTab('claims')}
        >
          <Text style={[styles.tabText, activeTab === 'claims' && styles.activeTabText]}>
            Claims ({claims.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weather' && styles.activeTab]}
          onPress={() => setActiveTab('weather')}
        >
          <Text style={[styles.tabText, activeTab === 'weather' && styles.activeTabText]}>
            Weather
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'policies' && renderPolicies()}
      {activeTab === 'claims' && renderClaims()}
      {activeTab === 'weather' && renderWeather()}

      {/* Policy Purchase Modal */}
      <Modal visible={showPolicyModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Purchase Insurance</Text>
            <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedProduct && (
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                <Text style={styles.selectedProductRate}>Premium Rate: {selectedProduct.premium_rate_percentage}%</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Asset Type *</Text>
              <Picker
                selectedValue={policyForm.asset_type}
                onValueChange={(value) => setPolicyForm({...policyForm, asset_type: value})}
                style={styles.picker}
              >
                <Picker.Item label="Crop" value="crop" />
                <Picker.Item label="Livestock" value="livestock" />
                <Picker.Item label="Equipment" value="equipment" />
                <Picker.Item label="Farm Infrastructure" value="farm_infrastructure" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Asset Description *</Text>
              <TextInput
                style={styles.formInput}
                value={policyForm.asset_description}
                onChangeText={(text) => setPolicyForm({...policyForm, asset_description: text})}
                placeholder="Describe what you want to insure"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Asset Value ($) *</Text>
              <TextInput
                style={styles.formInput}
                value={policyForm.asset_value}
                onChangeText={(text) => setPolicyForm({...policyForm, asset_value: text})}
                placeholder="Enter asset value"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Coverage Percentage</Text>
              <Picker
                selectedValue={policyForm.coverage_percentage}
                onValueChange={(value) => setPolicyForm({...policyForm, coverage_percentage: value})}
                style={styles.picker}
              >
                <Picker.Item label="60%" value="60" />
                <Picker.Item label="70%" value="70" />
                <Picker.Item label="80%" value="80" />
                <Picker.Item label="90%" value="90" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Farm Location</Text>
              <TextInput
                style={styles.formInput}
                value={policyForm.farm_location}
                onChangeText={(text) => setPolicyForm({...policyForm, farm_location: text})}
                placeholder="Enter farm address"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Latitude</Text>
                <TextInput
                  style={styles.formInput}
                  value={policyForm.latitude}
                  onChangeText={(text) => setPolicyForm({...policyForm, latitude: text})}
                  placeholder="0.0000"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Longitude</Text>
                <TextInput
                  style={styles.formInput}
                  value={policyForm.longitude}
                  onChangeText={(text) => setPolicyForm({...policyForm, longitude: text})}
                  placeholder="0.0000"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {policyForm.asset_value && policyForm.coverage_percentage && (
              <View style={styles.quoteSection}>
                <Text style={styles.quoteTitle}>Insurance Quote</Text>
                <Text style={styles.quoteItem}>
                  Asset Value: ${parseFloat(policyForm.asset_value || '0').toFixed(2)}
                </Text>
                <Text style={styles.quoteItem}>
                  Coverage: {policyForm.coverage_percentage}% (${(parseFloat(policyForm.asset_value || '0') * parseFloat(policyForm.coverage_percentage) / 100).toFixed(2)})
                </Text>
                {selectedProduct && (
                  <Text style={styles.quotePremium}>
                    Premium: ${((parseFloat(policyForm.asset_value || '0') * parseFloat(policyForm.coverage_percentage) / 100) * selectedProduct.premium_rate_percentage / 100).toFixed(2)}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={purchasePolicy}>
              <Text style={styles.submitButtonText}>Purchase Policy</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Claim Submission Modal */}
      <Modal visible={showClaimModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Claim</Text>
            <TouchableOpacity onPress={() => setShowClaimModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedPolicy && (
              <View style={styles.selectedPolicyInfo}>
                <Text style={styles.selectedPolicyNumber}>{selectedPolicy.policy_number}</Text>
                <Text style={styles.selectedPolicyAsset}>{selectedPolicy.insured_asset.description}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loss Description *</Text>
              <TextInput
                style={styles.formInput}
                value={claimForm.loss_description}
                onChangeText={(text) => setClaimForm({...claimForm, loss_description: text})}
                placeholder="Describe the loss or damage"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loss Date *</Text>
              <TextInput
                style={styles.formInput}
                value={claimForm.loss_date}
                onChangeText={(text) => setClaimForm({...claimForm, loss_date: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Claimed Amount ($) *</Text>
              <TextInput
                style={styles.formInput}
                value={claimForm.claimed_amount}
                onChangeText={(text) => setClaimForm({...claimForm, claimed_amount: text})}
                placeholder="Enter claim amount"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Evidence Description</Text>
              <TextInput
                style={styles.formInput}
                value={claimForm.evidence_description}
                onChangeText={(text) => setClaimForm({...claimForm, evidence_description: text})}
                placeholder="Describe the evidence you will provide"
                multiline
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitClaim}>
              <Text style={styles.submitButtonText}>Submit Claim</Text>
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
    fontSize: 12,
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
  productProvider: {
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
  targetSection: {
    marginBottom: 12,
  },
  targetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  targetList: {
    fontSize: 14,
    color: '#374151',
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
  purchaseButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  policyCard: {
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
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyNumber: {
    fontSize: 18,
    fontWeight: '600',
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
  policyType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  assetDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  coverageDetails: {
    marginBottom: 12,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  coverageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  coverageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  triggersSection: {
    marginBottom: 12,
  },
  triggersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  triggerParameter: {
    fontSize: 14,
    color: '#374151',
  },
  triggerStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  policyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimCard: {
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
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  claimAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 8,
  },
  claimDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  claimDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  payoutSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 14,
    color: '#166534',
  },
  assessmentSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  assessmentLoss: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  assessmentNotes: {
    fontSize: 14,
    color: '#92400E',
  },
  weatherDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  weatherCard: {
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
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weatherSource: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
  selectedProductRate: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedPolicyInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  selectedPolicyNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedPolicyAsset: {
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formHalf: {
    width: '48%',
  },
  quoteSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  quoteItem: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  quotePremium: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 8,
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

export default MicroinsuranceEnhanced;
