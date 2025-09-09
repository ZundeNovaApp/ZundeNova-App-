import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, Image } from 'react-native';
import { Video } from 'expo-av';
import { offlineStorageService } from '../services/OfflineStorageService';
import * as FileSystem from 'expo-file-system';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'crop_management' | 'livestock_care' | 'financial_literacy' | 'market_access' | 'climate_adaptation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  content: LearningContent[];
  quiz: Quiz;
  prerequisites: string[];
  language: string;
  downloadSize: number;
  isDownloaded: boolean;
}

interface LearningContent {
  id: string;
  type: 'video' | 'text' | 'image' | 'interactive' | 'audio';
  title: string;
  content: string;
  mediaUrl?: string;
  localPath?: string;
  downloadable: boolean;
  duration?: number;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface UserProgress {
  moduleId: string;
  contentProgress: Record<string, boolean>;
  quizScore?: number;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
}

export default function LearningPlatform({ userId }: { userId: string }) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [currentContent, setCurrentContent] = useState<LearningContent | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadLearningModules();
    loadUserProgress();
  }, [userId, language]);

  const loadLearningModules = async () => {
    try {
      const offlineModules = await offlineStorageService.getOfflineDataByType('learning_modules');
      
      if (offlineModules.length > 0) {
        setModules(offlineModules[0].data);
      } else {
        const defaultModules = await getDefaultLearningModules();
        setModules(defaultModules);
        
        await offlineStorageService.storeOfflineData({
          id: 'learning_modules',
          type: 'learning_modules',
          data: defaultModules
        });
      }
    } catch (error) {
      console.error('Failed to load learning modules:', error);
    }
  };

  const getDefaultLearningModules = async (): Promise<LearningModule[]> => {
    return [
      {
        id: 'maize_farming_basics',
        title: 'Maize Farming Fundamentals',
        description: 'Learn the basics of successful maize cultivation from soil preparation to harvest',
        category: 'crop_management',
        difficulty: 'beginner',
        duration: 45,
        language: language,
        downloadSize: 25.5,
        isDownloaded: false,
        prerequisites: [],
        content: [
          {
            id: 'soil_prep_video',
            type: 'video',
            title: 'Soil Preparation Techniques',
            content: 'Learn proper soil preparation methods for optimal maize growth',
            mediaUrl: 'https://content.zundenova.com/videos/soil_prep.mp4',
            downloadable: true,
            duration: 8
          },
          {
            id: 'seed_selection',
            type: 'interactive',
            title: 'Seed Variety Selection',
            content: 'Interactive guide to choosing the right maize varieties for your region',
            downloadable: false
          },
          {
            id: 'planting_guide',
            type: 'text',
            title: 'Planting Guidelines',
            content: `
# Maize Planting Guidelines

## Optimal Planting Time
- Plant at the beginning of the rainy season
- Soil temperature should be above 10°C
- Ensure adequate moisture for germination

## Planting Depth and Spacing
- Plant seeds 3-5cm deep
- Space rows 75cm apart
- Plant seeds 25cm apart within rows

## Seed Rate
- Use 20-25kg of seed per hectare
- Adjust based on seed size and variety
            `,
            downloadable: true
          },
          {
            id: 'fertilizer_application',
            type: 'image',
            title: 'Fertilizer Application Chart',
            content: 'Visual guide to fertilizer timing and application rates',
            mediaUrl: 'https://content.zundenova.com/images/fertilizer_chart.jpg',
            downloadable: true
          }
        ],
        quiz: {
          id: 'maize_basics_quiz',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              question: 'What is the optimal planting depth for maize seeds?',
              options: ['1-2 cm', '3-5 cm', '7-10 cm', '12-15 cm'],
              correct: 1,
              explanation: 'Maize seeds should be planted 3-5cm deep for optimal germination and root development.'
            },
            {
              id: 'q2',
              question: 'How far apart should maize rows be spaced?',
              options: ['50 cm', '60 cm', '75 cm', '90 cm'],
              correct: 2,
              explanation: 'Rows should be spaced 75cm apart to allow proper plant development and machinery access.'
            },
            {
              id: 'q3',
              question: 'When is the best time to plant maize?',
              options: ['Dry season', 'Beginning of rainy season', 'End of rainy season', 'Any time'],
              correct: 1,
              explanation: 'Plant at the beginning of the rainy season when soil moisture is adequate for germination.'
            }
          ]
        }
      },
      {
        id: 'livestock_health_basics',
        title: 'Basic Livestock Health Management',
        description: 'Essential knowledge for keeping your livestock healthy and productive',
        category: 'livestock_care',
        difficulty: 'beginner',
        duration: 35,
        language: language,
        downloadSize: 18.2,
        isDownloaded: false,
        prerequisites: [],
        content: [
          {
            id: 'health_signs_video',
            type: 'video',
            title: 'Recognizing Health Signs',
            content: 'Learn to identify signs of healthy and sick animals',
            mediaUrl: 'https://content.zundenova.com/videos/livestock_health.mp4',
            downloadable: true,
            duration: 12
          },
          {
            id: 'vaccination_schedule',
            type: 'text',
            title: 'Vaccination Schedule',
            content: `
# Livestock Vaccination Schedule

## Cattle
- FMD (Foot and Mouth Disease): Every 6 months
- Anthrax: Annually
- Blackleg: Annually for young cattle

## Goats and Sheep
- PPR (Peste des Petits Ruminants): Annually
- Anthrax: Annually
- Tetanus: As needed for wounds

## Poultry
- Newcastle Disease: Every 3-4 months
- Fowl Pox: Annually
- Infectious Bronchitis: Every 6 months
            `,
            downloadable: true
          },
          {
            id: 'nutrition_guide',
            type: 'interactive',
            title: 'Nutrition Calculator',
            content: 'Calculate nutritional requirements for different livestock',
            downloadable: false
          }
        ],
        quiz: {
          id: 'livestock_health_quiz',
          passingScore: 75,
          questions: [
            {
              id: 'q1',
              question: 'How often should cattle be vaccinated against FMD?',
              options: ['Every 3 months', 'Every 6 months', 'Annually', 'Every 2 years'],
              correct: 1,
              explanation: 'FMD vaccination should be done every 6 months for effective protection.'
            },
            {
              id: 'q2',
              question: 'What is a sign of a healthy animal?',
              options: ['Dull eyes', 'Bright, alert eyes', 'Labored breathing', 'Loss of appetite'],
              correct: 1,
              explanation: 'Bright, alert eyes are a key indicator of animal health and vitality.'
            }
          ]
        }
      },
      {
        id: 'financial_planning',
        title: 'Farm Financial Planning',
        description: 'Learn to manage farm finances, budgeting, and record keeping',
        category: 'financial_literacy',
        difficulty: 'intermediate',
        duration: 50,
        language: language,
        downloadSize: 15.8,
        isDownloaded: false,
        prerequisites: ['maize_farming_basics'],
        content: [
          {
            id: 'budgeting_basics',
            type: 'text',
            title: 'Farm Budgeting Basics',
            content: `
# Farm Financial Planning

## Creating a Farm Budget
1. List all expected income sources
2. Calculate all production costs
3. Include fixed costs (land, equipment)
4. Plan for unexpected expenses

## Record Keeping
- Track all income and expenses
- Keep receipts and invoices
- Monitor cash flow monthly
- Review and adjust quarterly
            `,
            downloadable: true
          },
          {
            id: 'cost_calculator',
            type: 'interactive',
            title: 'Production Cost Calculator',
            content: 'Interactive tool to calculate crop production costs',
            downloadable: false
          },
          {
            id: 'profit_analysis',
            type: 'video',
            title: 'Profit Analysis Techniques',
            content: 'Learn to analyze farm profitability and make informed decisions',
            mediaUrl: 'https://content.zundenova.com/videos/profit_analysis.mp4',
            downloadable: true,
            duration: 15
          }
        ],
        quiz: {
          id: 'financial_planning_quiz',
          passingScore: 80,
          questions: [
            {
              id: 'q1',
              question: 'What should be included in a farm budget?',
              options: ['Only income', 'Only expenses', 'Income and all costs', 'Just seed costs'],
              correct: 2,
              explanation: 'A complete farm budget includes all income sources and all production costs.'
            },
            {
              id: 'q2',
              question: 'How often should you review your farm budget?',
              options: ['Annually', 'Quarterly', 'Monthly', 'Weekly'],
              correct: 1,
              explanation: 'Quarterly reviews allow for timely adjustments while not being too frequent.'
            }
          ]
        }
      }
    ];
  };

  const loadUserProgress = async () => {
    try {
      const progressData = await offlineStorageService.getOfflineDataByType('learning_progress');
      const userProgressData = progressData.filter(data => data.data.userId === userId);
      
      const progressMap: Record<string, UserProgress> = {};
      userProgressData.forEach(data => {
        progressMap[data.data.moduleId] = data.data;
      });
      
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const downloadModule = async (module: LearningModule) => {
    try {
      setDownloadProgress({ ...downloadProgress, [module.id]: 0 });
      
      const downloadableContent = module.content.filter(content => content.downloadable && content.mediaUrl);
      let completed = 0;
      
      for (const content of downloadableContent) {
        if (content.mediaUrl) {
          const fileName = `${module.id}_${content.id}.${content.type === 'video' ? 'mp4' : 'jpg'}`;
          const localPath = `${FileSystem.documentDirectory}learning/${fileName}`;
          
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}learning/`, { intermediates: true });
          
          const downloadResult = await FileSystem.downloadAsync(content.mediaUrl, localPath);
          
          if (downloadResult.status === 200) {
            content.localPath = localPath;
            completed++;
            setDownloadProgress({ 
              ...downloadProgress, 
              [module.id]: (completed / downloadableContent.length) * 100 
            });
          }
        }
      }
      
      const updatedModule = { ...module, isDownloaded: true };
      const updatedModules = modules.map(m => m.id === module.id ? updatedModule : m);
      setModules(updatedModules);
      
      await offlineStorageService.storeOfflineData({
        id: 'learning_modules',
        type: 'learning_modules',
        data: updatedModules
      });
      
      setDownloadProgress({ ...downloadProgress, [module.id]: 100 });
      Alert.alert('Download Complete', `${module.title} is now available offline!`);
      
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'Please check your internet connection and try again.');
    }
  };

  const startModule = (module: LearningModule) => {
    setSelectedModule(module);
    if (module.content.length > 0) {
      setCurrentContent(module.content[0]);
    }
  };

  const completeContent = async (contentId: string) => {
    if (!selectedModule) return;
    
    const moduleProgress = progress[selectedModule.id] || {
      moduleId: selectedModule.id,
      contentProgress: {},
      completed: false,
      timeSpent: 0
    };
    
    moduleProgress.contentProgress[contentId] = true;
    moduleProgress.timeSpent += 5; // Add 5 minutes for each content piece
    
    const allContentCompleted = selectedModule.content.every(
      content => moduleProgress.contentProgress[content.id]
    );
    
    if (allContentCompleted && !moduleProgress.quizScore) {
      setShowQuiz(true);
    }
    
    const updatedProgress = { ...progress, [selectedModule.id]: moduleProgress };
    setProgress(updatedProgress);
    
    await offlineStorageService.storeOfflineData({
      id: `progress_${userId}_${selectedModule.id}`,
      type: 'learning_progress',
      data: { ...moduleProgress, userId }
    });
  };

  const submitQuiz = async () => {
    if (!selectedModule) return;
    
    const quiz = selectedModule.quiz;
    let correctAnswers = 0;
    
    quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correct) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;
    
    const moduleProgress = progress[selectedModule.id] || {
      moduleId: selectedModule.id,
      contentProgress: {},
      completed: false,
      timeSpent: 0
    };
    
    moduleProgress.quizScore = score;
    moduleProgress.completed = passed;
    
    if (passed) {
      moduleProgress.completedAt = new Date().toISOString();
      
      Alert.alert(
        '🎉 Module Completed!',
        `Congratulations! You scored ${score.toFixed(1)}% and completed "${selectedModule.title}"`,
        [{ text: 'Great!', onPress: () => setSelectedModule(null) }]
      );
    } else {
      Alert.alert(
        'Quiz Not Passed',
        `You scored ${score.toFixed(1)}%. You need ${quiz.passingScore}% to pass. Review the content and try again.`,
        [{ text: 'OK', onPress: () => setShowQuiz(false) }]
      );
    }
    
    const updatedProgress = { ...progress, [selectedModule.id]: moduleProgress };
    setProgress(updatedProgress);
    
    await offlineStorageService.storeOfflineData({
      id: `progress_${userId}_${selectedModule.id}`,
      type: 'learning_progress',
      data: { ...moduleProgress, userId }
    });
    
    setShowQuiz(false);
    setQuizAnswers({});
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      crop_management: '🌱',
      livestock_care: '🐄',
      financial_literacy: '💰',
      market_access: '🏪',
      climate_adaptation: '🌡️'
    };
    return icons[category as keyof typeof icons] || '📚';
  };

  const renderModuleCard = (module: LearningModule) => {
    const moduleProgress = progress[module.id];
    const completionPercentage = moduleProgress 
      ? (Object.keys(moduleProgress.contentProgress).length / module.content.length) * 100
      : 0;

    return (
      <TouchableOpacity
        key={module.id}
        style={styles.moduleCard}
        onPress={() => startModule(module)}
      >
        <View style={styles.moduleHeader}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(module.category)}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty) }]}>
            <Text style={styles.difficultyText}>{module.difficulty}</Text>
          </View>
        </View>
        
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleDescription}>{module.description}</Text>
        
        <View style={styles.moduleStats}>
          <Text style={styles.duration}>⏱️ {module.duration} min</Text>
          <Text style={styles.downloadSize}>📱 {module.downloadSize} MB</Text>
        </View>
        
        {completionPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(completionPercentage)}% complete</Text>
          </View>
        )}
        
        <View style={styles.moduleActions}>
          {!module.isDownloaded ? (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => downloadModule(module)}
            >
              <Text style={styles.downloadButtonText}>Download for Offline</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.downloadedText}>✅ Available Offline</Text>
          )}
        </View>
        
        {downloadProgress[module.id] !== undefined && downloadProgress[module.id] < 100 && (
          <View style={styles.downloadProgress}>
            <View style={[styles.downloadProgressFill, { width: `${downloadProgress[module.id]}%` }]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case 'video':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Video
              source={{ uri: currentContent.localPath || currentContent.mediaUrl || '' }}
              style={styles.video}
              useNativeControls
              resizeMode={'contain' as any}
              shouldPlay={false}
            />
            <Text style={styles.contentDescription}>{currentContent.content}</Text>
          </View>
        );
      
      case 'text':
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text style={styles.textContent}>{currentContent.content}</Text>
          </ScrollView>
        );
      
      case 'image':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Image
              source={{ uri: currentContent.localPath || currentContent.mediaUrl || '' }}
              style={styles.contentImage}
              resizeMode={'contain' as any}
            />
            <Text style={styles.contentDescription}>{currentContent.content}</Text>
          </View>
        );
      
      case 'interactive':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <View style={styles.interactiveContent}>
              <Text style={styles.interactiveText}>🔧 Interactive Content</Text>
              <Text style={styles.contentDescription}>{currentContent.content}</Text>
              <TouchableOpacity style={styles.interactiveButton}>
                <Text style={styles.interactiveButtonText}>Launch Interactive Tool</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderQuiz = () => {
    if (!selectedModule || !showQuiz) return null;

    const quiz = selectedModule.quiz;

    return (
      <Modal visible={showQuiz} animationType="slide">
        <View style={styles.quizContainer}>
          <Text style={styles.quizTitle}>Quiz: {selectedModule.title}</Text>
          <Text style={styles.quizInstructions}>
            Answer all questions to complete the module. You need {quiz.passingScore}% to pass.
          </Text>
          
          <ScrollView style={styles.quizContent}>
            {quiz.questions.map((question, index) => (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.question}
                </Text>
                
                {question.options.map((option, optionIndex) => (
                  <TouchableOpacity
                    key={optionIndex}
                    style={[
                      styles.optionButton,
                      quizAnswers[question.id] === optionIndex && styles.selectedOption
                    ]}
                    onPress={() => setQuizAnswers({ ...quizAnswers, [question.id]: optionIndex })}
                  >
                    <Text style={[
                      styles.optionText,
                      quizAnswers[question.id] === optionIndex && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.quizActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowQuiz(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                Object.keys(quizAnswers).length < quiz.questions.length && styles.disabledButton
              ]}
              onPress={submitQuiz}
              disabled={Object.keys(quizAnswers).length < quiz.questions.length}
            >
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (selectedModule) {
    return (
      <View style={styles.container}>
        <View style={styles.moduleHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedModule(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.moduleHeaderTitle}>{selectedModule.title}</Text>
        </View>
        
        {renderContent()}
        
        <View style={styles.contentNavigation}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => currentContent && completeContent(currentContent.id)}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
        
        {renderQuiz()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Platform</Text>
        <Text style={styles.subtitle}>Expand your agricultural knowledge</Text>
      </View>
      
      <View style={styles.languageSelector}>
        <Text style={styles.languageLabel}>Language:</Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => {
            Alert.alert('Language Selection', 'Language selection coming soon!');
          }}
        >
          <Text style={styles.languageButtonText}>English 🌐</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.modulesContainer}>
        {modules.map(renderModuleCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#00684b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  languageLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  languageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modulesContainer: {
    padding: 16,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  downloadSize: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00684b',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  moduleActions: {
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#007f82',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  downloadProgress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 8,
  },
  downloadProgressFill: {
    height: '100%',
    backgroundColor: '#007f82',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  contentDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  textContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  contentImage: {
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  interactiveContent: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  interactiveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interactiveButton: {
    backgroundColor: '#00684b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  interactiveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  moduleHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00684b',
    fontWeight: '600',
  },
  contentNavigation: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completeButton: {
    backgroundColor: '#00684b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quizContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  quizInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  quizContent: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#00684b',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#00684b',
    fontWeight: '600',
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#00684b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
