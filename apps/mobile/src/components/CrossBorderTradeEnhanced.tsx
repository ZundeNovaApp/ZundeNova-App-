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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface TradeTransaction {
  id: string;
  transaction_number: string;
  product_details: {
    product_name: string;
    hs_code: string;
    quantity: number;
    unit: string;
    value_usd: number;
  };
  trade_route: {
    origin_country: string;
    destination_country: string;
    origin_port: string;
    destination_port: string;
    estimated_transit_days: number;
  };
  customs_info: {
    duty_rate_percentage: number;
    tax_rate_percentage: number;
    estimated_duties: number;
    estimated_taxes: number;
    compliance_requirements: string[];
    customs_forms: Array<{
      form_type: string;
      form_number: string;
      status: string;
    }>;
  };
  logistics: {
    carrier_name: string;
    tracking_number?: string;
    estimated_delivery: string;
  };
  compliance_status: {
    compliance_score: number;
    requirements_met: Array<{
      requirement: string;
      status: 'completed' | 'pending' | 'not_started';
    }>;
  };
  status: 'draft' | 'submitted' | 'in_transit' | 'customs_clearance' | 'delivered' | 'cancelled';
  created_at: string;
}

interface TransactionForm {
  product_name: string;
  hs_code: string;
  quantity: string;
  unit: string;
  value_usd: string;
  origin_country: string;
  destination_country: string;
}

const CrossBorderTradeEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'routes' | 'customs' | 'compliance'>('transactions');
  const [transactions, setTransactions] = useState<TradeTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TradeTransaction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    product_name: '',
    hs_code: '',
    quantity: '',
    unit: 'kg',
    value_usd: '',
    origin_country: '',
    destination_country: '',
  });

  useEffect(() => {
    loadTradeData();
  }, []);

  const loadTradeData = async () => {
    try {
      const offlineData = await offlineStorageService.getOfflineDataByType('cross_border_transactions');
      const transactionsData = offlineData.length > 0 ? offlineData[0].data : getSampleTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading trade data:', error);
      setTransactions(getSampleTransactions());
    }
  };

  const getSampleTransactions = (): TradeTransaction[] => [
    {
      id: '1',
      transaction_number: 'CBT-2024-001',
      product_details: {
        product_name: 'Premium Coffee Beans',
        hs_code: '0901.11.00',
        quantity: 1000,
        unit: 'kg',
        value_usd: 8500,
      },
      trade_route: {
        origin_country: 'Kenya',
        destination_country: 'Germany',
        origin_port: 'Mombasa',
        destination_port: 'Hamburg',
        estimated_transit_days: 28,
      },
      customs_info: {
        duty_rate_percentage: 7.5,
        tax_rate_percentage: 19,
        estimated_duties: 637.50,
        estimated_taxes: 1615,
        compliance_requirements: [
          'Phytosanitary Certificate',
          'Certificate of Origin',
          'Quality Certificate',
          'Export License'
        ],
        customs_forms: [
          { form_type: 'Export Declaration', form_number: 'EXP-2024-001', status: 'completed' },
          { form_type: 'Phytosanitary Certificate', form_number: 'PHY-2024-001', status: 'pending' }
        ]
      },
      logistics: {
        carrier_name: 'Maersk Line',
        tracking_number: 'MAEU123456789',
        estimated_delivery: '2024-02-15',
      },
      compliance_status: {
        compliance_score: 85,
        requirements_met: [
          { requirement: 'Export License', status: 'completed' },
          { requirement: 'Quality Certificate', status: 'completed' },
          { requirement: 'Phytosanitary Certificate', status: 'pending' },
          { requirement: 'Certificate of Origin', status: 'not_started' }
        ]
      },
      status: 'in_transit',
      created_at: '2024-01-15T10:00:00Z',
    }
  ];

  const saveTradeData = async (data: TradeTransaction[]) => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'cross_border_transactions',
        type: 'cross_border_transactions' as any,
        data: data
      });
    } catch (error) {
      console.error('Error saving trade data:', error);
    }
  };

  const createTradeTransaction = async () => {
    if (!transactionForm.product_name || !transactionForm.quantity || !transactionForm.value_usd) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newTransaction: TradeTransaction = {
      id: Date.now().toString(),
      transaction_number: `CBT-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      product_details: {
        product_name: transactionForm.product_name,
        hs_code: transactionForm.hs_code,
        quantity: parseFloat(transactionForm.quantity),
        unit: transactionForm.unit,
        value_usd: parseFloat(transactionForm.value_usd),
      },
      trade_route: {
        origin_country: transactionForm.origin_country,
        destination_country: transactionForm.destination_country,
        origin_port: '',
        destination_port: '',
        estimated_transit_days: 30,
      },
      customs_info: {
        duty_rate_percentage: 7.5,
        tax_rate_percentage: 19,
        estimated_duties: parseFloat(transactionForm.value_usd) * 0.075,
        estimated_taxes: parseFloat(transactionForm.value_usd) * 0.19,
        compliance_requirements: ['Export License', 'Certificate of Origin'],
        customs_forms: []
      },
      logistics: {
        carrier_name: 'TBD',
        estimated_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      compliance_status: {
        compliance_score: 0,
        requirements_met: []
      },
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    await saveTradeData(updatedTransactions);
    
    setShowCreateModal(false);
    setTransactionForm({
      product_name: '',
      hs_code: '',
      quantity: '',
      unit: 'kg',
      value_usd: '',
      origin_country: '',
      destination_country: '',
    });
    
    Alert.alert('Success', 'Trade transaction created successfully');
  };

  const renderTransactions = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Cross-Border Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ New Transaction</Text>
        </TouchableOpacity>
      </View>

      {transactions.map(transaction => (
        <View key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionNumber}>{transaction.transaction_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
              <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{transaction.product_details.product_name}</Text>
          <Text style={styles.tradeRoute}>
            {transaction.trade_route.origin_country} → {transaction.trade_route.destination_country}
          </Text>
          <Text style={styles.transactionValue}>
            ${transaction.product_details.value_usd.toLocaleString()}
          </Text>

          <View style={styles.complianceInfo}>
            <Text style={styles.complianceTitle}>Compliance Score:</Text>
            <View style={[
              styles.complianceScore,
              { backgroundColor: getComplianceColor(transaction.compliance_status.compliance_score) }
            ]}>
              <Text style={styles.complianceScoreText}>
                {transaction.compliance_status.compliance_score}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              setSelectedTransaction(transaction);
              setActiveTab('customs');
            }}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderRoutes = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Trade Routes & Logistics</Text>
      
      {transactions.map(transaction => (
        <View key={transaction.id} style={styles.routeCard}>
          <Text style={styles.routeTitle}>{transaction.transaction_number}</Text>
          <Text style={styles.routeProduct}>{transaction.product_details.product_name}</Text>
          
          <View style={styles.routeDetails}>
            <View style={styles.routeDetailRow}>
              <Text style={styles.routeLabel}>Origin Port:</Text>
              <Text style={styles.routeValue}>{transaction.trade_route.origin_port || 'TBD'}</Text>
            </View>
            <View style={styles.routeDetailRow}>
              <Text style={styles.routeLabel}>Destination Port:</Text>
              <Text style={styles.routeValue}>{transaction.trade_route.destination_port || 'TBD'}</Text>
            </View>
            <View style={styles.routeDetailRow}>
              <Text style={styles.routeLabel}>Transit Time:</Text>
              <Text style={styles.routeValue}>{transaction.trade_route.estimated_transit_days} days</Text>
            </View>
            <View style={styles.routeDetailRow}>
              <Text style={styles.routeLabel}>Carrier:</Text>
              <Text style={styles.routeValue}>{transaction.logistics.carrier_name}</Text>
            </View>
            {transaction.logistics.tracking_number && (
              <View style={styles.routeDetailRow}>
                <Text style={styles.routeLabel}>Tracking:</Text>
                <Text style={styles.routeValue}>{transaction.logistics.tracking_number}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCustoms = () => {
    if (!selectedTransaction) {
      return (
        <View style={styles.noSelectionContainer}>
          <Text style={styles.noSelectionText}>Select a transaction to view customs information</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Customs & Documentation</Text>
        <Text style={styles.selectedTransaction}>{selectedTransaction.transaction_number}</Text>
        
        <View style={styles.customsCard}>
          <Text style={styles.customsTitle}>Estimated Costs</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Duties ({selectedTransaction.customs_info.duty_rate_percentage}%):</Text>
            <Text style={styles.costValue}>
              ${selectedTransaction.customs_info.estimated_duties.toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Taxes ({selectedTransaction.customs_info.tax_rate_percentage}%):</Text>
            <Text style={styles.costValue}>
              ${selectedTransaction.customs_info.estimated_taxes.toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabelTotal}>Total Additional Costs:</Text>
            <Text style={styles.costValueTotal}>
              ${(selectedTransaction.customs_info.estimated_duties + selectedTransaction.customs_info.estimated_taxes).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.customsCard}>
          <Text style={styles.customsTitle}>Required Documents</Text>
          {selectedTransaction.customs_info.compliance_requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementRow}>
              <Text style={styles.requirementText}>• {requirement}</Text>
            </View>
          ))}
        </View>

        <View style={styles.customsCard}>
          <Text style={styles.customsTitle}>Customs Forms</Text>
          {selectedTransaction.customs_info.customs_forms.length > 0 ? (
            selectedTransaction.customs_info.customs_forms.map(form => (
              <View key={form.form_number} style={styles.formRow}>
                <Text style={styles.formType}>{form.form_type}</Text>
                <Text style={styles.formNumber}>{form.form_number}</Text>
                <View style={[styles.formStatus, { backgroundColor: getStatusColor(form.status) }]}>
                  <Text style={styles.formStatusText}>{form.status.toUpperCase()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noFormsText}>No customs forms submitted yet</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderCompliance = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Compliance Status</Text>
      
      {transactions.map(transaction => (
        <View key={transaction.id} style={styles.complianceCard}>
          <View style={styles.complianceHeader}>
            <Text style={styles.complianceTransactionNumber}>{transaction.transaction_number}</Text>
            <View style={[
              styles.complianceScoreBadge,
              { backgroundColor: getComplianceColor(transaction.compliance_status.compliance_score) }
            ]}>
              <Text style={styles.complianceScoreBadgeText}>
                {transaction.compliance_status.compliance_score}%
              </Text>
            </View>
          </View>

          <View style={styles.complianceChecklist}>
            {transaction.compliance_status.requirements_met.map((req, index) => (
              <View key={index} style={styles.complianceItem}>
                <Text style={styles.complianceItemText}>{req.requirement}</Text>
                <Text style={[
                  styles.complianceStatus,
                  { color: req.status === 'completed' ? '#10B981' : req.status === 'pending' ? '#F59E0B' : '#EF4444' }
                ]}>
                  {req.status === 'completed' ? '✓' : req.status === 'pending' ? '⏳' : '○'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered': return '#10B981';
      case 'pending':
      case 'in_transit': return '#F59E0B';
      case 'draft':
      case 'not_started': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cross-Border Trade</Text>
        <Text style={styles.subtitle}>Manage international transactions</Text>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'transactions', label: 'Transactions' },
          { key: 'routes', label: 'Routes' },
          { key: 'customs', label: 'Customs' },
          { key: 'compliance', label: 'Compliance' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'routes' && renderRoutes()}
      {activeTab === 'customs' && renderCustoms()}
      {activeTab === 'compliance' && renderCompliance()}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Trade Transaction</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product Name *</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.product_name}
                onChangeText={(text) => setTransactionForm({...transactionForm, product_name: text})}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>HS Code</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.hs_code}
                onChangeText={(text) => setTransactionForm({...transactionForm, hs_code: text})}
                placeholder="Enter HS code"
              />
            </View>

            <View style={styles.modalFormRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Quantity *</Text>
                <TextInput
                  style={styles.formInput}
                  value={transactionForm.quantity}
                  onChangeText={(text) => setTransactionForm({...transactionForm, quantity: text})}
                  placeholder="Quantity"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Unit</Text>
                <Picker
                  selectedValue={transactionForm.unit}
                  onValueChange={(value) => setTransactionForm({...transactionForm, unit: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Kilograms" value="kg" />
                  <Picker.Item label="Tons" value="tons" />
                  <Picker.Item label="Bags" value="bags" />
                  <Picker.Item label="Boxes" value="boxes" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Value (USD) *</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.value_usd}
                onChangeText={(text) => setTransactionForm({...transactionForm, value_usd: text})}
                placeholder="Enter value in USD"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalFormRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Origin Country</Text>
                <TextInput
                  style={styles.formInput}
                  value={transactionForm.origin_country}
                  onChangeText={(text) => setTransactionForm({...transactionForm, origin_country: text})}
                  placeholder="Origin country"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Destination Country</Text>
                <TextInput
                  style={styles.formInput}
                  value={transactionForm.destination_country}
                  onChangeText={(text) => setTransactionForm({...transactionForm, destination_country: text})}
                  placeholder="Destination country"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={createTradeTransaction}
            >
              <Text style={styles.submitButtonText}>Create Transaction</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionNumber: {
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
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tradeRoute: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 12,
  },
  complianceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  complianceScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complianceScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewDetailsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routeCard: {
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
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  routeProduct: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  routeDetails: {
    gap: 8,
  },
  routeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedTransaction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
    marginBottom: 16,
  },
  customsCard: {
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
  customsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  costLabelTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  costValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
  },
  requirementRow: {
    paddingVertical: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  formNumber: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  formStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noFormsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  complianceCard: {
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
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTransactionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  complianceScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  complianceScoreBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  complianceChecklist: {
    gap: 8,
  },
  complianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  complianceItemText: {
    fontSize: 14,
    color: '#374151',
  },
  complianceStatus: {
    fontSize: 16,
    fontWeight: 'bold',
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
  modalFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formHalf: {
    width: '48%',
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

export default CrossBorderTradeEnhanced;
