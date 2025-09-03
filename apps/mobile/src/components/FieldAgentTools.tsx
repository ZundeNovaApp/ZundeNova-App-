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
  FlatList,
} from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface FieldAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  specialization: string[];
  status: 'active' | 'inactive' | 'on_leave';
  performance_metrics: {
    visits_completed: number;
    farmers_onboarded: number;
    diagnoses_verified: number;
    sales_generated: number;
    points: number;
    level: number;
    badges: string[];
  };
  current_location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  assigned_farmers: string[];
  created_at: string;
  updated_at: string;
}

interface FieldVisit {
  id: string;
  agent_id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  visit_type: 'scheduled' | 'emergency' | 'follow_up' | 'onboarding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  purpose: string;
  notes: string;
  outcomes: string[];
  photos: string[];
  gps_verification: boolean;
  farmer_signature?: string;
  created_at: string;
  updated_at: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  category: 'farm_assessment' | 'market_research' | 'impact_evaluation' | 'training_feedback';
  questions: SurveyQuestion[];
  target_audience: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  deadline?: string;
}

interface SurveyQuestion {
  id: string;
  type: 'text' | 'number' | 'single_choice' | 'multiple_choice' | 'rating' | 'photo' | 'gps';
  question: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  skip_logic?: {
    condition: string;
    skip_to: string;
  };
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  agent_id: string;
  farmer_id: string;
  responses: { [questionId: string]: any };
  location: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  status: 'draft' | 'completed' | 'synced';
  started_at: string;
  completed_at?: string;
  synced_at?: string;
}

interface RouteOptimization {
  id: string;
  agent_id: string;
  date: string;
  visits: string[];
  optimized_order: string[];
  total_distance: number;
  estimated_duration: number;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
}

