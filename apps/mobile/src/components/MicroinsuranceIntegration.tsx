import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';
import { weatherService } from '../services/WeatherService';

interface InsurancePolicy {
  id: string;
  farmerId: string;
  type: 'weather_index' | 'crop_yield' | 'livestock_mortality' | 'equipment';
  coverage: {
    amount: number;
    currency: string;
    deductible: number;
  };
  premium: {
    amount: number;
    frequency: 'monthly' | 'seasonal' | 'annual';
    nextDue: Date;
  };
  parameters: {
    cropType?: string;
    area?: number;
    weatherStation?: string;
    triggerConditions?: TriggerCondition[];
  };
  status: 'active' | 'pending' | 'expired' | 'claimed';
  startDate: Date;
  endDate: Date;
  provider: string;
}

interface TriggerCondition {
  parameter: 'rainfall' | 'temperature' | 'drought_index' | 'wind_speed';
  threshold: number;
  operator: 'less_than' | 'greater_than' | 'between';
  period: string;
}

interface InsuranceClaim {
  id: string;
  policyId: string;
  farmerId: string;
  type: 'parametric' | 'indemnity';
  amount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  submissionDate: Date;
  evidence: ClaimEvidence[];
  assessmentNotes?: string;
  payoutDate?: Date;
}

interface ClaimEvidence {
  type: 'photo' | 'weather_data' | 'field_report' | 'satellite_imagery';
  url: string;
  description: string;
  timestamp: Date;
  gpsLocation?: { latitude: number; longitude: number };
}

interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  products: InsuranceProduct[];
  rating: number;
  processingTime: string;
  payoutHistory: number;
}

interface InsuranceProduct {
  id: string;
  name: string;
  type: 'weather_index' | 'crop_yield' | 'livestock_mortality' | 'equipment';
  description: string;
  coverage: { min: number; max: number };
  premium: { rate: number; basis: string };
  features: string[];
  eligibility: string[];
}

