import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Image } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface QualityGrade {
  id: string;
  name: string;
  code: string;
  description: string;
  criteria: QualityCriteria[];
  price_multiplier: number;
  color: string;
  icon: string;
}

interface QualityCriteria {
  id: string;
  name: string;
  description: string;
  measurement_type: 'visual' | 'measurement' | 'test' | 'certificate';
  min_value?: number;
  max_value?: number;
  unit?: string;
  acceptable_values?: string[];
  weight: number; // Importance weight (0-1)
}

interface ProductLot {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  farmer_id: string;
  farmer_name: string;
  harvest_date: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  quality_assessment?: QualityAssessment;
  images: string[];
  certificates: string[];
  status: 'pending' | 'graded' | 'certified' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface QualityAssessment {
  id: string;
  lot_id: string;
  assessor_id: string;
  assessor_name: string;
  grade: QualityGrade;
  criteria_scores: {
    criteria_id: string;
    score: number;
    notes: string;
    evidence?: string[];
  }[];
  overall_score: number;
  final_grade: string;
  price_adjustment: number;
  lab_results?: {
    moisture_content?: number;
    protein_content?: number;
    aflatoxin_level?: number;
    pesticide_residue?: string;
    heavy_metals?: string;
  };
  assessment_date: string;
  expiry_date: string;
  notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export const QualityGradingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lots' | 'grading' | 'certificates' | 'standards'>('lots');
  const [productLots, setProductLots] = useState<ProductLot[]>([]);
  const [qualityGrades, setQualityGrades] = useState<QualityGrade[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Partial<QualityAssessment>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      const lotsData = await offlineStorageService.getOfflineDataByType('product_lots');
      const gradesData = await offlineStorageService.getOfflineDataByType('quality_grades');
      
      if (lotsData.length > 0) {
        setProductLots(lotsData[0].data);
      } else {
        setProductLots(getSampleLots());
      }
      
      if (gradesData.length > 0) {
        setQualityGrades(gradesData[0].data);
      } else {
        setQualityGrades(getSampleGrades());
      }
    } catch (error) {
      console.error('Failed to load quality data:', error);
    }
  };

  const getSampleGrades = (): QualityGrade[] => [
    {
      id: 'premium',
      name: 'Premium Grade',
      code: 'A+',
      description: 'Highest quality with exceptional characteristics',
      criteria: [
        {
          id: 'moisture',
          name: 'Moisture Content',
          description: 'Optimal moisture level for storage',
          measurement_type: 'measurement',
          min_value: 12,
          max_value: 14,
          unit: '%',
          weight: 0.3
        },
        {
          id: 'appearance',
          name: 'Visual Appearance',
          description: 'Color, size uniformity, and defects',
          measurement_type: 'visual',
          acceptable_values: ['Excellent', 'Very Good'],
          weight: 0.25
        },
        {
          id: 'purity',
          name: 'Purity Level',
          description: 'Freedom from foreign matter',
          measurement_type: 'measurement',
          min_value: 98,
          max_value: 100,
          unit: '%',
          weight: 0.2
        },
        {
          id: 'certificates',
          name: 'Organic Certification',
          description: 'Valid organic certification',
          measurement_type: 'certificate',
          weight: 0.25
        }
      ],
      price_multiplier: 1.3,
      color: '#22C55E',
      icon: '🏆'
    },
    {
      id: 'grade_a',
      name: 'Grade A',
      code: 'A',
      description: 'High quality meeting export standards',
      criteria: [
        {
          id: 'moisture',
          name: 'Moisture Content',
          description: 'Acceptable moisture level',
          measurement_type: 'measurement',
          min_value: 12,
          max_value: 15,
          unit: '%',
          weight: 0.3
        },
        {
          id: 'appearance',
          name: 'Visual Appearance',
          description: 'Good color and minimal defects',
          measurement_type: 'visual',
          acceptable_values: ['Very Good', 'Good'],
          weight: 0.3
        },
        {
          id: 'purity',
          name: 'Purity Level',
          description: 'Low foreign matter content',
          measurement_type: 'measurement',
          min_value: 95,
          max_value: 100,
          unit: '%',
          weight: 0.4
        }
      ],
      price_multiplier: 1.15,
      color: '#3B82F6',
      icon: '⭐'
    },
    {
      id: 'grade_b',
      name: 'Grade B',
      code: 'B',
      description: 'Standard quality for domestic market',
      criteria: [
        {
          id: 'moisture',
          name: 'Moisture Content',
          description: 'Standard moisture level',
          measurement_type: 'measurement',
          min_value: 12,
          max_value: 16,
          unit: '%',
          weight: 0.3
        },
        {
          id: 'appearance',
          name: 'Visual Appearance',
          description: 'Acceptable appearance with minor defects',
          measurement_type: 'visual',
          acceptable_values: ['Good', 'Fair'],
          weight: 0.3
        },
        {
          id: 'purity',
          name: 'Purity Level',
          description: 'Moderate foreign matter content',
          measurement_type: 'measurement',
          min_value: 90,
          max_value: 100,
          unit: '%',
          weight: 0.4
        }
      ],
      price_multiplier: 1.0,
      color: '#F59E0B',
      icon: '✓'
    },
    {
      id: 'grade_c',
      name: 'Grade C',
      code: 'C',
      description: 'Basic quality for processing',
      criteria: [
        {
          id: 'moisture',
          name: 'Moisture Content',
          description: 'Higher moisture acceptable for processing',
          measurement_type: 'measurement',
          min_value: 12,
          max_value: 18,
          unit: '%',
          weight: 0.3
        },
        {
          id: 'appearance',
          name: 'Visual Appearance',
          description: 'Acceptable for processing despite defects',
          measurement_type: 'visual',
          acceptable_values: ['Fair', 'Poor'],
          weight: 0.3
        },
        {
          id: 'purity',
          name: 'Purity Level',
          description: 'Higher foreign matter acceptable',
          measurement_type: 'measurement',
          min_value: 85,
          max_value: 100,
          unit: '%',
          weight: 0.4
        }
      ],
      price_multiplier: 0.85,
      color: '#EF4444',
      icon: '⚠️'
    }
  ];

