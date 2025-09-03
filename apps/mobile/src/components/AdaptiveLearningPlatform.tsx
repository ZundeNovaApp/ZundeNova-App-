import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ProgressBarAndroid } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  prerequisites: string[];
  learning_objectives: string[];
  content_type: 'video' | 'text' | 'interactive' | 'quiz' | 'simulation';
  content_url?: string;
  content_data?: any;
  tags: string[];
  language: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  rating: {
    average: number;
    count: number;
  };
  completion_rate: number;
  adaptive_rules: AdaptiveRule[];
}

interface AdaptiveRule {
  id: string;
  condition: string;
  action: 'skip_module' | 'recommend_module' | 'adjust_difficulty' | 'provide_support';
  parameters: {
    [key: string]: any;
  };
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  target_audience: string[];
  modules: string[];
  estimated_total_duration: number;
  difficulty_progression: string[];
  completion_criteria: {
    minimum_score: number;
    required_modules: string[];
    optional_modules: string[];
  };
  adaptive_sequencing: boolean;
  created_by: string;
  created_at: string;
  status: 'active' | 'inactive';
}

interface UserProgress {
  user_id: string;
  module_id: string;
  path_id?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
  time_spent_minutes: number;
  attempts: number;
  best_score?: number;
  current_score?: number;
  started_at: string;
  completed_at?: string;
  last_accessed: string;
  bookmarks: string[];
  notes: string;
  performance_data: {
    [key: string]: any;
  };
}

interface Assessment {
  id: string;
  module_id: string;
  title: string;
  type: 'quiz' | 'practical' | 'project' | 'peer_review';
  questions: AssessmentQuestion[];
  passing_score: number;
  max_attempts: number;
  time_limit_minutes?: number;
  adaptive_difficulty: boolean;
  feedback_immediate: boolean;
  created_at: string;
}

interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'practical';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  difficulty_level: number;
  points: number;
  media_url?: string;
}

interface Certificate {
  id: string;
  user_id: string;
  module_id?: string;
  path_id?: string;
  title: string;
  description: string;
  issued_date: string;
  expiry_date?: string;
  certificate_url: string;
  verification_code: string;
  issuer: string;
  skills_validated: string[];
  blockchain_hash?: string;
}

