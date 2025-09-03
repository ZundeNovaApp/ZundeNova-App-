import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface AdaptiveLearningProps {
  farmerId: string;
  onProgressUpdate: (progress: any) => void;
}

export default function AdaptiveLearning({ farmerId, onProgressUpdate }: AdaptiveLearningProps) {
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    initializeLearningPath();
    loadProgress();
  }, [farmerId]);

  const initializeLearningPath = async () => {
    const mockLearningPath = [
      {
        id: 'module_1',
        title: 'Soil Health Fundamentals',
        description: 'Learn about soil composition, pH, and nutrient management',
        difficulty: 'beginner',
        estimatedTime: 30,
        prerequisites: [],
        topics: ['Soil Types', 'pH Testing', 'Nutrient Deficiency', 'Organic Matter'],
        status: 'available'
      },
      {
        id: 'module_2',
        title: 'Crop Rotation Strategies',
        description: 'Master sustainable farming through effective crop rotation',
        difficulty: 'intermediate',
        estimatedTime: 45,
        prerequisites: ['module_1'],
        topics: ['Rotation Planning', 'Nitrogen Fixation', 'Pest Management', 'Yield Optimization'],
        status: 'locked'
      },
      {
        id: 'module_3',
        title: 'Integrated Pest Management',
        description: 'Advanced techniques for sustainable pest control',
        difficulty: 'advanced',
        estimatedTime: 60,
        prerequisites: ['module_1', 'module_2'],
        topics: ['Biological Control', 'Chemical Application', 'Monitoring Systems', 'Resistance Management'],
        status: 'locked'
      },
      {
        id: 'module_4',
        title: 'Climate-Smart Agriculture',
        description: 'Adapt your farming practices to climate change',
        difficulty: 'intermediate',
        estimatedTime: 50,
        prerequisites: ['module_1'],
        topics: ['Weather Patterns', 'Drought Resistance', 'Water Conservation', 'Carbon Sequestration'],
        status: 'locked'
      }
    ];

    setLearningPath(mockLearningPath);
    setCurrentModule(mockLearningPath[0]);
  };

  const loadProgress = async () => {
    const mockProgress = {
      farmerId,
      completedModules: [],
      currentModule: 'module_1',
      totalScore: 0,
      skillLevel: 'beginner',
      learningStreak: 3,
      timeSpent: 120,
      badges: [],
      adaptiveRecommendations: [
        'Focus on practical soil testing techniques',
        'Review pH management concepts',
        'Practice nutrient calculation exercises'
      ]
    };

    setProgress(mockProgress);
    onProgressUpdate(mockProgress);
  };

  const startModule = async (moduleId: string) => {
    const module = learningPath.find(m => m.id === moduleId);
    if (!module || module.status === 'locked') {
      Alert.alert('Module Locked', 'Complete prerequisite modules first');
      return;
    }

    setCurrentModule(module);
    
    await offlineStorageService.storeOfflineData({
      id: `learning_start_${Date.now()}`,
      type: 'farm',
      data: {
        farmerId,
        moduleId,
        startedAt: new Date()
      }
    });
  };

  const completeModule = async (moduleId: string, score: number) => {
    const updatedProgress = {
      ...progress,
      completedModules: [...progress.completedModules, moduleId],
      totalScore: progress.totalScore + score,
      timeSpent: progress.timeSpent + currentModule.estimatedTime
    };

    const updatedPath = learningPath.map(module => {
      if (module.id === moduleId) {
        return { ...module, status: 'completed', score };
      }
      
      const prereqsMet = module.prerequisites.every(prereq => 
        updatedProgress.completedModules.includes(prereq)
      );
      if (prereqsMet && module.status === 'locked') {
        return { ...module, status: 'available' };
      }
      
      return module;
    });

    setProgress(updatedProgress);
    setLearningPath(updatedPath);
    onProgressUpdate(updatedProgress);

    await offlineStorageService.storeOfflineData({
      id: `learning_complete_${Date.now()}`,
      type: 'farm',
      data: {
        farmerId,
        moduleId,
        score,
        completedAt: new Date()
      }
    });

    if (score >= 80) {
      Alert.alert('Excellent!', `You scored ${score}% and unlocked new modules!`);
    } else if (score >= 60) {
      Alert.alert('Good Job!', `You scored ${score}%. Consider reviewing the material.`);
    } else {
      Alert.alert('Keep Learning!', `You scored ${score}%. Please retake this module.`);
    }
  };

  const startAssessment = () => {
    const mockAssessment = {
      id: 'assessment_1',
      moduleId: currentModule.id,
      questions: [
        {
          id: 'q1',
          question: 'What is the ideal pH range for most crops?',
          options: ['5.0-5.5', '6.0-7.0', '7.5-8.0', '8.5-9.0'],
          correct: 1
        },
        {
          id: 'q2',
          question: 'Which nutrient is most commonly deficient in soils?',
          options: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium'],
          correct: 0
        },
        {
          id: 'q3',
          question: 'How often should soil pH be tested?',
          options: ['Monthly', 'Every 6 months', 'Annually', 'Every 3 years'],
          correct: 2
        }
      ],
      currentQuestion: 0,
      answers: [],
      score: 0
    };

    setAssessment(mockAssessment);
  };

  const answerQuestion = (answerIndex: number) => {
    if (!assessment) return;

    const updatedAnswers = [...assessment.answers, answerIndex];
    const isCorrect = answerIndex === assessment.questions[assessment.currentQuestion].correct;
    const updatedScore = assessment.score + (isCorrect ? 1 : 0);

    if (assessment.currentQuestion < assessment.questions.length - 1) {
      setAssessment({
        ...assessment,
        currentQuestion: assessment.currentQuestion + 1,
        answers: updatedAnswers,
        score: updatedScore
      });
    } else {
      const finalScore = Math.round((updatedScore / assessment.questions.length) * 100);
      completeModule(currentModule.id, finalScore);
      setAssessment(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'locked': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (assessment) {
    const currentQ = assessment.questions[assessment.currentQuestion];
    return (
      <View style={styles.assessmentContainer}>
        <Text style={styles.assessmentTitle}>Module Assessment</Text>
        <Text style={styles.questionProgress}>
          Question {assessment.currentQuestion + 1} of {assessment.questions.length}
        </Text>
        
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => answerQuestion(index)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Adaptive Learning</Text>
      
      {progress && (
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.completedModules.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.learningStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.timeSpent}m</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
          </View>
          
          <Text style={styles.skillLevel}>Skill Level: {progress.skillLevel}</Text>
          
          <View style={styles.recommendations}>
            <Text style={styles.recommendationsTitle}>Personalized Recommendations:</Text>
            {progress.adaptiveRecommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.modulesCard}>
        <Text style={styles.cardTitle}>Learning Modules</Text>
        
        {learningPath.map(module => (
          <View key={module.id} style={styles.moduleItem}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <View style={styles.moduleBadges}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty) }]}>
                  <Text style={styles.badgeText}>{module.difficulty}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(module.status) }]}>
                  <Text style={styles.badgeText}>{module.status}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.moduleDescription}>{module.description}</Text>
            
            <View style={styles.moduleDetails}>
              <Text style={styles.moduleTime}>⏱️ {module.estimatedTime} min</Text>
              <Text style={styles.moduleTopics}>
                📚 {module.topics.length} topics
              </Text>
            </View>

            <View style={styles.moduleTopicsList}>
              {module.topics.map((topic, index) => (
                <Text key={index} style={styles.topicItem}>• {topic}</Text>
              ))}
            </View>

            {module.status === 'available' && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => startModule(module.id)}
              >
                <Text style={styles.startButtonText}>Start Module</Text>
              </TouchableOpacity>
            )}

            {module.status === 'completed' && (
              <View style={styles.completedIndicator}>
                <Text style={styles.completedText}>✅ Completed - Score: {module.score}%</Text>
              </View>
            )}

            {module.status === 'locked' && (
              <View style={styles.lockedIndicator}>
                <Text style={styles.lockedText}>🔒 Complete prerequisites first</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {currentModule && currentModule.status === 'available' && (
        <View style={styles.currentModuleCard}>
          <Text style={styles.cardTitle}>Current Module: {currentModule.title}</Text>
          <Text style={styles.moduleDescription}>{currentModule.description}</Text>
          
          <TouchableOpacity style={styles.assessmentButton} onPress={startAssessment}>
            <Text style={styles.assessmentButtonText}>Take Assessment</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  skillLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  recommendations: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  modulesCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  moduleItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  moduleBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  moduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moduleTime: {
    fontSize: 12,
    color: '#666',
  },
  moduleTopics: {
    fontSize: 12,
    color: '#666',
  },
  moduleTopicsList: {
    marginBottom: 15,
  },
  topicItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  startButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  lockedIndicator: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  lockedText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  currentModuleCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  assessmentButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  assessmentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assessmentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  assessmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionProgress: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