  const getSampleLots = (): ProductLot[] => [
    {
      id: '1',
      product_name: 'White Maize',
      quantity: 2000,
      unit: 'kg',
      farmer_id: 'farmer_001',
      farmer_name: 'John Mwangi',
      harvest_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: -1.2921,
        longitude: 36.8219,
        address: 'Kiambu County, Kenya'
      },
      images: ['lot1_img1.jpg', 'lot1_img2.jpg'],
      certificates: ['organic_cert.pdf'],
      status: 'pending',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      product_name: 'Yellow Maize',
      quantity: 1500,
      unit: 'kg',
      farmer_id: 'farmer_002',
      farmer_name: 'Mary Wanjiku',
      harvest_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: -0.0917,
        longitude: 34.7680,
        address: 'Kakamega County, Kenya'
      },
      quality_assessment: {
        id: 'assess_001',
        lot_id: '2',
        assessor_id: 'assessor_001',
        assessor_name: 'Dr. Peter Kamau',
        grade: getSampleGrades()[1], // Grade A
        criteria_scores: [
          {
            criteria_id: 'moisture',
            score: 85,
            notes: 'Moisture content at 14.2% - within acceptable range'
          },
          {
            criteria_id: 'appearance',
            score: 90,
            notes: 'Good color uniformity with minimal defects'
          },
          {
            criteria_id: 'purity',
            score: 95,
            notes: 'Very low foreign matter content'
          }
        ],
        overall_score: 90,
        final_grade: 'A',
        price_adjustment: 15,
        lab_results: {
          moisture_content: 14.2,
          protein_content: 8.5,
          aflatoxin_level: 2.1
        },
        assessment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Excellent quality maize suitable for export markets',
        status: 'approved'
      },
      images: ['lot2_img1.jpg', 'lot2_img2.jpg', 'lot2_img3.jpg'],
      certificates: [],
      status: 'graded',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const saveQualityData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'product_lots',
        type: 'marketplace' as any,
        data: productLots
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'quality_grades',
        type: 'marketplace' as any,
        data: qualityGrades
      });
    } catch (error) {
      console.error('Failed to save quality data:', error);
    }
  };

  const startGrading = (lot: ProductLot) => {
    setSelectedLot(lot);
    setCurrentAssessment({
      id: Date.now().toString(),
      lot_id: lot.id,
      assessor_id: 'current_user',
      assessor_name: 'Current User',
      criteria_scores: [],
      overall_score: 0,
      final_grade: '',
      price_adjustment: 0,
      assessment_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '',
      status: 'draft'
    });
    setShowGradingModal(true);
  };

  const updateCriteriaScore = (criteriaId: string, score: number, notes: string) => {
    const updatedScores = currentAssessment.criteria_scores || [];
    const existingIndex = updatedScores.findIndex(s => s.criteria_id === criteriaId);
    
    if (existingIndex >= 0) {
      updatedScores[existingIndex] = { criteria_id: criteriaId, score, notes };
    } else {
      updatedScores.push({ criteria_id: criteriaId, score, notes });
    }
    
    setCurrentAssessment({
      ...currentAssessment,
      criteria_scores: updatedScores
    });
  };

  const calculateOverallScore = () => {
    if (!currentAssessment.criteria_scores || !selectedLot) return 0;
    
    const grade = qualityGrades.find(g => g.id === 'grade_a'); // Default to Grade A criteria
    if (!grade) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    currentAssessment.criteria_scores.forEach(score => {
      const criteria = grade.criteria.find(c => c.id === score.criteria_id);
      if (criteria) {
        totalWeightedScore += score.score * criteria.weight;
        totalWeight += criteria.weight;
      }
    });
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const determineGrade = (overallScore: number): QualityGrade => {
    if (overallScore >= 90) return qualityGrades.find(g => g.id === 'premium') || qualityGrades[0];
    if (overallScore >= 80) return qualityGrades.find(g => g.id === 'grade_a') || qualityGrades[1];
    if (overallScore >= 70) return qualityGrades.find(g => g.id === 'grade_b') || qualityGrades[2];
    return qualityGrades.find(g => g.id === 'grade_c') || qualityGrades[3];
  };

  const submitAssessment = async () => {
    if (!selectedLot || !currentAssessment.criteria_scores || currentAssessment.criteria_scores.length === 0) {
      Alert.alert('Error', 'Please complete all criteria assessments');
      return;
    }
    
    const overallScore = calculateOverallScore();
    const finalGrade = determineGrade(overallScore);
    const priceAdjustment = (finalGrade.price_multiplier - 1) * 100;
    
    const completedAssessment: QualityAssessment = {
      ...currentAssessment as QualityAssessment,
      grade: finalGrade,
      overall_score: overallScore,
      final_grade: finalGrade.code,
      price_adjustment: priceAdjustment,
      status: 'submitted'
    };
    
    const updatedLots = productLots.map(lot => {
      if (lot.id === selectedLot.id) {
        return {
          ...lot,
          quality_assessment: completedAssessment,
          status: 'graded' as const,
          updated_at: new Date().toISOString()
        };
      }
      return lot;
    });
    
    setProductLots(updatedLots);
    await saveQualityData();
    
    setShowGradingModal(false);
    setSelectedLot(null);
    setCurrentAssessment({});
    
    Alert.alert(
      'Assessment Complete',
      `Lot graded as ${finalGrade.name} (${finalGrade.code}) with ${priceAdjustment > 0 ? '+' : ''}${priceAdjustment.toFixed(1)}% price adjustment`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return '#22C55E';
      case 'certified': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return '✅';
      case 'certified': return '🏆';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📦';
    }
  };

  const filteredLots = productLots.filter(lot => {
    const matchesSearch = lot.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lot.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || 
                        (lot.quality_assessment && lot.quality_assessment.final_grade === filterGrade);
    return matchesSearch && matchesGrade;
  });

  const renderLots = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search lots..."
          placeholderTextColor="#9CA3AF"
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeFilters}>
          <TouchableOpacity
            style={[styles.gradeFilter, filterGrade === 'all' && styles.gradeFilterActive]}
            onPress={() => setFilterGrade('all')}
          >
            <Text style={[styles.gradeFilterText, filterGrade === 'all' && styles.gradeFilterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          {qualityGrades.map(grade => (
            <TouchableOpacity
              key={grade.id}
              style={[styles.gradeFilter, filterGrade === grade.code && styles.gradeFilterActive]}
              onPress={() => setFilterGrade(grade.code)}
            >
              <Text style={[styles.gradeFilterText, filterGrade === grade.code && styles.gradeFilterTextActive]}>
                {grade.icon} {grade.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredLots.map(lot => (
        <View key={lot.id} style={styles.lotCard}>
          <View style={styles.lotHeader}>
            <Text style={styles.lotTitle}>{lot.product_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lot.status) }]}>
              <Text style={styles.statusBadgeText}>
                {getStatusIcon(lot.status)} {lot.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.lotDetails}>
            <Text style={styles.lotDetail}>Farmer: {lot.farmer_name}</Text>
            <Text style={styles.lotDetail}>Quantity: {lot.quantity} {lot.unit}</Text>
            <Text style={styles.lotDetail}>Harvest: {new Date(lot.harvest_date).toLocaleDateString()}</Text>
            <Text style={styles.lotDetail}>Location: {lot.location.address}</Text>
          </View>
          
          {lot.quality_assessment && (
            <View style={styles.gradeInfo}>
              <View style={styles.gradeHeader}>
                <Text style={styles.gradeTitle}>Quality Assessment</Text>
                <View style={[styles.gradeBadge, { backgroundColor: lot.quality_assessment.grade.color }]}>
                  <Text style={styles.gradeBadgeText}>
                    {lot.quality_assessment.grade.icon} {lot.quality_assessment.final_grade}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.gradeScore}>
                Overall Score: {lot.quality_assessment.overall_score.toFixed(1)}/100
              </Text>
              <Text style={styles.priceAdjustment}>
                Price Adjustment: {lot.quality_assessment.price_adjustment > 0 ? '+' : ''}{lot.quality_assessment.price_adjustment.toFixed(1)}%
              </Text>
              <Text style={styles.assessor}>
                Assessed by: {lot.quality_assessment.assessor_name}
              </Text>
              
              {lot.quality_assessment.lab_results && (
                <View style={styles.labResults}>
                  <Text style={styles.labResultsTitle}>Lab Results:</Text>
                  {lot.quality_assessment.lab_results.moisture_content && (
                    <Text style={styles.labResult}>
                      Moisture: {lot.quality_assessment.lab_results.moisture_content}%
                    </Text>
                  )}
                  {lot.quality_assessment.lab_results.protein_content && (
                    <Text style={styles.labResult}>
                      Protein: {lot.quality_assessment.lab_results.protein_content}%
                    </Text>
                  )}
                  {lot.quality_assessment.lab_results.aflatoxin_level && (
                    <Text style={styles.labResult}>
                      Aflatoxin: {lot.quality_assessment.lab_results.aflatoxin_level} ppb
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
          
          <View style={styles.lotActions}>
            {lot.status === 'pending' && (
              <TouchableOpacity
                style={styles.gradeButton}
                onPress={() => startGrading(lot)}
              >
                <Text style={styles.gradeButtonText}>Start Grading</Text>
              </TouchableOpacity>
            )}
            
            {lot.status === 'graded' && (
              <TouchableOpacity style={styles.certificateButton}>
                <Text style={styles.certificateButtonText}>Generate Certificate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderGradingModal = () => (
    <Modal
      visible={showGradingModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowGradingModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Quality Assessment</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowGradingModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedLot && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.lotSummary}>
              <Text style={styles.lotSummaryTitle}>{selectedLot.product_name}</Text>
              <Text style={styles.lotSummaryDetail}>Farmer: {selectedLot.farmer_name}</Text>
              <Text style={styles.lotSummaryDetail}>Quantity: {selectedLot.quantity} {selectedLot.unit}</Text>
            </View>

            <View style={styles.criteriaContainer}>
              <Text style={styles.criteriaTitle}>Assessment Criteria</Text>
              
              {qualityGrades[1]?.criteria.map(criteria => {
                const currentScore = currentAssessment.criteria_scores?.find(s => s.criteria_id === criteria.id);
                
                return (
                  <View key={criteria.id} style={styles.criteriaCard}>
                    <Text style={styles.criteriaName}>{criteria.name}</Text>
                    <Text style={styles.criteriaDescription}>{criteria.description}</Text>
                    
                    {criteria.measurement_type === 'measurement' && (
                      <View style={styles.measurementContainer}>
                        <Text style={styles.measurementRange}>
                          Range: {criteria.min_value} - {criteria.max_value} {criteria.unit}
                        </Text>
                        <TextInput
                          style={styles.scoreInput}
                          value={currentScore?.score.toString() || ''}
                          onChangeText={(text) => {
                            const score = parseFloat(text) || 0;
                            updateCriteriaScore(criteria.id, score, currentScore?.notes || '');
                          }}
                          placeholder="Score (0-100)"
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                    
                    {criteria.measurement_type === 'visual' && (
                      <View style={styles.visualContainer}>
                        <Text style={styles.acceptableValues}>
                          Acceptable: {criteria.acceptable_values?.join(', ')}
                        </Text>
                        <TextInput
                          style={styles.scoreInput}
                          value={currentScore?.score.toString() || ''}
                          onChangeText={(text) => {
                            const score = parseFloat(text) || 0;
                            updateCriteriaScore(criteria.id, score, currentScore?.notes || '');
                          }}
                          placeholder="Score (0-100)"
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                    
                    <TextInput
                      style={styles.notesInput}
                      value={currentScore?.notes || ''}
                      onChangeText={(text) => {
                        updateCriteriaScore(criteria.id, currentScore?.score || 0, text);
                      }}
                      placeholder="Assessment notes..."
                      multiline
                      numberOfLines={2}
                    />
                    
                    <Text style={styles.criteriaWeight}>
                      Weight: {(criteria.weight * 100).toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.assessmentSummary}>
              <Text style={styles.assessmentSummaryTitle}>Assessment Summary</Text>
              <Text style={styles.overallScore}>
                Overall Score: {calculateOverallScore().toFixed(1)}/100
              </Text>
              
              {calculateOverallScore() > 0 && (
                <View style={styles.predictedGrade}>
                  <Text style={styles.predictedGradeTitle}>Predicted Grade:</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: determineGrade(calculateOverallScore()).color }]}>
                    <Text style={styles.gradeBadgeText}>
                      {determineGrade(calculateOverallScore()).icon} {determineGrade(calculateOverallScore()).code}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.assessmentNotes}>
              <Text style={styles.assessmentNotesTitle}>Additional Notes</Text>
              <TextInput
                style={styles.assessmentNotesInput}
                value={currentAssessment.notes || ''}
                onChangeText={(text) => setCurrentAssessment({...currentAssessment, notes: text})}
                placeholder="Enter any additional observations or notes..."
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitAssessment}>
              <Text style={styles.submitButtonText}>Submit Assessment</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderStandards = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Quality Standards</Text>
      
      {qualityGrades.map(grade => (
        <View key={grade.id} style={styles.standardCard}>
          <View style={styles.standardHeader}>
            <Text style={styles.standardTitle}>
              {grade.icon} {grade.name} ({grade.code})
            </Text>
            <View style={[styles.multiplierBadge, { backgroundColor: grade.color }]}>
              <Text style={styles.multiplierBadgeText}>
                {grade.price_multiplier}x
              </Text>
            </View>
          </View>
          
          <Text style={styles.standardDescription}>{grade.description}</Text>
          
          <View style={styles.criteriaList}>
            <Text style={styles.criteriaListTitle}>Criteria:</Text>
            {grade.criteria.map(criteria => (
              <View key={criteria.id} style={styles.criteriaListItem}>
                <Text style={styles.criteriaListName}>{criteria.name}</Text>
                <Text style={styles.criteriaListDescription}>{criteria.description}</Text>
                
                {criteria.measurement_type === 'measurement' && (
                  <Text style={styles.criteriaListRange}>
                    Range: {criteria.min_value} - {criteria.max_value} {criteria.unit}
                  </Text>
                )}
                
                {criteria.measurement_type === 'visual' && (
                  <Text style={styles.criteriaListValues}>
                    Acceptable: {criteria.acceptable_values?.join(', ')}
                  </Text>
                )}
                
                <Text style={styles.criteriaListWeight}>
                  Weight: {(criteria.weight * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quality Grading System</Text>
        <Text style={styles.subtitle}>Professional quality assessment & certification</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lots' && styles.activeTab]}
          onPress={() => setActiveTab('lots')}
        >
          <Text style={[styles.tabText, activeTab === 'lots' && styles.activeTabText]}>
            Lots ({filteredLots.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'standards' && styles.activeTab]}
          onPress={() => setActiveTab('standards')}
        >
          <Text style={[styles.tabText, activeTab === 'standards' && styles.activeTabText]}>
            Standards
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'lots' && renderLots()}
      {activeTab === 'standards' && renderStandards()}

      {renderGradingModal()}
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
  gradeFilters: {
    flexDirection: 'row',
  },
  gradeFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gradeFilterActive: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  gradeFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  gradeFilterTextActive: {
    color: 'white',
  },
  lotCard: {
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
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lotTitle: {
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
  lotDetails: {
    marginBottom: 16,
  },
  lotDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gradeInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradeScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#228B22',
    marginBottom: 4,
  },
  priceAdjustment: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  assessor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  labResults: {
    marginTop: 8,
  },
  labResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  labResult: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  lotActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  gradeButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  gradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  certificateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  certificateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  standardCard: {
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
  standardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  standardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  multiplierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multiplierBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  standardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  criteriaList: {
    marginTop: 8,
  },
  criteriaListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  criteriaListItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  criteriaListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  criteriaListDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  criteriaListRange: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  criteriaListValues: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  criteriaListWeight: {
    fontSize: 12,
    color: '#F59E0B',
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
  lotSummary: {
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
  lotSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  lotSummaryDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  criteriaContainer: {
    marginBottom: 16,
  },
  criteriaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  criteriaCard: {
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
  criteriaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  criteriaDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  measurementContainer: {
    marginBottom: 12,
  },
  measurementRange: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
  },
  visualContainer: {
    marginBottom: 12,
  },
  acceptableValues: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
  },
  scoreInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  criteriaWeight: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  assessmentSummary: {
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
  assessmentSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  overallScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 12,
  },
  predictedGrade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictedGradeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  assessmentNotes: {
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
  assessmentNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  assessmentNotesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QualityGradingSystem;
