import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: number;
  lastActivity: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  level: number;
  rank: number;
}

export default function GamificationSystem({ userId }: { userId: string }) {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadGamificationData();
    initializeAchievements();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      const pointsData = await offlineStorageService.getOfflineDataByType('gamification');
      const userPointsData = pointsData.find(data => data.data.userId === userId);
      
      if (userPointsData) {
        setUserPoints(userPointsData.data);
      } else {
        const initialPoints: UserPoints = {
          userId,
          totalPoints: 0,
          level: 1,
          badges: [],
          achievements: [],
          streak: 0,
          lastActivity: new Date().toISOString()
        };
        setUserPoints(initialPoints);
        await saveUserPoints(initialPoints);
      }

      await loadLeaderboard();
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    }
  };

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_diagnosis',
        name: 'First Diagnosis',
        description: 'Complete your first crop or livestock diagnosis',
        progress: 0,
        target: 1,
        completed: false,
        reward: 50
      },
      {
        id: 'helpful_farmer',
        name: 'Helpful Farmer',
        description: 'Help 10 other farmers in the community',
        progress: 0,
        target: 10,
        completed: false,
        reward: 200
      },
      {
        id: 'learning_enthusiast',
        name: 'Learning Enthusiast',
        description: 'Complete 5 learning modules',
        progress: 0,
        target: 5,
        completed: false,
        reward: 150
      },
      {
        id: 'market_master',
        name: 'Market Master',
        description: 'Make 20 successful marketplace transactions',
        progress: 0,
        target: 20,
        completed: false,
        reward: 300
      },
      {
        id: 'streak_keeper',
        name: 'Streak Keeper',
        description: 'Maintain a 7-day activity streak',
        progress: 0,
        target: 7,
        completed: false,
        reward: 100
      }
    ];

    setAchievements(defaultAchievements);
  };

  const awardPoints = async (action: string, points?: number) => {
    if (!userPoints) return;

    const actionPoints = {
      'post_question': 10,
      'answer_question': 15,
      'helpful_answer': 25,
      'complete_diagnosis': 20,
      'share_knowledge': 30,
      'mentor_farmer': 50,
      'complete_learning': 40,
      'marketplace_transaction': 25,
      'daily_login': 5,
      'profile_complete': 100
    };

    const pointsToAward = points || actionPoints[action as keyof typeof actionPoints] || 10;
    const newTotalPoints = userPoints.totalPoints + pointsToAward;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    const updatedPoints: UserPoints = {
      ...userPoints,
      totalPoints: newTotalPoints,
      level: newLevel,
      lastActivity: new Date().toISOString()
    };

    if (action === 'daily_login') {
      updatedPoints.streak = calculateStreak(userPoints.lastActivity);
    }

    setUserPoints(updatedPoints);
    await saveUserPoints(updatedPoints);

    await checkBadgeEligibility(updatedPoints, action);
    await updateAchievements(action);

    if (newLevel > userPoints.level) {
      Alert.alert(
        '🎉 Level Up!',
        `Congratulations! You've reached level ${newLevel}!`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  };

  const calculateStreak = (lastActivity: string): number => {
    const lastDate = new Date(lastActivity);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? (userPoints?.streak || 0) + 1 : 1;
  };

  const checkBadgeEligibility = async (points: UserPoints, action: string) => {
    const badges = [
      {
        id: 'first_diagnosis',
        name: 'First Diagnosis',
        description: 'Completed your first diagnosis',
        icon: '🔬',
        rarity: 'common' as const,
        condition: () => action === 'complete_diagnosis' && !points.badges.find(b => b.id === 'first_diagnosis')
      },
      {
        id: 'helpful_farmer',
        name: 'Helpful Farmer',
        description: 'Earned 100 points helping others',
        icon: '🤝',
        rarity: 'rare' as const,
        condition: () => points.totalPoints >= 100 && !points.badges.find(b => b.id === 'helpful_farmer')
      },
      {
        id: 'expert_contributor',
        name: 'Expert Contributor',
        description: 'Earned 500 points sharing knowledge',
        icon: '🎓',
        rarity: 'epic' as const,
        condition: () => points.totalPoints >= 500 && !points.badges.find(b => b.id === 'expert_contributor')
      },
      {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Reached 1000 points and level 10',
        icon: '👑',
        rarity: 'legendary' as const,
        condition: () => points.totalPoints >= 1000 && points.level >= 10 && !points.badges.find(b => b.id === 'community_leader')
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintained a 30-day streak',
        icon: '🔥',
        rarity: 'epic' as const,
        condition: () => points.streak >= 30 && !points.badges.find(b => b.id === 'streak_master')
      }
    ];

    for (const badge of badges) {
      if (badge.condition()) {
        const newBadge: Badge = {
          ...badge,
          earnedAt: new Date().toISOString()
        };

        const updatedPoints = {
          ...points,
          badges: [...points.badges, newBadge]
        };

        setUserPoints(updatedPoints);
        await saveUserPoints(updatedPoints);
        
        setNewBadge(newBadge);
        setShowBadgeModal(true);
        break;
      }
    }
  };

  const updateAchievements = async (action: string) => {
    const updatedAchievements = achievements.map(achievement => {
      let progress = achievement.progress;

      switch (achievement.id) {
        case 'first_diagnosis':
          if (action === 'complete_diagnosis') progress = Math.min(progress + 1, achievement.target);
          break;
        case 'helpful_farmer':
          if (action === 'answer_question' || action === 'helpful_answer') {
            progress = Math.min(progress + 1, achievement.target);
          }
          break;
        case 'learning_enthusiast':
          if (action === 'complete_learning') progress = Math.min(progress + 1, achievement.target);
          break;
        case 'market_master':
          if (action === 'marketplace_transaction') progress = Math.min(progress + 1, achievement.target);
          break;
        case 'streak_keeper':
          if (action === 'daily_login' && userPoints) {
            progress = Math.min(userPoints.streak, achievement.target);
          }
          break;
      }

      const completed = progress >= achievement.target;
      
      if (completed && !achievement.completed) {
        awardPoints('achievement_completed', achievement.reward);
        Alert.alert(
          '🏆 Achievement Unlocked!',
          `${achievement.name}\n+${achievement.reward} points`,
          [{ text: 'Great!', style: 'default' }]
        );
      }

      return { ...achievement, progress, completed };
    });

    setAchievements(updatedAchievements);
  };

  const saveUserPoints = async (points: UserPoints) => {
    await offlineStorageService.storeOfflineData({
      id: `gamification_${userId}`,
      type: 'gamification',
      data: points
    });
  };

  const loadLeaderboard = async () => {
    try {
      const allPointsData = await offlineStorageService.getOfflineDataByType('gamification');
      const leaderboardData = allPointsData
        .map(data => ({
          userId: data.data.userId,
          userName: `Farmer ${data.data.userId.slice(-4)}`,
          points: data.data.totalPoints,
          level: data.data.level,
          rank: 0
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 10);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelPoints = (userPoints.level - 1) * 100;
    const nextLevelPoints = userPoints.level * 100;
    const progress = userPoints.totalPoints - currentLevelPoints;
    const levelRange = nextLevelPoints - currentLevelPoints;
    return (progress / levelRange) * 100;
  };

  const getBadgeColor = (rarity: string) => {
    const colors = {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const renderUserStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.levelCard}>
        <Text style={styles.levelText}>Level {userPoints?.level || 1}</Text>
        <Text style={styles.pointsText}>{userPoints?.totalPoints || 0} points</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getLevelProgress())}% to next level
        </Text>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>{userPoints?.streak || 0} day streak</Text>
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      <Text style={styles.sectionTitle}>Badges ({userPoints?.badges.length || 0})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {userPoints?.badges.map(badge => (
          <View key={badge.id} style={[styles.badge, { borderColor: getBadgeColor(badge.rarity) }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
        {(!userPoints?.badges.length) && (
          <Text style={styles.emptyText}>Complete activities to earn badges!</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      {achievements.map(achievement => (
        <View key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementReward}>+{achievement.reward} pts</Text>
          </View>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          <View style={styles.achievementProgress}>
            <View style={styles.achievementProgressBar}>
              <View 
                style={[
                  styles.achievementProgressFill, 
                  { width: `${(achievement.progress / achievement.target) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.achievementProgressText}>
              {achievement.progress}/{achievement.target}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.sectionTitle}>Leaderboard</Text>
      {leaderboard.map(entry => (
        <View key={entry.userId} style={[
          styles.leaderboardEntry,
          entry.userId === userId && styles.currentUserEntry
        ]}>
          <Text style={styles.rank}>#{entry.rank}</Text>
          <Text style={styles.userName}>{entry.userName}</Text>
          <Text style={styles.userLevel}>Lv.{entry.level}</Text>
          <Text style={styles.userPoints}>{entry.points} pts</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderUserStats()}
      {renderBadges()}
      {renderAchievements()}
      {renderLeaderboard()}

      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.badgeModal}>
            <Text style={styles.modalTitle}>🎉 Badge Earned!</Text>
            {newBadge && (
              <>
                <Text style={styles.modalBadgeIcon}>{newBadge.icon}</Text>
                <Text style={styles.modalBadgeName}>{newBadge.name}</Text>
                <Text style={styles.modalBadgeDescription}>{newBadge.description}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowBadgeModal(false)}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  levelCard: {
    flex: 2,
    backgroundColor: '#00684b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dbc600',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  streakCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badgesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  achievementsContainer: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementReward: {
    fontSize: 14,
    color: '#00684b',
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#00684b',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
  },
  leaderboardContainer: {
    padding: 16,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  currentUserEntry: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#00684b',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  userPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00684b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalBadgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalBadgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalBadgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#00684b',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
