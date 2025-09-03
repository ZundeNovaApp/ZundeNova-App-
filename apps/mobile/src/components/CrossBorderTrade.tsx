import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface TradeRoute {
  id: string;
  origin_country: string;
  destination_country: string;
  transport_mode: 'road' | 'rail' | 'sea' | 'air';
  estimated_days: number;
  cost_per_kg: number;
  currency: string;
  border_crossings: string[];
  documentation_required: string[];
  restrictions: string[];
}

interface CustomsDeclaration {
  id: string;
  trade_id: string;
  product_name: string;
  hs_code: string;
  quantity: number;
  unit: string;
  unit_value: number;
  total_value: number;
  currency: string;
  origin_country: string;
  destination_country: string;
  exporter_details: {
    name: string;
    address: string;
    tax_id: string;
    contact: string;
  };
  importer_details: {
    name: string;
    address: string;
    tax_id: string;
    contact: string;
  };
  estimated_duties: {
    import_duty: number;
    vat: number;
    other_fees: number;
    total: number;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cleared';
  created_at: string;
  updated_at: string;
}

interface TradeCompliance {
  country: string;
  product_category: string;
  requirements: {
    certificates: string[];
    inspections: string[];
    permits: string[];
    restrictions: string[];
  };
  prohibited_items: string[];
  seasonal_restrictions: {
    period: string;
    restriction: string;
  }[];
}

export const CrossBorderTrade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'customs' | 'compliance' | 'calculator'>('routes');
  const [tradeRoutes, setTradeRoutes] = useState<TradeRoute[]>([]);
  const [customsDeclarations, setCustomsDeclarations] = useState<CustomsDeclaration[]>([]);
  const [complianceRules, setComplianceRules] = useState<TradeCompliance[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TradeRoute | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [calculator, setCalculator] = useState({
    product_name: '',
    hs_code: '',
    quantity: 0,
    unit_value: 0,
    origin_country: '',
    destination_country: '',
    transport_mode: 'road' as const
  });
  const [calculationResult, setCalculationResult] = useState<any>(null);

  useEffect(() => {
    loadTradeData();
  }, []);

  const loadTradeData = async () => {
    try {
      const routesData = await offlineStorageService.getOfflineDataByType('trade_routes');
      const customsData = await offlineStorageService.getOfflineDataByType('customs_declarations');
      const complianceData = await offlineStorageService.getOfflineDataByType('trade_compliance');
      
      if (routesData.length > 0) {
        setTradeRoutes(routesData[0].data);
      } else {
        setTradeRoutes(getSampleRoutes());
      }
      
      if (customsData.length > 0) {
        setCustomsDeclarations(customsData[0].data);
      } else {
        setCustomsDeclarations(getSampleCustomsDeclarations());
      }
      
      if (complianceData.length > 0) {
        setComplianceRules(complianceData[0].data);
      } else {
        setComplianceRules(getSampleComplianceRules());
      }
    } catch (error) {
      console.error('Failed to load trade data:', error);
    }
  };

  const getSampleRoutes = (): TradeRoute[] => [
    {
      id: '1',
      origin_country: 'Kenya',
      destination_country: 'Tanzania',
      transport_mode: 'road',
      estimated_days: 3,
      cost_per_kg: 0.15,
      currency: 'USD',
      border_crossings: ['Namanga Border'],
      documentation_required: ['Certificate of Origin', 'Phytosanitary Certificate', 'Commercial Invoice'],
      restrictions: ['No GMO products', 'Maximum 30 days shelf life']
    },
    {
      id: '2',
      origin_country: 'South Africa',
      destination_country: 'Zambia',
      transport_mode: 'road',
      estimated_days: 5,
      cost_per_kg: 0.22,
      currency: 'USD',
      border_crossings: ['Beitbridge Border', 'Chirundu Border'],
      documentation_required: ['SADC Certificate of Origin', 'Export Permit', 'Transit Documents'],
      restrictions: ['Quarantine inspection required', 'No live animals']
    },
    {
      id: '3',
      origin_country: 'Nigeria',
      destination_country: 'Ghana',
      transport_mode: 'road',
      estimated_days: 2,
      cost_per_kg: 0.18,
      currency: 'USD',
      border_crossings: ['Seme-Krake Border'],
      documentation_required: ['ECOWAS Certificate', 'Health Certificate', 'Commercial Invoice'],
      restrictions: ['ECOWAS trade protocol applies', 'No restricted chemicals']
    }
  ];

  const getSampleCustomsDeclarations = (): CustomsDeclaration[] => [
    {
      id: '1',
      trade_id: 'TRD001',
      product_name: 'Premium Maize',
      hs_code: '1005.90.00',
      quantity: 1000,
      unit: 'kg',
      unit_value: 0.25,
      total_value: 250,
      currency: 'USD',
      origin_country: 'Kenya',
      destination_country: 'Tanzania',
      exporter_details: {
        name: 'Green Valley Farm',
        address: 'Nairobi, Kenya',
        tax_id: 'KE123456789',
        contact: '+254700123456'
      },
      importer_details: {
        name: 'Dar es Salaam Traders',
        address: 'Dar es Salaam, Tanzania',
        tax_id: 'TZ987654321',
        contact: '+255700987654'
      },
      estimated_duties: {
        import_duty: 12.5,
        vat: 18.0,
        other_fees: 5.0,
        total: 35.5
      },
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const getSampleComplianceRules = (): TradeCompliance[] => [
    {
      country: 'Tanzania',
      product_category: 'Agricultural Products',
      requirements: {
        certificates: ['Phytosanitary Certificate', 'Certificate of Origin'],
        inspections: ['Port Health Inspection', 'Quality Control Check'],
        permits: ['Import Permit', 'Transit Permit'],
        restrictions: ['No GMO products', 'Moisture content < 14%']
      },
      prohibited_items: ['Genetically Modified Seeds', 'Expired Products'],
      seasonal_restrictions: [
        {
          period: 'March - May',
          restriction: 'Limited maize imports during harvest season'
        }
      ]
    },
    {
      country: 'South Africa',
      product_category: 'Livestock Products',
      requirements: {
        certificates: ['Veterinary Health Certificate', 'SADC Certificate'],
        inspections: ['Veterinary Inspection', 'Border Health Check'],
        permits: ['Import Permit', 'Quarantine Permit'],
        restrictions: ['30-day quarantine period', 'Vaccination records required']
      },
      prohibited_items: ['Live Poultry from High-Risk Areas', 'Unprocessed Meat'],
      seasonal_restrictions: [
        {
          period: 'December - February',
          restriction: 'Enhanced screening during foot-and-mouth season'
        }
      ]
    }
  ];

  const saveTradeData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'trade_routes',
        type: 'trade' as any,
        data: tradeRoutes
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'customs_declarations',
        type: 'trade' as any,
        data: customsDeclarations
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'trade_compliance',
        type: 'trade' as any,
        data: complianceRules
      });
    } catch (error) {
      console.error('Failed to save trade data:', error);
    }
  };

  const calculateTradeCosts = () => {
    if (!calculator.product_name || !calculator.quantity || !calculator.unit_value) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const totalValue = calculator.quantity * calculator.unit_value;
    const route = tradeRoutes.find(r => 
      r.origin_country === calculator.origin_country && 
      r.destination_country === calculator.destination_country &&
      r.transport_mode === calculator.transport_mode
    );

    const transportCost = route ? route.cost_per_kg * calculator.quantity : 0;
    const estimatedDuties = totalValue * 0.15; // 15% average duty
    const vat = totalValue * 0.18; // 18% VAT
    const otherFees = totalValue * 0.05; // 5% other fees
    const totalCost = totalValue + transportCost + estimatedDuties + vat + otherFees;

    setCalculationResult({
      product_value: totalValue,
      transport_cost: transportCost,
      duties: estimatedDuties,
      vat: vat,
      other_fees: otherFees,
      total_cost: totalCost,
      route: route,
      estimated_days: route?.estimated_days || 7
    });
  };

  const generateCustomsForm = () => {
    if (!calculationResult) {
      Alert.alert('Error', 'Please calculate costs first');
      return;
    }

    const customsDeclaration: CustomsDeclaration = {
      id: Date.now().toString(),
      trade_id: `TRD${Date.now()}`,
      product_name: calculator.product_name,
      hs_code: calculator.hs_code || '0000.00.00',
      quantity: calculator.quantity,
      unit: 'kg',
      unit_value: calculator.unit_value,
      total_value: calculationResult.product_value,
      currency: 'USD',
      origin_country: calculator.origin_country,
      destination_country: calculator.destination_country,
      exporter_details: {
        name: 'Current User',
        address: 'Address to be filled',
        tax_id: 'Tax ID to be filled',
        contact: 'Contact to be filled'
      },
      importer_details: {
        name: 'Importer to be filled',
        address: 'Address to be filled',
        tax_id: 'Tax ID to be filled',
        contact: 'Contact to be filled'
      },
      estimated_duties: {
        import_duty: calculationResult.duties,
        vat: calculationResult.vat,
        other_fees: calculationResult.other_fees,
        total: calculationResult.duties + calculationResult.vat + calculationResult.other_fees
      },
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedDeclarations = [...customsDeclarations, customsDeclaration];
    setCustomsDeclarations(updatedDeclarations);
    saveTradeData();

    Alert.alert('Success', 'Customs declaration form generated successfully!');
    setActiveTab('customs');
  };

  const renderRoutes = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Trade Routes</Text>
      
      {tradeRoutes.map(route => (
        <TouchableOpacity
          key={route.id}
          style={styles.routeCard}
          onPress={() => {
            setSelectedRoute(route);
            setShowRouteModal(true);
          }}
        >
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>
              {route.origin_country} → {route.destination_country}
            </Text>
            <View style={styles.transportBadge}>
              <Text style={styles.transportBadgeText}>
                {route.transport_mode.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.routeDetails}>
            <Text style={styles.routeDetail}>
              🚛 {route.estimated_days} days • ${route.cost_per_kg}/kg
            </Text>
            <Text style={styles.routeDetail}>
              🛂 {route.border_crossings.length} border crossing(s)
            </Text>
            <Text style={styles.routeDetail}>
              📋 {route.documentation_required.length} documents required
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCustoms = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Customs Declarations</Text>
      
      {customsDeclarations.map(declaration => (
        <View key={declaration.id} style={styles.customsCard}>
          <View style={styles.customsHeader}>
            <Text style={styles.customsTitle}>{declaration.product_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(declaration.status) }]}>
              <Text style={styles.statusBadgeText}>{declaration.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.customsDetails}>
            <Text style={styles.customsDetail}>
              Trade ID: {declaration.trade_id}
            </Text>
            <Text style={styles.customsDetail}>
              HS Code: {declaration.hs_code}
            </Text>
            <Text style={styles.customsDetail}>
              Quantity: {declaration.quantity} {declaration.unit}
            </Text>
            <Text style={styles.customsDetail}>
              Value: {declaration.currency} {declaration.total_value.toLocaleString()}
            </Text>
            <Text style={styles.customsDetail}>
              Route: {declaration.origin_country} → {declaration.destination_country}
            </Text>
          </View>
          
          <View style={styles.dutiesContainer}>
            <Text style={styles.dutiesTitle}>Estimated Duties & Fees:</Text>
            <Text style={styles.dutiesDetail}>
              Import Duty: {declaration.currency} {declaration.estimated_duties.import_duty.toFixed(2)}
            </Text>
            <Text style={styles.dutiesDetail}>
              VAT: {declaration.currency} {declaration.estimated_duties.vat.toFixed(2)}
            </Text>
            <Text style={styles.dutiesDetail}>
              Other Fees: {declaration.currency} {declaration.estimated_duties.other_fees.toFixed(2)}
            </Text>
            <Text style={styles.dutiesTotal}>
              Total: {declaration.currency} {declaration.estimated_duties.total.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCompliance = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Trade Compliance Rules</Text>
      
      {complianceRules.map((compliance, index) => (
        <View key={index} style={styles.complianceCard}>
          <Text style={styles.complianceTitle}>
            {compliance.country} - {compliance.product_category}
          </Text>
          
          <View style={styles.complianceSection}>
            <Text style={styles.complianceSectionTitle}>Required Certificates:</Text>
            {compliance.requirements.certificates.map((cert, i) => (
              <Text key={i} style={styles.complianceItem}>• {cert}</Text>
            ))}
          </View>
          
          <View style={styles.complianceSection}>
            <Text style={styles.complianceSectionTitle}>Required Inspections:</Text>
            {compliance.requirements.inspections.map((inspection, i) => (
              <Text key={i} style={styles.complianceItem}>• {inspection}</Text>
            ))}
          </View>
          
          <View style={styles.complianceSection}>
            <Text style={styles.complianceSectionTitle}>Permits Required:</Text>
            {compliance.requirements.permits.map((permit, i) => (
              <Text key={i} style={styles.complianceItem}>• {permit}</Text>
            ))}
          </View>
          
          {compliance.prohibited_items.length > 0 && (
            <View style={styles.complianceSection}>
              <Text style={styles.complianceSectionTitle}>Prohibited Items:</Text>
              {compliance.prohibited_items.map((item, i) => (
                <Text key={i} style={styles.prohibitedItem}>⚠️ {item}</Text>
              ))}
            </View>
          )}
          
          {compliance.seasonal_restrictions.length > 0 && (
            <View style={styles.complianceSection}>
              <Text style={styles.complianceSectionTitle}>Seasonal Restrictions:</Text>
              {compliance.seasonal_restrictions.map((restriction, i) => (
                <Text key={i} style={styles.seasonalItem}>
                  📅 {restriction.period}: {restriction.restriction}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderCalculator = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Trade Cost Calculator</Text>
      
      <View style={styles.calculatorForm}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={calculator.product_name}
            onChangeText={(text) => setCalculator({...calculator, product_name: text})}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>HS Code</Text>
          <TextInput
            style={styles.input}
            value={calculator.hs_code}
            onChangeText={(text) => setCalculator({...calculator, hs_code: text})}
            placeholder="e.g., 1005.90.00"
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Quantity (kg) *</Text>
            <TextInput
              style={styles.input}
              value={calculator.quantity.toString()}
              onChangeText={(text) => setCalculator({...calculator, quantity: parseFloat(text) || 0})}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Unit Value (USD) *</Text>
            <TextInput
              style={styles.input}
              value={calculator.unit_value.toString()}
              onChangeText={(text) => setCalculator({...calculator, unit_value: parseFloat(text) || 0})}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Origin Country *</Text>
            <TextInput
              style={styles.input}
              value={calculator.origin_country}
              onChangeText={(text) => setCalculator({...calculator, origin_country: text})}
              placeholder="e.g., Kenya"
            />
          </View>
          
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Destination Country *</Text>
            <TextInput
              style={styles.input}
              value={calculator.destination_country}
              onChangeText={(text) => setCalculator({...calculator, destination_country: text})}
              placeholder="e.g., Tanzania"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Transport Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.transportSelector}>
            {['road', 'rail', 'sea', 'air'].map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.transportButton,
                  calculator.transport_mode === mode && styles.transportButtonActive
                ]}
                onPress={() => setCalculator({...calculator, transport_mode: mode as any})}
              >
                <Text style={[
                  styles.transportButtonText,
                  calculator.transport_mode === mode && styles.transportButtonTextActive
                ]}>
                  {mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateTradeCosts}>
          <Text style={styles.calculateButtonText}>Calculate Costs</Text>
        </TouchableOpacity>

        {calculationResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Cost Breakdown</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Product Value:</Text>
              <Text style={styles.resultValue}>USD {calculationResult.product_value.toFixed(2)}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Transport Cost:</Text>
              <Text style={styles.resultValue}>USD {calculationResult.transport_cost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Import Duties:</Text>
              <Text style={styles.resultValue}>USD {calculationResult.duties.toFixed(2)}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>VAT:</Text>
              <Text style={styles.resultValue}>USD {calculationResult.vat.toFixed(2)}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Other Fees:</Text>
              <Text style={styles.resultValue}>USD {calculationResult.other_fees.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.resultItem, styles.resultTotal]}>
              <Text style={styles.resultTotalLabel}>Total Cost:</Text>
              <Text style={styles.resultTotalValue}>USD {calculationResult.total_cost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.resultInfo}>
              <Text style={styles.resultInfoText}>
                Estimated Delivery: {calculationResult.estimated_days} days
              </Text>
              {calculationResult.route && (
                <Text style={styles.resultInfoText}>
                  Route: {calculationResult.route.origin_country} → {calculationResult.route.destination_country}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={generateCustomsForm}>
              <Text style={styles.generateButtonText}>Generate Customs Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderRouteModal = () => (
    <Modal
      visible={showRouteModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowRouteModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Route Details</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowRouteModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedRoute && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.routeDetailCard}>
              <Text style={styles.routeDetailTitle}>
                {selectedRoute.origin_country} → {selectedRoute.destination_country}
              </Text>
              
              <View style={styles.routeDetailSection}>
                <Text style={styles.routeDetailSectionTitle}>Transport Information</Text>
                <Text style={styles.routeDetailItem}>Mode: {selectedRoute.transport_mode.toUpperCase()}</Text>
                <Text style={styles.routeDetailItem}>Estimated Time: {selectedRoute.estimated_days} days</Text>
                <Text style={styles.routeDetailItem}>Cost: {selectedRoute.currency} {selectedRoute.cost_per_kg}/kg</Text>
              </View>
              
              <View style={styles.routeDetailSection}>
                <Text style={styles.routeDetailSectionTitle}>Border Crossings</Text>
                {selectedRoute.border_crossings.map((crossing, index) => (
                  <Text key={index} style={styles.routeDetailItem}>• {crossing}</Text>
                ))}
              </View>
              
              <View style={styles.routeDetailSection}>
                <Text style={styles.routeDetailSectionTitle}>Required Documentation</Text>
                {selectedRoute.documentation_required.map((doc, index) => (
                  <Text key={index} style={styles.routeDetailItem}>• {doc}</Text>
                ))}
              </View>
              
              <View style={styles.routeDetailSection}>
                <Text style={styles.routeDetailSectionTitle}>Restrictions</Text>
                {selectedRoute.restrictions.map((restriction, index) => (
                  <Text key={index} style={styles.restrictionItem}>⚠️ {restriction}</Text>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22C55E';
      case 'submitted': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'cleared': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cross-Border Trade</Text>
        <Text style={styles.subtitle}>Routes, customs & compliance management</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'routes' && styles.activeTab]}
          onPress={() => setActiveTab('routes')}
        >
          <Text style={[styles.tabText, activeTab === 'routes' && styles.activeTabText]}>
            Routes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'customs' && styles.activeTab]}
          onPress={() => setActiveTab('customs')}
        >
          <Text style={[styles.tabText, activeTab === 'customs' && styles.activeTabText]}>
            Customs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compliance' && styles.activeTab]}
          onPress={() => setActiveTab('compliance')}
        >
          <Text style={[styles.tabText, activeTab === 'compliance' && styles.activeTabText]}>
            Compliance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calculator' && styles.activeTab]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabText, activeTab === 'calculator' && styles.activeTabText]}>
            Calculator
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'routes' && renderRoutes()}
      {activeTab === 'customs' && renderCustoms()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'calculator' && renderCalculator()}

      {renderRouteModal()}
    </View>
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  routeCard: {
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
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  transportBadge: {
    backgroundColor: '#228B22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transportBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeDetails: {
    marginTop: 8,
  },
  routeDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  customsCard: {
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
  customsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customsDetails: {
    marginBottom: 16,
  },
  customsDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dutiesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  dutiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dutiesDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dutiesTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  complianceCard: {
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
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  complianceSection: {
    marginBottom: 16,
  },
  complianceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  complianceItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 8,
  },
  prohibitedItem: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 4,
    marginLeft: 8,
  },
  seasonalItem: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 4,
    marginLeft: 8,
  },
  calculatorForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 0.48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transportSelector: {
    flexDirection: 'row',
  },
  transportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transportButtonActive: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  transportButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  transportButtonTextActive: {
    color: 'white',
  },
  calculateButton: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  resultTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#22C55E',
  },
  resultTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resultTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  resultInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resultInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#228B22',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  routeDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  routeDetailSection: {
    marginBottom: 20,
  },
  routeDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  routeDetailItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    marginLeft: 8,
  },
  restrictionItem: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 6,
    marginLeft: 8,
  },
});

export default CrossBorderTrade;