export default function MicroinsuranceIntegration({ farmerId }: { farmerId: string }) {
  const [view, setView] = useState<'policies' | 'products' | 'claims' | 'application'>('policies');
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [providers] = useState<InsuranceProvider[]>([
    {
      id: 'agri_protect',
      name: 'AgriProtect Insurance',
      logo: '🛡️',
      rating: 4.5,
      processingTime: '3-5 days',
      payoutHistory: 95,
      products: [
        {
          id: 'weather_basic',
          name: 'Weather Index Insurance',
          type: 'weather_index',
          description: 'Protection against drought, excess rainfall, and extreme temperatures',
          coverage: { min: 500, max: 10000 },
          premium: { rate: 8, basis: 'per $100 coverage' },
          features: ['Automatic payouts', 'Satellite monitoring', 'No field visits required'],
          eligibility: ['Valid farm registration', 'Minimum 1 hectare', 'Historical weather data available']
        },
        {
          id: 'crop_yield',
          name: 'Crop Yield Protection',
          type: 'crop_yield',
          description: 'Coverage for yield losses due to weather, pests, or diseases',
          coverage: { min: 1000, max: 25000 },
          premium: { rate: 12, basis: 'per $100 coverage' },
          features: ['Yield guarantee', 'Multiple peril coverage', 'Expert assessment'],
          eligibility: ['3+ years farming experience', 'Yield records available', 'Good farming practices']
        }
      ]
    },
    {
      id: 'rural_shield',
      name: 'Rural Shield Cooperative',
      logo: '🌾',
      rating: 4.2,
      processingTime: '1-3 days',
      payoutHistory: 88,
      products: [
        {
          id: 'livestock_basic',
          name: 'Livestock Mortality Insurance',
          type: 'livestock_mortality',
          description: 'Protection against livestock death due to disease or accidents',
          coverage: { min: 200, max: 5000 },
          premium: { rate: 6, basis: 'per animal per year' },
          features: ['Quick claims processing', 'Veterinary support', 'Group discounts'],
          eligibility: ['Vaccination records', 'Veterinary inspection', 'Proper housing']
        }
      ]
    }
  ]);
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    coverage: '',
    cropType: '',
    area: '',
    duration: '12'
  });
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policyId: '',
    description: '',
    estimatedLoss: '',
    evidence: [] as string[]
  });

  useEffect(() => {
    loadInsuranceData();
  }, [farmerId]);

  const loadInsuranceData = async () => {
    try {
      const insuranceData = await offlineStorageService.getOfflineDataByType('insurance_policy');
      const farmerPolicies = insuranceData.filter(data => data.data.farmerId === farmerId);
      setPolicies(farmerPolicies.map(data => data.data));

      const claimsData = await offlineStorageService.getOfflineDataByType('financial');
      const farmerClaims = claimsData.filter(data => 
        data.data.farmerId === farmerId && data.data.type === 'insurance_claim'
      );
      setClaims(farmerClaims.map(data => data.data));
    } catch (error) {
      console.error('Failed to load insurance data:', error);
    }
  };

  const submitApplication = async () => {
    if (!selectedProduct || !applicationForm.coverage || !applicationForm.area) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const coverage = parseFloat(applicationForm.coverage);
    const area = parseFloat(applicationForm.area);
    const duration = parseInt(applicationForm.duration);

    const premiumAmount = (coverage / 100) * selectedProduct.premium.rate;
    
    const policy: InsurancePolicy = {
      id: `policy_${Date.now()}`,
      farmerId,
      type: selectedProduct.type,
      coverage: {
        amount: coverage,
        currency: 'USD',
        deductible: coverage * 0.1
      },
      premium: {
        amount: premiumAmount,
        frequency: 'annual',
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      parameters: {
        cropType: applicationForm.cropType,
        area,
        weatherStation: 'local_station_001',
        triggerConditions: generateTriggerConditions(selectedProduct.type)
      },
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
      provider: providers.find(p => p.products.includes(selectedProduct))?.id || 'unknown'
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: policy.id,
        type: 'insurance_policy',
        data: policy
      });

      setPolicies([...policies, policy]);
      setSelectedProduct(null);
      setApplicationForm({ coverage: '', cropType: '', area: '', duration: '12' });
      setView('policies');
      Alert.alert('Success', 'Insurance application submitted successfully');
    } catch (error) {
      console.error('Failed to submit application:', error);
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  const submitClaim = async () => {
    if (!claimForm.policyId || !claimForm.description || !claimForm.estimatedLoss) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const policy = policies.find(p => p.id === claimForm.policyId);
    if (!policy) {
      Alert.alert('Error', 'Policy not found');
      return;
    }

    const claim: InsuranceClaim = {
      id: `claim_${Date.now()}`,
      policyId: claimForm.policyId,
      farmerId,
      type: policy.type === 'weather_index' ? 'parametric' : 'indemnity',
      amount: parseFloat(claimForm.estimatedLoss),
      status: 'submitted',
      submissionDate: new Date(),
      evidence: [
        {
          type: 'photo',
          url: 'mock://field-damage-photo.jpg',
          description: claimForm.description,
          timestamp: new Date(),
          gpsLocation: { latitude: -1.2921, longitude: 36.8219 }
        }
      ]
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: claim.id,
        type: 'financial',
        data: { ...claim, type: 'insurance_claim' }
      });

      setClaims([...claims, claim]);
      setClaimForm({ policyId: '', description: '', estimatedLoss: '', evidence: [] });
      setShowClaimForm(false);
      Alert.alert('Success', 'Insurance claim submitted successfully');
    } catch (error) {
      console.error('Failed to submit claim:', error);
      Alert.alert('Error', 'Failed to submit claim');
    }
  };

  const generateTriggerConditions = (type: string): TriggerCondition[] => {
    switch (type) {
      case 'weather_index':
        return [
          {
            parameter: 'rainfall',
            threshold: 50,
            operator: 'less_than',
            period: '30_days'
          },
          {
            parameter: 'temperature',
            threshold: 40,
            operator: 'greater_than',
            period: '7_days'
          }
        ];
      case 'crop_yield':
        return [
          {
            parameter: 'drought_index',
            threshold: 0.3,
            operator: 'less_than',
            period: '60_days'
          }
        ];
      default:
        return [];
    }
  };

  const checkParametricTriggers = async (policy: InsurancePolicy) => {
    try {
      const weatherData = await weatherService.fetchWeatherData(-1.2921, 36.8219);
      
      for (const condition of policy.parameters.triggerConditions || []) {
        let triggered = false;
        
        switch (condition.parameter) {
          case 'rainfall':
            const totalRainfall = weatherData.forecast.reduce((sum, day) => sum + day.rainfall, 0);
            triggered = condition.operator === 'less_than' && totalRainfall < condition.threshold;
            break;
          case 'temperature':
            const maxTemp = Math.max(...weatherData.forecast.map(day => day.high));
            triggered = condition.operator === 'greater_than' && maxTemp > condition.threshold;
            break;
        }
        
        if (triggered) {
          Alert.alert(
            'Parametric Trigger Activated',
            `Your ${policy.type} policy has been triggered. An automatic payout will be processed.`,
            [
              { text: 'OK', onPress: () => processAutomaticPayout(policy) }
            ]
          );
          break;
        }
      }
    } catch (error) {
      console.error('Failed to check parametric triggers:', error);
    }
  };

  const processAutomaticPayout = async (policy: InsurancePolicy) => {
    const automaticClaim: InsuranceClaim = {
      id: `auto_claim_${Date.now()}`,
      policyId: policy.id,
      farmerId,
      type: 'parametric',
      amount: policy.coverage.amount * 0.8,
      status: 'approved',
      submissionDate: new Date(),
      evidence: [
        {
          type: 'weather_data',
          url: 'mock://weather-station-data.json',
          description: 'Automated weather station data confirming trigger conditions',
          timestamp: new Date()
        }
      ],
      assessmentNotes: 'Automatic payout triggered by parametric conditions',
      payoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: automaticClaim.id,
        type: 'financial',
        data: { ...automaticClaim, type: 'insurance_claim' }
      });

      setClaims([...claims, automaticClaim]);
    } catch (error) {
      console.error('Failed to process automatic payout:', error);
    }
  };

  const renderPolicies = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Insurance Policies</Text>
      
      {policies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No insurance policies yet</Text>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setView('products')}
          >
            <Text style={styles.applyButtonText}>Browse Insurance Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {policies.map(policy => (
            <View key={policy.id} style={styles.policyCard}>
              <View style={styles.policyHeader}>
                <Text style={styles.policyType}>{formatPolicyType(policy.type)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(policy.status) }]}>
                  <Text style={styles.statusText}>{policy.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.policyDetails}>
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Coverage:</Text>
                  <Text style={styles.coverageValue}>${policy.coverage.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Premium:</Text>
                  <Text style={styles.coverageValue}>${policy.premium.amount.toFixed(2)} / {policy.premium.frequency}</Text>
                </View>
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Valid Until:</Text>
                  <Text style={styles.coverageValue}>{policy.endDate.toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View style={styles.policyActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => checkParametricTriggers(policy)}
                >
                  <Text style={styles.actionButtonText}>Check Triggers</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setClaimForm({ ...claimForm, policyId: policy.id });
                    setShowClaimForm(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>File Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setView('products')}
          >
            <Text style={styles.addButtonText}>+ Add New Policy</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insurance Products</Text>
      
      {providers.map(provider => (
        <View key={provider.id} style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <Text style={styles.providerLogo}>{provider.logo}</Text>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerRating}>⭐ {provider.rating} • {provider.payoutHistory}% payout rate</Text>
            </View>
          </View>
          
          {provider.products.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              
              <View style={styles.productDetails}>
                <Text style={styles.detailLabel}>Coverage: ${product.coverage.min.toLocaleString()} - ${product.coverage.max.toLocaleString()}</Text>
                <Text style={styles.detailLabel}>Premium: {product.premium.rate}% {product.premium.basis}</Text>
              </View>
              
              <View style={styles.featuresList}>
                {product.features.map((feature, index) => (
                  <Text key={index} style={styles.featureText}>• {feature}</Text>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.selectProductButton}
                onPress={() => {
                  setSelectedProduct(product);
                  setView('application');
                }}
              >
                <Text style={styles.selectProductButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderApplication = () => {
    if (!selectedProduct) return null;

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Insurance Application</Text>
        <Text style={styles.subtitle}>{selectedProduct.name}</Text>
        
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Coverage Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Min: $${selectedProduct.coverage.min}, Max: $${selectedProduct.coverage.max}`}
            value={applicationForm.coverage}
            onChangeText={(text) => setApplicationForm({ ...applicationForm, coverage: text })}
            keyboardType="numeric"
          />

          {selectedProduct.type === 'crop_yield' && (
            <>
              <Text style={styles.formLabel}>Crop Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Maize, Wheat, Rice"
                value={applicationForm.cropType}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, cropType: text })}
              />
            </>
          )}

          <Text style={styles.formLabel}>Farm Area (hectares)</Text>
          <TextInput
            style={styles.input}
            placeholder="Total area to be covered"
            value={applicationForm.area}
            onChangeText={(text) => setApplicationForm({ ...applicationForm, area: text })}
            keyboardType="numeric"
          />

          <Text style={styles.formLabel}>Coverage Duration (months)</Text>
          <View style={styles.durationSelector}>
            {['6', '12', '24'].map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  applicationForm.duration === duration && styles.selectedDuration
                ]}
                onPress={() => setApplicationForm({ ...applicationForm, duration })}
              >
                <Text style={styles.durationText}>{duration} months</Text>
              </TouchableOpacity>
            ))}
          </View>

          {applicationForm.coverage && applicationForm.area && (
            <View style={styles.calculationCard}>
              <Text style={styles.calculationTitle}>Premium Calculation</Text>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Coverage Amount:</Text>
                <Text style={styles.calculationValue}>${applicationForm.coverage}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Annual Premium:</Text>
                <Text style={styles.calculationValue}>
                  ${((parseFloat(applicationForm.coverage) || 0) / 100 * selectedProduct.premium.rate).toFixed(2)}
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

  const renderClaims = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insurance Claims</Text>
      
      {claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No claims submitted yet</Text>
        </View>
      ) : (
        claims.map(claim => (
          <View key={claim.id} style={styles.claimCard}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimAmount}>${claim.amount.toLocaleString()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                <Text style={styles.statusText}>{claim.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.claimDetails}>
              <Text style={styles.claimLabel}>Type: {claim.type}</Text>
              <Text style={styles.claimLabel}>Submitted: {claim.submissionDate.toLocaleDateString()}</Text>
              {claim.payoutDate && (
                <Text style={styles.claimLabel}>Payout: {claim.payoutDate.toLocaleDateString()}</Text>
              )}
            </View>
          </View>
        ))
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowClaimForm(true)}
      >
        <Text style={styles.addButtonText}>+ File New Claim</Text>
      </TouchableOpacity>
      
      {showClaimForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>File Insurance Claim</Text>
            
            <Text style={styles.formLabel}>Select Policy</Text>
            <View style={styles.policySelector}>
              {policies.filter(p => p.status === 'active').map(policy => (
                <TouchableOpacity
                  key={policy.id}
                  style={[
                    styles.policyOption,
                    claimForm.policyId === policy.id && styles.selectedPolicy
                  ]}
                  onPress={() => setClaimForm({ ...claimForm, policyId: policy.id })}
                >
                  <Text style={styles.policyOptionText}>{formatPolicyType(policy.type)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Description of Loss</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Describe what happened and the damage caused"
              value={claimForm.description}
              onChangeText={(text) => setClaimForm({ ...claimForm, description: text })}
              multiline
            />

            <Text style={styles.formLabel}>Estimated Loss Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter estimated financial loss"
              value={claimForm.estimatedLoss}
              onChangeText={(text) => setClaimForm({ ...claimForm, estimatedLoss: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowClaimForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={submitClaim}>
                <Text style={styles.saveButtonText}>Submit Claim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const formatPolicyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'paid': return '#d4edda';
      case 'pending': case 'under_review': case 'submitted': return '#fff3cd';
      case 'expired': case 'rejected': return '#f8d7da';
      default: return '#f8f9fa';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, view === 'policies' && styles.activeTab]}
          onPress={() => setView('policies')}
        >
          <Text style={[styles.tabText, view === 'policies' && styles.activeTabText]}>Policies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'products' && styles.activeTab]}
          onPress={() => setView('products')}
        >
          <Text style={[styles.tabText, view === 'products' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'claims' && styles.activeTab]}
          onPress={() => setView('claims')}
        >
          <Text style={[styles.tabText, view === 'claims' && styles.activeTabText]}>Claims</Text>
        </TouchableOpacity>
      </View>

      {view === 'policies' && renderPolicies()}
      {view === 'products' && renderProducts()}
      {view === 'application' && renderApplication()}
      {view === 'claims' && renderClaims()}
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
  policyCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  policyType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  policyDetails: {
    marginBottom: 15,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  coverageLabel: {
    fontSize: 14,
    color: '#666',
  },
  coverageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  policyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  providerCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  providerLogo: {
    fontSize: 32,
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  providerRating: {
    fontSize: 14,
    color: '#666',
  },
  productCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  productDetails: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  featuresList: {
    marginBottom: 15,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  selectProductButton: {
    backgroundColor: '#228B22',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectProductButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  durationSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  durationButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  durationText: {
    fontSize: 14,
    color: '#333',
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
  claimCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  claimAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
  },
  claimDetails: {
    gap: 5,
  },
  claimLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 20,
  },
  policySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  policyOption: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedPolicy: {
    backgroundColor: '#e8f5e8',
    borderColor: '#228B22',
  },
  policyOptionText: {
    fontSize: 12,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#228B22',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
