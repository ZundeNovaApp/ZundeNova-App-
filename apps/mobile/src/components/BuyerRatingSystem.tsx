import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface BuyerProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  business_type: 'retailer' | 'processor' | 'exporter' | 'wholesaler' | 'cooperative';
  registration_date: string;
  verification_status: 'pending' | 'verified' | 'premium' | 'suspended';
  payment_methods: string[];
  preferred_products: string[];
  average_order_value: number;
  total_orders: number;
  rating: BuyerRating;
  contracts: ContractTemplate[];
  dispute_history: DisputeRecord[];
}

interface BuyerRating {
  overall_score: number;
  total_reviews: number;
  payment_reliability: number;
  communication: number;
  contract_compliance: number;
  quality_standards: number;
  delivery_flexibility: number;
  recent_reviews: Review[];
  trust_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface Review {
  id: string;
  seller_id: string;
  seller_name: string;
  order_id: string;
  rating: number;
  categories: {
    payment_reliability: number;
    communication: number;
    contract_compliance: number;
    quality_standards: number;
    delivery_flexibility: number;
  };
  comment: string;
  date: string;
  verified: boolean;
  helpful_votes: number;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'spot' | 'forward' | 'seasonal' | 'exclusive';
  terms: {
    payment_terms: string;
    delivery_terms: string;
    quality_requirements: string;
    quantity_flexibility: number;
    price_mechanism: 'fixed' | 'market_linked' | 'formula';
    dispute_resolution: string;
    force_majeure: string;
    termination_clause: string;
  };
  standard_clauses: string[];
  custom_clauses: string[];
  usage_count: number;
  success_rate: number;
  created_date: string;
  last_updated: string;
}

interface DisputeRecord {
  id: string;
  order_id: string;
  seller_id: string;
  seller_name: string;
  dispute_type: 'payment' | 'quality' | 'delivery' | 'contract_breach' | 'other';
  description: string;
  status: 'open' | 'mediation' | 'arbitration' | 'resolved' | 'closed';
  resolution: string;
  resolution_time_days: number;
  buyer_satisfaction: number;
  seller_satisfaction: number;
  date_filed: string;
  date_resolved?: string;
  mediator_notes?: string;
}

export const BuyerRatingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buyers' | 'contracts' | 'disputes' | 'reviews'>('buyers');
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [contracts, setContracts] = useState<ContractTemplate[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Review>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');

  useEffect(() => {
    loadBuyerData();
  }, []);

  const loadBuyerData = async () => {
    try {
      const buyersData = await offlineStorageService.getOfflineDataByType('buyer_profiles');
      const contractsData = await offlineStorageService.getOfflineDataByType('contract_templates');
      
      if (buyersData.length > 0) {
        setBuyers(buyersData[0].data);
      } else {
        setBuyers(getSampleBuyers());
      }
      
      if (contractsData.length > 0) {
        setContracts(contractsData[0].data);
      } else {
        setContracts(getSampleContracts());
      }
    } catch (error) {
      console.error('Failed to load buyer data:', error);
    }
  };

  const getSampleBuyers = (): BuyerProfile[] => [
    {
      id: 'buyer_001',
      name: 'AgriCorp International',
      company: 'AgriCorp Ltd',
      email: 'procurement@agricorp.com',
      phone: '+254700123456',
      location: {
        country: 'Kenya',
        region: 'Nairobi',
        city: 'Nairobi'
      },
      business_type: 'exporter',
      registration_date: '2022-01-15',
      verification_status: 'premium',
      payment_methods: ['Bank Transfer', 'Letter of Credit', 'Escrow'],
      preferred_products: ['Maize', 'Beans', 'Coffee'],
      average_order_value: 25000,
      total_orders: 45,
      rating: {
        overall_score: 4.7,
        total_reviews: 23,
        payment_reliability: 4.9,
        communication: 4.6,
        contract_compliance: 4.8,
        quality_standards: 4.5,
        delivery_flexibility: 4.7,
        recent_reviews: [],
        trust_score: 92,
        risk_level: 'low'
      },
      contracts: [],
      dispute_history: []
    },
    {
      id: 'buyer_002',
      name: 'East Africa Processors',
      company: 'EA Processors Co.',
      email: 'orders@eaprocessors.com',
      phone: '+256701234567',
      location: {
        country: 'Uganda',
        region: 'Central',
        city: 'Kampala'
      },
      business_type: 'processor',
      registration_date: '2021-08-20',
      verification_status: 'verified',
      payment_methods: ['Bank Transfer', 'Mobile Money'],
      preferred_products: ['Maize', 'Sorghum', 'Millet'],
      average_order_value: 15000,
      total_orders: 67,
      rating: {
        overall_score: 4.2,
        total_reviews: 34,
        payment_reliability: 4.0,
        communication: 4.3,
        contract_compliance: 4.1,
        quality_standards: 4.4,
        delivery_flexibility: 4.2,
        recent_reviews: [],
        trust_score: 78,
        risk_level: 'low'
      },
      contracts: [],
      dispute_history: [
        {
          id: 'dispute_001',
          order_id: 'order_123',
          seller_id: 'seller_001',
          seller_name: 'John Farmer',
          dispute_type: 'quality',
          description: 'Moisture content higher than agreed specifications',
          status: 'resolved',
          resolution: 'Price adjustment of 5% applied, quality standards clarified for future orders',
          resolution_time_days: 7,
          buyer_satisfaction: 4,
          seller_satisfaction: 4,
          date_filed: '2024-01-15',
          date_resolved: '2024-01-22',
          mediator_notes: 'Both parties agreed to revised quality testing procedures'
        }
      ]
    },
    {
      id: 'buyer_003',
      name: 'Regional Retail Chain',
      company: 'Fresh Markets Ltd',
      email: 'supply@freshmarkets.co.tz',
      phone: '+255712345678',
      location: {
        country: 'Tanzania',
        region: 'Dar es Salaam',
        city: 'Dar es Salaam'
      },
      business_type: 'retailer',
      registration_date: '2023-03-10',
      verification_status: 'pending',
      payment_methods: ['Bank Transfer'],
      preferred_products: ['Vegetables', 'Fruits', 'Grains'],
      average_order_value: 8000,
      total_orders: 12,
      rating: {
        overall_score: 3.8,
        total_reviews: 8,
        payment_reliability: 3.5,
        communication: 4.0,
        contract_compliance: 3.8,
        quality_standards: 4.1,
        delivery_flexibility: 3.6,
        recent_reviews: [],
        trust_score: 65,
        risk_level: 'medium'
      },
      contracts: [],
      dispute_history: []
    }
  ];

  const getSampleContracts = (): ContractTemplate[] => [
    {
      id: 'contract_001',
      name: 'Standard Grain Purchase Agreement',
      type: 'spot',
      terms: {
        payment_terms: 'Net 30 days from delivery confirmation',
        delivery_terms: 'FOB farm gate, buyer arranges transport',
        quality_requirements: 'Grade A minimum, moisture content <14%, purity >95%',
        quantity_flexibility: 10,
        price_mechanism: 'fixed',
        dispute_resolution: 'Mediation through platform, arbitration if unresolved',
        force_majeure: 'Standard force majeure clause covering natural disasters',
        termination_clause: '7 days written notice for breach, immediate for non-payment'
      },
      standard_clauses: [
        'Quality inspection within 48 hours of delivery',
        'Payment penalty of 2% per week for late payment',
        'Seller warrants clear title and legal right to sell',
        'Buyer responsible for all transport and logistics costs',
        'Risk transfers upon delivery confirmation'
      ],
      custom_clauses: [],
      usage_count: 156,
      success_rate: 94.2,
      created_date: '2023-01-15',
      last_updated: '2024-02-20'
    },
    {
      id: 'contract_002',
      name: 'Forward Contract - Seasonal Crops',
      type: 'forward',
      terms: {
        payment_terms: '30% advance, 70% on delivery',
        delivery_terms: 'Delivered to buyer warehouse',
        quality_requirements: 'As per agreed specifications and lab certificates',
        quantity_flexibility: 15,
        price_mechanism: 'market_linked',
        dispute_resolution: 'Platform mediation with expert panel review',
        force_majeure: 'Extended force majeure including market disruption',
        termination_clause: 'Mutual agreement or material breach with 14 days cure period'
      },
      standard_clauses: [
        'Price linked to commodity exchange rates at delivery',
        'Quality premiums and discounts as per grading system',
        'Delivery window of 30 days from agreed date',
        'Insurance coverage required for advance payments',
        'Regular progress updates required from seller'
      ],
      custom_clauses: [
        'Sustainability certification bonus of 5%',
        'Organic premium of 15% with valid certification'
      ],
      usage_count: 89,
      success_rate: 91.0,
      created_date: '2023-06-01',
      last_updated: '2024-01-10'
    },
    {
      id: 'contract_003',
      name: 'Exclusive Supply Agreement',
      type: 'exclusive',
      terms: {
        payment_terms: 'Net 15 days, early payment discount 2%',
        delivery_terms: 'Multiple delivery points as scheduled',
        quality_requirements: 'Premium grade only, certified organic preferred',
        quantity_flexibility: 5,
        price_mechanism: 'formula',
        dispute_resolution: 'Direct negotiation, then expert arbitration',
        force_majeure: 'Comprehensive force majeure with notification requirements',
        termination_clause: '90 days notice, immediate for material breach'
      },
      standard_clauses: [
        'Exclusive supply arrangement for specified products',
        'Volume commitments with minimum purchase guarantees',
        'Regular quality audits and farm inspections',
        'Traceability requirements with blockchain verification',
        'Sustainability and social compliance standards'
      ],
      custom_clauses: [
        'Annual volume bonus for exceeding targets',
        'Investment support for farm improvements',
        'Technical assistance and training programs'
      ],
      usage_count: 23,
      success_rate: 87.5,
      created_date: '2023-09-15',
      last_updated: '2024-03-05'
    }
  ];

  const saveBuyerData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'buyer_profiles',
        type: 'marketplace' as any,
        data: buyers
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'contract_templates',
        type: 'marketplace' as any,
        data: contracts
      });
    } catch (error) {
      console.error('Failed to save buyer data:', error);
    }
  };

  const submitReview = async () => {
    if (!selectedBuyer || !newReview.rating || !newReview.comment) {
      Alert.alert('Error', 'Please provide rating and comment');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      seller_id: 'current_user',
      seller_name: 'Current User',
      order_id: newReview.order_id || 'manual_review',
      rating: newReview.rating,
      categories: newReview.categories || {
        payment_reliability: newReview.rating,
        communication: newReview.rating,
        contract_compliance: newReview.rating,
        quality_standards: newReview.rating,
        delivery_flexibility: newReview.rating
      },
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: true,
      helpful_votes: 0
    };

    const updatedBuyers = buyers.map(buyer => {
      if (buyer.id === selectedBuyer.id) {
        const updatedReviews = [...buyer.rating.recent_reviews, review];
        const totalReviews = buyer.rating.total_reviews + 1;
        const newOverallScore = ((buyer.rating.overall_score * buyer.rating.total_reviews) + review.rating) / totalReviews;
        
        return {
          ...buyer,
          rating: {
            ...buyer.rating,
            overall_score: newOverallScore,
            total_reviews: totalReviews,
            recent_reviews: updatedReviews.slice(-10), // Keep last 10 reviews
            trust_score: Math.min(95, buyer.rating.trust_score + 1) // Slight trust boost
          }
        };
      }
      return buyer;
    });

    setBuyers(updatedBuyers);
    await saveBuyerData();
    
    setShowReviewModal(false);
    setNewReview({});
    setSelectedBuyer(null);
    
    Alert.alert('Success', 'Review submitted successfully');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#22C55E';
    if (rating >= 4.0) return '#3B82F6';
    if (rating >= 3.5) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#22C55E';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'premium': return '#8B5CF6';
      case 'verified': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'premium': return '👑';
      case 'verified': return '✅';
      case 'pending': return '⏳';
      case 'suspended': return '🚫';
      default: return '❓';
    }
  };

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 'all' || 
                         (filterRating === '4+' && buyer.rating.overall_score >= 4.0) ||
                         (filterRating === '3+' && buyer.rating.overall_score >= 3.0 && buyer.rating.overall_score < 4.0) ||
                         (filterRating === '<3' && buyer.rating.overall_score < 3.0);
    const matchesVerification = filterVerification === 'all' || buyer.verification_status === filterVerification;
    
    return matchesSearch && matchesRating && matchesVerification;
  });

  const renderBuyers = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search buyers..."
          placeholderTextColor="#9CA3AF"
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterRating === 'all' && styles.filterActive]}
              onPress={() => setFilterRating('all')}
            >
              <Text style={[styles.filterText, filterRating === 'all' && styles.filterTextActive]}>
                All Ratings
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterRating === '4+' && styles.filterActive]}
              onPress={() => setFilterRating('4+')}
            >
              <Text style={[styles.filterText, filterRating === '4+' && styles.filterTextActive]}>
                4+ Stars
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterRating === '3+' && styles.filterActive]}
              onPress={() => setFilterRating('3+')}
            >
              <Text style={[styles.filterText, filterRating === '3+' && styles.filterTextActive]}>
                3+ Stars
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterVerification === 'all' && styles.filterActive]}
              onPress={() => setFilterVerification('all')}
            >
              <Text style={[styles.filterText, filterVerification === 'all' && styles.filterTextActive]}>
                All Status
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterVerification === 'premium' && styles.filterActive]}
              onPress={() => setFilterVerification('premium')}
            >
              <Text style={[styles.filterText, filterVerification === 'premium' && styles.filterTextActive]}>
                👑 Premium
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterVerification === 'verified' && styles.filterActive]}
              onPress={() => setFilterVerification('verified')}
            >
              <Text style={[styles.filterText, filterVerification === 'verified' && styles.filterTextActive]}>
                ✅ Verified
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {filteredBuyers.map(buyer => (
        <View key={buyer.id} style={styles.buyerCard}>
          <View style={styles.buyerHeader}>
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{buyer.name}</Text>
              <Text style={styles.buyerCompany}>{buyer.company}</Text>
              <Text style={styles.buyerLocation}>
                {buyer.location.city}, {buyer.location.country}
              </Text>
            </View>
            
            <View style={styles.buyerStatus}>
              <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(buyer.verification_status) }]}>
                <Text style={styles.verificationBadgeText}>
                  {getVerificationIcon(buyer.verification_status)} {buyer.verification_status.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <Text style={[styles.ratingScore, { color: getRatingColor(buyer.rating.overall_score) }]}>
                  ⭐ {buyer.rating.overall_score.toFixed(1)}
                </Text>
                <Text style={styles.ratingCount}>
                  ({buyer.rating.total_reviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buyerDetails}>
            <View style={styles.buyerStat}>
              <Text style={styles.statLabel}>Business Type</Text>
              <Text style={styles.statValue}>{buyer.business_type}</Text>
            </View>
            
            <View style={styles.buyerStat}>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>{buyer.total_orders}</Text>
            </View>
            
            <View style={styles.buyerStat}>
              <Text style={styles.statLabel}>Avg Order Value</Text>
              <Text style={styles.statValue}>${buyer.average_order_value.toLocaleString()}</Text>
            </View>
            
            <View style={styles.buyerStat}>
              <Text style={styles.statLabel}>Trust Score</Text>
              <Text style={[styles.statValue, { color: getRatingColor(buyer.rating.trust_score / 20) }]}>
                {buyer.rating.trust_score}/100
              </Text>
            </View>
          </View>

          <View style={styles.ratingBreakdown}>
            <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Payment</Text>
                <Text style={[styles.breakdownScore, { color: getRatingColor(buyer.rating.payment_reliability) }]}>
                  {buyer.rating.payment_reliability.toFixed(1)}
                </Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Communication</Text>
                <Text style={[styles.breakdownScore, { color: getRatingColor(buyer.rating.communication) }]}>
                  {buyer.rating.communication.toFixed(1)}
                </Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Compliance</Text>
                <Text style={[styles.breakdownScore, { color: getRatingColor(buyer.rating.contract_compliance) }]}>
                  {buyer.rating.contract_compliance.toFixed(1)}
                </Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Quality</Text>
                <Text style={[styles.breakdownScore, { color: getRatingColor(buyer.rating.quality_standards) }]}>
                  {buyer.rating.quality_standards.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.riskAssessment}>
            <Text style={styles.riskTitle}>Risk Assessment</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(buyer.rating.risk_level) }]}>
              <Text style={styles.riskBadgeText}>
                {buyer.rating.risk_level.toUpperCase()} RISK
              </Text>
            </View>
          </View>

          <View style={styles.buyerActions}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => {
                setSelectedBuyer(buyer);
                setShowReviewModal(true);
              }}
            >
              <Text style={styles.reviewButtonText}>Leave Review</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contractButton}>
              <Text style={styles.contractButtonText}>Create Contract</Text>
            </TouchableOpacity>
          </View>

          {buyer.dispute_history.length > 0 && (
            <View style={styles.disputeHistory}>
              <Text style={styles.disputeTitle}>Recent Disputes</Text>
              {buyer.dispute_history.slice(0, 2).map(dispute => (
                <View key={dispute.id} style={styles.disputeItem}>
                  <Text style={styles.disputeType}>{dispute.dispute_type}</Text>
                  <Text style={styles.disputeStatus}>{dispute.status}</Text>
                  <Text style={styles.disputeResolution}>
                    Resolved in {dispute.resolution_time_days} days
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderContracts = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Contract Templates</Text>
      
      {contracts.map(contract => (
        <View key={contract.id} style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <Text style={styles.contractName}>{contract.name}</Text>
            <View style={styles.contractType}>
              <Text style={styles.contractTypeText}>{contract.type.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.contractStats}>
            <View style={styles.contractStat}>
              <Text style={styles.contractStatLabel}>Usage</Text>
              <Text style={styles.contractStatValue}>{contract.usage_count}</Text>
            </View>
            
            <View style={styles.contractStat}>
              <Text style={styles.contractStatLabel}>Success Rate</Text>
              <Text style={[styles.contractStatValue, { color: getRatingColor(contract.success_rate / 20) }]}>
                {contract.success_rate.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.contractTerms}>
            <Text style={styles.contractTermsTitle}>Key Terms</Text>
            <Text style={styles.contractTerm}>Payment: {contract.terms.payment_terms}</Text>
            <Text style={styles.contractTerm}>Delivery: {contract.terms.delivery_terms}</Text>
            <Text style={styles.contractTerm}>Quality: {contract.terms.quality_requirements}</Text>
            <Text style={styles.contractTerm}>Price: {contract.terms.price_mechanism}</Text>
          </View>
          
          <View style={styles.contractActions}>
            <TouchableOpacity style={styles.useTemplateButton}>
              <Text style={styles.useTemplateButtonText}>Use Template</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.customizeButton}>
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowReviewModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Rate Buyer</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowReviewModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedBuyer && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.buyerSummary}>
              <Text style={styles.buyerSummaryName}>{selectedBuyer.name}</Text>
              <Text style={styles.buyerSummaryCompany}>{selectedBuyer.company}</Text>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingSectionTitle}>Overall Rating</Text>
              <View style={styles.starRating}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNewReview({...newReview, rating: star})}
                  >
                    <Text style={[
                      styles.star,
                      star <= (newReview.rating || 0) && styles.starActive
                    ]}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentSectionTitle}>Your Review</Text>
              <TextInput
                style={styles.commentInput}
                value={newReview.comment || ''}
                onChangeText={(text) => setNewReview({...newReview, comment: text})}
                placeholder="Share your experience with this buyer..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.submitReviewButton} onPress={submitReview}>
              <Text style={styles.submitReviewButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buyer Rating System</Text>
        <Text style={styles.subtitle}>Trusted buyer network & contract management</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buyers' && styles.activeTab]}
          onPress={() => setActiveTab('buyers')}
        >
          <Text style={[styles.tabText, activeTab === 'buyers' && styles.activeTabText]}>
            Buyers ({filteredBuyers.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contracts' && styles.activeTab]}
          onPress={() => setActiveTab('contracts')}
        >
          <Text style={[styles.tabText, activeTab === 'contracts' && styles.activeTabText]}>
            Contracts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'buyers' && renderBuyers()}
      {activeTab === 'contracts' && renderContracts()}

      {renderReviewModal()}
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
    fontSize: 16,
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
  filtersContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterActive: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  buyerCard: {
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
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  buyerCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  buyerLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  buyerStatus: {
    alignItems: 'flex-end',
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  buyerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  buyerStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingBreakdown: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  riskAssessment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reviewButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  contractButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
  },
  contractButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  disputeHistory: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
  },
  disputeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  disputeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  disputeType: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  disputeStatus: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  disputeResolution: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
  },
  contractCard: {
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
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  contractType: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contractTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contractStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  contractStat: {
    alignItems: 'center',
  },
  contractStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  contractStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  contractTerms: {
    marginBottom: 16,
  },
  contractTermsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  contractTerm: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  contractActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  useTemplateButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  useTemplateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  customizeButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  customizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  buyerSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyerSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  buyerSummaryCompany: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingSection: {
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
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 32,
    color: '#D1D5DB',
    marginHorizontal: 4,
  },
  starActive: {
    color: '#F59E0B',
  },
  commentSection: {
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
  commentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitReviewButton: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitReviewButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BuyerRatingSystem;