const FieldAgentTools: React.FC = () => {
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [routes, setRoutes] = useState<RouteOptimization[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'visits' | 'surveys' | 'routes' | 'leaderboard'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<FieldAgent | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [selectedSurvey, setSurvey] = useState<Survey | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentAgentId = 'agent_123';

  useEffect(() => {
    loadFieldAgentData();
  }, []);

  const loadFieldAgentData = async () => {
    try {
      setLoading(true);
      const agentsData = await offlineStorageService.getOfflineDataByType('field_agents').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleAgents()
      );
      const visitsData = await offlineStorageService.getOfflineDataByType('field_visits').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleVisits()
      );
      const surveysData = await offlineStorageService.getOfflineDataByType('surveys').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleSurveys()
      );
      const responsesData = await offlineStorageService.getOfflineDataByType('survey_responses').then(data => 
        data.length > 0 ? data.map(d => d.data) : []
      );
      const routesData = await offlineStorageService.getOfflineDataByType('route_optimizations').then(data => 
        data.length > 0 ? data.map(d => d.data) : []
      );
      
      setAgents(agentsData);
      setVisits(visitsData);
      setSurveys(surveysData);
      setResponses(responsesData);
      setRoutes(routesData);
    } catch (error) {
      console.error('Error loading field agent data:', error);
      setAgents(getSampleAgents());
      setVisits(getSampleVisits());
      setSurveys(getSampleSurveys());
      setResponses([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const getSampleAgents = (): FieldAgent[] => [
    {
      id: currentAgentId,
      name: 'John Mwangi',
      email: 'john.mwangi@zundenova.com',
      phone: '+254712345678',
      region: 'Central Kenya',
      specialization: ['Crop Diagnostics', 'Livestock Health', 'Soil Management'],
      status: 'active',
      performance_metrics: {
        visits_completed: 156,
        farmers_onboarded: 89,
        diagnoses_verified: 234,
        sales_generated: 12500,
        points: 2340,
        level: 7,
        badges: ['Top Performer', 'Diagnostic Expert', 'Community Builder']
      },
      current_location: {
        latitude: -1.2921,
        longitude: 36.8219,
        address: 'Nairobi, Kenya'
      },
      assigned_farmers: ['farmer_001', 'farmer_002', 'farmer_003'],
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-03-01T14:30:00Z'
    },
    {
      id: 'agent_002',
      name: 'Sarah Wanjiku',
      email: 'sarah.wanjiku@zundenova.com',
      phone: '+254723456789',
      region: 'Western Kenya',
      specialization: ['Market Linkages', 'Financial Services', 'Training'],
      status: 'active',
      performance_metrics: {
        visits_completed: 142,
        farmers_onboarded: 76,
        diagnoses_verified: 198,
        sales_generated: 10800,
        points: 2180,
        level: 6,
        badges: ['Market Expert', 'Financial Advisor']
      },
      assigned_farmers: ['farmer_004', 'farmer_005'],
      created_at: '2024-01-20T09:00:00Z',
      updated_at: '2024-03-01T16:45:00Z'
    }
  ];

  const getSampleVisits = (): FieldVisit[] => [
    {
      id: 'visit_001',
      agent_id: currentAgentId,
      farmer_id: 'farmer_001',
      farmer_name: 'Peter Kamau',
      farmer_location: {
        latitude: -1.3000,
        longitude: 36.8500,
        address: 'Kiambu, Kenya'
      },
      visit_type: 'scheduled',
      priority: 'high',
      status: 'planned',
      scheduled_date: '2024-03-15',
      scheduled_time: '09:00',
      purpose: 'Crop disease diagnosis and treatment recommendation',
      notes: 'Farmer reported yellowing leaves on maize crop',
      outcomes: [],
      photos: [],
      gps_verification: false,
      created_at: '2024-03-10T10:00:00Z',
      updated_at: '2024-03-10T10:00:00Z'
    },
    {
      id: 'visit_002',
      agent_id: currentAgentId,
      farmer_id: 'farmer_002',
      farmer_name: 'Mary Njeri',
      farmer_location: {
        latitude: -1.2800,
        longitude: 36.8300,
        address: 'Thika, Kenya'
      },
      visit_type: 'follow_up',
      priority: 'medium',
      status: 'completed',
      scheduled_date: '2024-03-12',
      scheduled_time: '14:00',
      actual_start_time: '14:15',
      actual_end_time: '15:30',
      purpose: 'Follow-up on fertilizer application and yield assessment',
      notes: 'Farmer successfully applied recommended fertilizer. Crop showing good improvement.',
      outcomes: ['Fertilizer applied correctly', 'Yield improvement observed', 'Farmer satisfied with results'],
      photos: ['photo_001.jpg', 'photo_002.jpg'],
      gps_verification: true,
      created_at: '2024-03-08T11:00:00Z',
      updated_at: '2024-03-12T15:30:00Z'
    }
  ];

  const getSampleSurveys = (): Survey[] => [
    {
      id: 'survey_001',
      title: 'Farm Assessment Survey',
      description: 'Comprehensive assessment of farm practices and needs',
      category: 'farm_assessment',
      questions: [
        {
          id: 'q1',
          type: 'text',
          question: 'What is the main crop grown on this farm?',
          required: true
        },
        {
          id: 'q2',
          type: 'number',
          question: 'What is the total farm size in acres?',
          required: true,
          validation: { min: 0.1, max: 1000 }
        },
        {
          id: 'q3',
          type: 'single_choice',
          question: 'What is the primary source of irrigation?',
          required: true,
          options: ['Rain-fed', 'Borehole', 'River/Stream', 'Drip irrigation', 'Other']
        },
        {
          id: 'q4',
          type: 'rating',
          question: 'Rate the farmer\'s knowledge of modern farming practices (1-5)',
          required: true,
          validation: { min: 1, max: 5 }
        },
        {
          id: 'q5',
          type: 'photo',
          question: 'Take a photo of the main crop field',
          required: false
        }
      ],
      target_audience: ['smallholder_farmers'],
      status: 'active',
      created_by: 'admin_001',
      created_at: '2024-03-01T08:00:00Z',
      deadline: '2024-03-31T23:59:59Z'
    }
  ];

  const saveFieldAgentData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'field_agents_data',
        type: 'field_agents' as any,
        data: agents
      });
      await offlineStorageService.storeOfflineData({
        id: 'field_visits_data',
        type: 'field_visits' as any,
        data: visits
      });
      await offlineStorageService.storeOfflineData({
        id: 'surveys_data',
        type: 'surveys' as any,
        data: surveys
      });
      await offlineStorageService.storeOfflineData({
        id: 'survey_responses_data',
        type: 'survey_responses' as any,
        data: responses
      });
    } catch (error) {
      console.error('Error saving field agent data:', error);
    }
  };

  const startVisit = async (visitId: string) => {
    const updatedVisits = visits.map(visit => 
      visit.id === visitId 
        ? { 
            ...visit, 
            status: 'in_progress' as const,
            actual_start_time: new Date().toISOString()
          }
        : visit
    );
    setVisits(updatedVisits);
    await saveFieldAgentData();
    Alert.alert('Visit Started', 'Visit has been marked as in progress');
  };

  const completeVisit = async (visitId: string, outcomes: string[], notes: string) => {
    const updatedVisits = visits.map(visit => 
      visit.id === visitId 
        ? { 
            ...visit, 
            status: 'completed' as const,
            actual_end_time: new Date().toISOString(),
            outcomes,
            notes
          }
        : visit
    );
    setVisits(updatedVisits);
    
    const updatedAgents = agents.map(agent => 
      agent.id === currentAgentId
        ? {
            ...agent,
            performance_metrics: {
              ...agent.performance_metrics,
              visits_completed: agent.performance_metrics.visits_completed + 1,
              points: agent.performance_metrics.points + 10
            }
          }
        : agent
    );
    setAgents(updatedAgents);
    
    await saveFieldAgentData();
    Alert.alert('Visit Completed', 'Visit has been marked as completed and points awarded');
  };

  const submitSurveyResponse = async (surveyId: string, surveyResponses: { [questionId: string]: any }) => {
    const newResponse: SurveyResponse = {
      id: `response_${Date.now()}`,
      survey_id: surveyId,
      agent_id: currentAgentId,
      farmer_id: 'current_farmer',
      responses: surveyResponses,
      location: {
        latitude: -1.2921,
        longitude: 36.8219
      },
      photos: [],
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    setResponses([...responses, newResponse]);
    await saveFieldAgentData();
    Alert.alert('Survey Submitted', 'Survey response has been saved offline');
  };

  const getCurrentAgent = () => agents.find(agent => agent.id === currentAgentId);
  const getTodayVisits = () => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter(visit => 
      visit.agent_id === currentAgentId && 
      visit.scheduled_date === today
    );
  };

  const getLeaderboard = () => {
    return agents
      .sort((a, b) => b.performance_metrics.points - a.performance_metrics.points)
      .map((agent, index) => ({ ...agent, rank: index + 1 }));
  };

  const renderDashboard = () => {
    const currentAgent = getCurrentAgent();
    const todayVisits = getTodayVisits();
    
    if (!currentAgent) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.agentCard}>
          <Text style={styles.agentName}>{currentAgent.name}</Text>
          <Text style={styles.agentRegion}>{currentAgent.region}</Text>
          <View style={styles.agentStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentAgent.performance_metrics.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Level {currentAgent.performance_metrics.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentAgent.performance_metrics.visits_completed}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesContainer}>
          <Text style={styles.sectionTitle}>Badges Earned</Text>
          <View style={styles.badgesList}>
            {currentAgent.performance_metrics.badges.map(badge => (
              <View key={badge} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.todayVisitsContainer}>
          <Text style={styles.sectionTitle}>Today's Visits ({todayVisits.length})</Text>
          {todayVisits.map(visit => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <Text style={styles.visitFarmer}>{visit.farmer_name}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(visit.priority) }]}>
                  <Text style={styles.priorityText}>{visit.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.visitTime}>{visit.scheduled_time}</Text>
              <Text style={styles.visitPurpose}>{visit.purpose}</Text>
              <View style={styles.visitActions}>
                {visit.status === 'planned' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => startVisit(visit.id)}
                  >
                    <Text style={styles.startButtonText}>Start Visit</Text>
                  </TouchableOpacity>
                )}
                {visit.status === 'in_progress' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => {
                      setSelectedVisit(visit);
                      setShowVisitModal(true);
                    }}
                  >
                    <Text style={styles.completeButtonText}>Complete Visit</Text>
                  </TouchableOpacity>
                )}
                {visit.status === 'completed' && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderLeaderboard = () => {
    const leaderboard = getLeaderboard();
    
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Agent Leaderboard</Text>
        {leaderboard.map(agent => (
          <View key={agent.id} style={styles.leaderboardCard}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>#{agent.rank}</Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.leaderboardName}>{agent.name}</Text>
              <Text style={styles.leaderboardRegion}>{agent.region}</Text>
            </View>
            <View style={styles.leaderboardStats}>
              <Text style={styles.leaderboardPoints}>{agent.performance_metrics.points} pts</Text>
              <Text style={styles.leaderboardLevel}>Level {agent.performance_metrics.level}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Agent Tools</Text>
        <Text style={styles.subtitle}>Manage visits, surveys & performance</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visits' && styles.activeTab]}
          onPress={() => setActiveTab('visits')}
        >
          <Text style={[styles.tabText, activeTab === 'visits' && styles.activeTabText]}>
            Visits ({getTodayVisits().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'surveys' && styles.activeTab]}
          onPress={() => setActiveTab('surveys')}
        >
          <Text style={[styles.tabText, activeTab === 'surveys' && styles.activeTabText]}>
            Surveys
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'leaderboard' && renderLeaderboard()}
      
      {(activeTab === 'visits' || activeTab === 'surveys') && (
        <View style={styles.tabContent}>
          <Text style={styles.emptyStateText}>
            {activeTab === 'visits' ? 'Visit management' : 'Survey management'} coming soon
          </Text>
        </View>
      )}
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
  agentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  agentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  agentRegion: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  agentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  badgesContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  todayVisitsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitFarmer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  visitTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  visitPurpose: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  startButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#228B22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  agentInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  leaderboardRegion: {
    fontSize: 14,
    color: '#6B7280',
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
    marginBottom: 4,
  },
  leaderboardLevel: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default FieldAgentTools;