export const AdaptiveLearningPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'paths' | 'progress' | 'certificates'>('modules');
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [currentUserId] = useState('user_001'); // Current user context

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      const modulesData = await offlineStorageService.getOfflineDataByType('learning_modules');
      const pathsData = await offlineStorageService.getOfflineDataByType('learning_paths');
      const progressData = await offlineStorageService.getOfflineDataByType('user_progress');
      const certificatesData = await offlineStorageService.getOfflineDataByType('certificates');
      
      if (modulesData.length > 0) {
        setModules(modulesData[0].data);
      } else {
        setModules(getSampleModules());
      }
      
      if (pathsData.length > 0) {
        setLearningPaths(pathsData[0].data);
      } else {
        setLearningPaths(getSampleLearningPaths());
      }
      
      if (progressData.length > 0) {
        setUserProgress(progressData[0].data);
      } else {
        setUserProgress(getSampleProgress());
      }
      
      if (certificatesData.length > 0) {
        setCertificates(certificatesData[0].data);
      } else {
        setCertificates(getSampleCertificates());
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
  };

  const getSampleModules = (): LearningModule[] => [
    {
      id: 'module_001',
      title: 'Introduction to Sustainable Farming',
      description: 'Learn the fundamentals of sustainable agricultural practices and their environmental benefits',
      category: 'Sustainable Agriculture',
      difficulty_level: 'beginner',
      estimated_duration_minutes: 45,
      prerequisites: [],
      learning_objectives: [
        'Understand principles of sustainable farming',
        'Identify sustainable practices for your farm',
        'Recognize environmental benefits',
        'Plan implementation strategies'
      ],
      content_type: 'video',
      content_url: 'https://example.com/sustainable-farming-intro.mp4',
      tags: ['sustainability', 'environment', 'farming', 'basics'],
      language: 'English',
      created_by: 'Dr. Sarah Green',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
      status: 'published',
      rating: {
        average: 4.7,
        count: 156
      },
      completion_rate: 87.3,
      adaptive_rules: [
        {
          id: 'rule_001',
          condition: 'user_experience < 1_year',
          action: 'provide_support',
          parameters: {
            support_type: 'glossary',
            additional_resources: true
          }
        }
      ]
    },
    {
      id: 'module_002',
      title: 'Crop Rotation Strategies',
      description: 'Master the art of crop rotation for improved soil health and increased yields',
      category: 'Crop Management',
      difficulty_level: 'intermediate',
      estimated_duration_minutes: 60,
      prerequisites: ['module_001'],
      learning_objectives: [
        'Design effective crop rotation plans',
        'Understand soil nutrient cycling',
        'Prevent pest and disease buildup',
        'Maximize land productivity'
      ],
      content_type: 'interactive',
      tags: ['crop rotation', 'soil health', 'planning', 'yields'],
      language: 'English',
      created_by: 'Prof. Michael Farm',
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
      status: 'published',
      rating: {
        average: 4.5,
        count: 98
      },
      completion_rate: 78.2,
      adaptive_rules: [
        {
          id: 'rule_002',
          condition: 'previous_score < 70',
          action: 'recommend_module',
          parameters: {
            recommended_module: 'module_001',
            reason: 'foundation_knowledge'
          }
        }
      ]
    },
    {
      id: 'module_003',
      title: 'Integrated Pest Management',
      description: 'Learn comprehensive IPM strategies to control pests while minimizing environmental impact',
      category: 'Pest Control',
      difficulty_level: 'advanced',
      estimated_duration_minutes: 90,
      prerequisites: ['module_001', 'module_002'],
      learning_objectives: [
        'Implement IPM decision-making process',
        'Identify beneficial insects and natural enemies',
        'Use economic thresholds for treatment decisions',
        'Combine biological, cultural, and chemical controls'
      ],
      content_type: 'simulation',
      tags: ['IPM', 'pest control', 'biological control', 'decision making'],
      language: 'English',
      created_by: 'Dr. Lisa Entomo',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-03-15T00:00:00Z',
      status: 'published',
      rating: {
        average: 4.8,
        count: 67
      },
      completion_rate: 65.4,
      adaptive_rules: [
        {
          id: 'rule_003',
          condition: 'user_farm_type = organic',
          action: 'adjust_difficulty',
          parameters: {
            focus_area: 'biological_controls',
            reduce_chemical_content: true
          }
        }
      ]
    },
    {
      id: 'module_004',
      title: 'Financial Planning for Farmers',
      description: 'Essential financial management skills for agricultural businesses',
      category: 'Farm Business',
      difficulty_level: 'intermediate',
      estimated_duration_minutes: 75,
      prerequisites: [],
      learning_objectives: [
        'Create farm budgets and cash flow projections',
        'Understand agricultural financing options',
        'Analyze profitability and cost structures',
        'Plan for seasonal variations and risks'
      ],
      content_type: 'text',
      tags: ['finance', 'budgeting', 'business planning', 'profitability'],
      language: 'English',
      created_by: 'CPA John Numbers',
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
      status: 'published',
      rating: {
        average: 4.4,
        count: 134
      },
      completion_rate: 82.1,
      adaptive_rules: []
    }
  ];

  const getSampleLearningPaths = (): LearningPath[] => [
    {
      id: 'path_001',
      name: 'Sustainable Farming Fundamentals',
      description: 'Complete learning path for farmers transitioning to sustainable practices',
      category: 'Sustainable Agriculture',
      target_audience: ['new_farmers', 'transitioning_farmers'],
      modules: ['module_001', 'module_002', 'module_003'],
      estimated_total_duration: 195,
      difficulty_progression: ['beginner', 'intermediate', 'advanced'],
      completion_criteria: {
        minimum_score: 75,
        required_modules: ['module_001', 'module_002'],
        optional_modules: ['module_003']
      },
      adaptive_sequencing: true,
      created_by: 'Learning Team',
      created_at: '2024-01-01T00:00:00Z',
      status: 'active'
    },
    {
      id: 'path_002',
      name: 'Farm Business Management',
      description: 'Comprehensive business skills for agricultural entrepreneurs',
      category: 'Farm Business',
      target_audience: ['farm_owners', 'agribusiness_managers'],
      modules: ['module_004'],
      estimated_total_duration: 75,
      difficulty_progression: ['intermediate'],
      completion_criteria: {
        minimum_score: 80,
        required_modules: ['module_004'],
        optional_modules: []
      },
      adaptive_sequencing: false,
      created_by: 'Business Team',
      created_at: '2024-02-01T00:00:00Z',
      status: 'active'
    }
  ];

  const getSampleProgress = (): UserProgress[] => [
    {
      user_id: 'user_001',
      module_id: 'module_001',
      path_id: 'path_001',
      status: 'completed',
      progress_percentage: 100,
      time_spent_minutes: 52,
      attempts: 1,
      best_score: 88,
      current_score: 88,
      started_at: '2024-03-01T10:00:00Z',
      completed_at: '2024-03-01T10:52:00Z',
      last_accessed: '2024-03-01T10:52:00Z',
      bookmarks: ['sustainable_practices_overview'],
      notes: 'Great introduction to sustainable farming concepts',
      performance_data: {
        quiz_scores: [85, 88],
        time_per_section: [15, 20, 17],
        engagement_score: 92
      }
    },
    {
      user_id: 'user_001',
      module_id: 'module_002',
      path_id: 'path_001',
      status: 'in_progress',
      progress_percentage: 65,
      time_spent_minutes: 35,
      attempts: 1,
      started_at: '2024-03-02T09:00:00Z',
      last_accessed: '2024-03-02T09:35:00Z',
      bookmarks: ['rotation_planning_tool'],
      notes: 'Need to review nitrogen-fixing crops section',
      performance_data: {
        sections_completed: 4,
        total_sections: 6,
        engagement_score: 78
      }
    }
  ];

  const getSampleCertificates = (): Certificate[] => [
    {
      id: 'cert_001',
      user_id: 'user_001',
      module_id: 'module_001',
      path_id: 'path_001',
      title: 'Sustainable Farming Fundamentals Certificate',
      description: 'Certified completion of sustainable farming basics course',
      issued_date: '2024-03-01T11:00:00Z',
      certificate_url: 'https://certificates.zundenova.com/cert_001.pdf',
      verification_code: 'ZN-SF-001-2024',
      issuer: 'ZundeNova Learning Platform',
      skills_validated: [
        'Sustainable farming principles',
        'Environmental impact assessment',
        'Implementation planning'
      ],
      blockchain_hash: '0x1234567890abcdef'
    }
  ];

  const saveLearningData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'learning_modules',
        type: 'marketplace' as any,
        data: modules
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'user_progress',
        type: 'marketplace' as any,
        data: userProgress
      });
    } catch (error) {
      console.error('Failed to save learning data:', error);
    }
  };

  const startModule = async (moduleId: string) => {
    const existingProgress = userProgress.find(p => p.user_id === currentUserId && p.module_id === moduleId);
    
    if (!existingProgress) {
      const newProgress: UserProgress = {
        user_id: currentUserId,
        module_id: moduleId,
        status: 'in_progress',
        progress_percentage: 0,
        time_spent_minutes: 0,
        attempts: 1,
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        bookmarks: [],
        notes: '',
        performance_data: {}
      };
      
      setUserProgress([...userProgress, newProgress]);
      await saveLearningData();
      Alert.alert('Success', 'Module started! Your progress will be tracked.');
    } else {
      Alert.alert('Info', 'You have already started this module. Continue from where you left off.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#22C55E';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'text': return '📖';
      case 'interactive': return '🎮';
      case 'quiz': return '❓';
      case 'simulation': return '🔬';
      default: return '📄';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#22C55E';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || module.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(modules.map(m => m.category))];

  const renderModules = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search learning modules..."
          placeholderTextColor="#9CA3AF"
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterCategory === 'all' && styles.filterActive]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterText, filterCategory === 'all' && styles.filterTextActive]}>
                All Categories
              </Text>
            </TouchableOpacity>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filter, filterCategory === category && styles.filterActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterText, filterCategory === category && styles.filterTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterDifficulty === 'all' && styles.filterActive]}
              onPress={() => setFilterDifficulty('all')}
            >
              <Text style={[styles.filterText, filterDifficulty === 'all' && styles.filterTextActive]}>
                All Levels
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterDifficulty === 'beginner' && styles.filterActive]}
              onPress={() => setFilterDifficulty('beginner')}
            >
              <Text style={[styles.filterText, filterDifficulty === 'beginner' && styles.filterTextActive]}>
                🟢 Beginner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterDifficulty === 'intermediate' && styles.filterActive]}
              onPress={() => setFilterDifficulty('intermediate')}
            >
              <Text style={[styles.filterText, filterDifficulty === 'intermediate' && styles.filterTextActive]}>
                🟡 Intermediate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, filterDifficulty === 'advanced' && styles.filterActive]}
              onPress={() => setFilterDifficulty('advanced')}
            >
              <Text style={[styles.filterText, filterDifficulty === 'advanced' && styles.filterTextActive]}>
                🔴 Advanced
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {filteredModules.map(module => {
        const progress = userProgress.find(p => p.user_id === currentUserId && p.module_id === module.id);
        
        return (
          <View key={module.id} style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{module.title}</Text>
                <Text style={styles.moduleCategory}>{module.category}</Text>
                <Text style={styles.moduleCreator}>by {module.created_by}</Text>
              </View>
              
              <View style={styles.moduleStatus}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty_level) }]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyIcon(module.difficulty_level)} {module.difficulty_level.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.contentTypeBadge}>
                  <Text style={styles.contentTypeText}>
                    {getContentTypeIcon(module.content_type)} {module.content_type}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.moduleDescription}>{module.description}</Text>

            <View style={styles.moduleDetails}>
              <View style={styles.moduleDetail}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{module.estimated_duration_minutes} min</Text>
              </View>
              
              <View style={styles.moduleDetail}>
                <Text style={styles.detailLabel}>Rating</Text>
                <Text style={styles.detailValue}>
                  ⭐ {module.rating.average.toFixed(1)} ({module.rating.count})
                </Text>
              </View>
              
              <View style={styles.moduleDetail}>
                <Text style={styles.detailLabel}>Completion</Text>
                <Text style={styles.detailValue}>{module.completion_rate.toFixed(1)}%</Text>
              </View>
            </View>

            {module.learning_objectives.length > 0 && (
              <View style={styles.objectivesContainer}>
                <Text style={styles.objectivesTitle}>Learning Objectives</Text>
                {module.learning_objectives.slice(0, 3).map((objective, index) => (
                  <Text key={index} style={styles.objective}>
                    • {objective}
                  </Text>
                ))}
                {module.learning_objectives.length > 3 && (
                  <Text style={styles.moreObjectives}>
                    +{module.learning_objectives.length - 3} more objectives
                  </Text>
                )}
              </View>
            )}

            {progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={[styles.progressPercentage, { color: getProgressColor(progress.progress_percentage) }]}>
                    {progress.progress_percentage}%
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progress.progress_percentage}%`,
                        backgroundColor: getProgressColor(progress.progress_percentage)
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.progressStats}>
                  <Text style={styles.progressStat}>
                    Status: {progress.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.progressStat}>
                    Time: {progress.time_spent_minutes} min
                  </Text>
                  {progress.best_score && (
                    <Text style={styles.progressStat}>
                      Best Score: {progress.best_score}%
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.moduleActions}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => startModule(module.id)}
              >
                <Text style={styles.startButtonText}>
                  {progress ? 'Continue' : 'Start Module'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  setSelectedModule(module);
                  setShowModuleModal(true);
                }}
              >
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bookmarkButton}>
                <Text style={styles.bookmarkButtonText}>📚</Text>
              </TouchableOpacity>
            </View>

            {module.prerequisites.length > 0 && (
              <View style={styles.prerequisitesContainer}>
                <Text style={styles.prerequisitesTitle}>Prerequisites</Text>
                <View style={styles.prerequisitesList}>
                  {module.prerequisites.map(prereqId => {
                    const prereqModule = modules.find(m => m.id === prereqId);
                    const prereqProgress = userProgress.find(p => p.user_id === currentUserId && p.module_id === prereqId);
                    const isCompleted = prereqProgress?.status === 'completed';
                    
                    return (
                      <View key={prereqId} style={[styles.prerequisite, isCompleted && styles.prerequisiteCompleted]}>
                        <Text style={[styles.prerequisiteText, isCompleted && styles.prerequisiteTextCompleted]}>
                          {isCompleted ? '✅' : '⏳'} {prereqModule?.title || prereqId}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  const renderProgress = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Learning Progress</Text>
      
      <View style={styles.progressSummary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{userProgress.filter(p => p.status === 'completed').length}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{userProgress.filter(p => p.status === 'in_progress').length}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {Math.round(userProgress.reduce((acc, p) => acc + p.time_spent_minutes, 0) / 60)}h
          </Text>
          <Text style={styles.summaryLabel}>Total Time</Text>
        </View>
      </View>

      {userProgress.filter(p => p.user_id === currentUserId).map(progress => {
        const module = modules.find(m => m.id === progress.module_id);
        if (!module) return null;
        
        return (
          <View key={progress.module_id} style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <Text style={styles.progressModuleName}>{module.title}</Text>
              <Text style={[styles.progressStatus, { color: getProgressColor(progress.progress_percentage) }]}>
                {progress.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.progress_percentage}%`,
                    backgroundColor: getProgressColor(progress.progress_percentage)
                  }
                ]} 
              />
            </View>
            
            <View style={styles.progressCardDetails}>
              <Text style={styles.progressDetail}>
                Progress: {progress.progress_percentage}%
              </Text>
              <Text style={styles.progressDetail}>
                Time Spent: {progress.time_spent_minutes} minutes
              </Text>
              {progress.best_score && (
                <Text style={styles.progressDetail}>
                  Best Score: {progress.best_score}%
                </Text>
              )}
              <Text style={styles.progressDetail}>
                Last Accessed: {new Date(progress.last_accessed).toLocaleDateString()}
              </Text>
            </View>
            
            {progress.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>Your Notes</Text>
                <Text style={styles.notesText}>{progress.notes}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  const renderCertificates = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Certificates</Text>
      
      {certificates.filter(c => c.user_id === currentUserId).map(certificate => (
        <View key={certificate.id} style={styles.certificateCard}>
          <View style={styles.certificateHeader}>
            <Text style={styles.certificateTitle}>{certificate.title}</Text>
            <View style={styles.certificateBadge}>
              <Text style={styles.certificateBadgeText}>🏆 CERTIFIED</Text>
            </View>
          </View>
          
          <Text style={styles.certificateDescription}>{certificate.description}</Text>
          
          <View style={styles.certificateDetails}>
            <Text style={styles.certificateDetail}>
              Issued: {new Date(certificate.issued_date).toLocaleDateString()}
            </Text>
            <Text style={styles.certificateDetail}>
              Issuer: {certificate.issuer}
            </Text>
            <Text style={styles.certificateDetail}>
              Verification: {certificate.verification_code}
            </Text>
          </View>
          
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsTitle}>Skills Validated</Text>
            <View style={styles.skillsList}>
              {certificate.skills_validated.map(skill => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.certificateActions}>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {certificates.filter(c => c.user_id === currentUserId).length === 0 && (
        <View style={styles.emptyCertificates}>
          <Text style={styles.emptyCertificatesText}>
            🎓 Complete learning modules to earn certificates!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderModuleModal = () => (
    <Modal
      visible={showModuleModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModuleModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Module Details</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModuleModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedModule && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.moduleDetailHeader}>
              <Text style={styles.moduleDetailName}>{selectedModule.title}</Text>
              <Text style={styles.moduleDetailCategory}>{selectedModule.category}</Text>
              <Text style={styles.moduleDetailCreator}>Created by {selectedModule.created_by}</Text>
            </View>

            <View style={styles.moduleDetailDescription}>
              <Text style={styles.moduleDetailDescriptionText}>
                {selectedModule.description}
              </Text>
            </View>

            <View style={styles.objectivesSection}>
              <Text style={styles.objectivesSectionTitle}>Learning Objectives</Text>
              {selectedModule.learning_objectives.map((objective, index) => (
                <Text key={index} style={styles.objectiveDetail}>
                  {index + 1}. {objective}
                </Text>
              ))}
            </View>

            <View style={styles.moduleMetadata}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Duration:</Text>
                <Text style={styles.metadataValue}>{selectedModule.estimated_duration_minutes} minutes</Text>
              </View>
              
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Difficulty:</Text>
                <Text style={styles.metadataValue}>
                  {getDifficultyIcon(selectedModule.difficulty_level)} {selectedModule.difficulty_level}
                </Text>
              </View>
              
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Content Type:</Text>
                <Text style={styles.metadataValue}>
                  {getContentTypeIcon(selectedModule.content_type)} {selectedModule.content_type}
                </Text>
              </View>
              
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Language:</Text>
                <Text style={styles.metadataValue}>{selectedModule.language}</Text>
              </View>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {selectedModule.tags.map(tag => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adaptive Learning Platform</Text>
        <Text style={styles.subtitle}>Personalized agricultural education</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'modules' && styles.activeTab]}
          onPress={() => setActiveTab('modules')}
        >
          <Text style={[styles.tabText, activeTab === 'modules' && styles.activeTabText]}>
            Modules ({filteredModules.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'certificates' && styles.activeTab]}
          onPress={() => setActiveTab('certificates')}
        >
          <Text style={[styles.tabText, activeTab === 'certificates' && styles.activeTabText]}>
            Certificates
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'modules' && renderModules()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'certificates' && renderCertificates()}

      {renderModuleModal()}
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
  moduleCard: {
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
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  moduleCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  moduleCreator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moduleStatus: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentTypeText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  moduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  moduleDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  objectivesContainer: {
    marginBottom: 16,
  },
  objectivesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  objective: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  moreObjectives: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  moduleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookmarkButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  bookmarkButtonText: {
    fontSize: 16,
  },
  prerequisitesContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  prerequisitesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prerequisite: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  prerequisiteCompleted: {
    backgroundColor: '#D1FAE5',
  },
  prerequisiteText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  prerequisiteTextCompleted: {
    color: '#059669',
  },
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressCard: {
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
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressModuleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  progressStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCardDetails: {
    marginTop: 12,
  },
  progressDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  certificateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  certificateBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificateBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  certificateDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  certificateDetails: {
    marginBottom: 16,
  },
  certificateDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  certificateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCertificates: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCertificatesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
  moduleDetailHeader: {
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
  moduleDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  moduleDetailCategory: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  moduleDetailCreator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  moduleDetailDescription: {
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
  moduleDetailDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  objectivesSection: {
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
  objectivesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  objectiveDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  moduleMetadata: {
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
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  tagsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default AdaptiveLearningPlatform;
