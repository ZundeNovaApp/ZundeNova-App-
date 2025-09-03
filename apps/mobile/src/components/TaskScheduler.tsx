import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';
import { notificationService } from '../services/NotificationService';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'fertilizer' | 'irrigation' | 'pesticide' | 'harvest' | 'monitoring' | 'maintenance';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  farmId: string;
  cropId?: string;
  livestockId?: string;
  estimatedDuration: number;
  requiredSupplies?: string[];
  instructions?: string[];
  reminderSent: boolean;
  completedAt?: Date;
}

interface TaskSchedulerProps {
  farmId: string;
  onTaskUpdate: (tasks: Task[]) => void;
}

export default function TaskScheduler({ farmId, onTaskUpdate }: TaskSchedulerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'today' | 'overdue'>('all');

  useEffect(() => {
    loadTasks();
    scheduleAutomaticTasks();
  }, [farmId]);

  const loadTasks = async () => {
    const mockTasks: Task[] = [
      {
        id: 'task_1',
        title: 'Apply NPK Fertilizer',
        description: 'Apply NPK fertilizer to maize field A',
        type: 'fertilizer',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'pending',
        farmId,
        cropId: 'crop_1',
        estimatedDuration: 120,
        requiredSupplies: ['NPK Fertilizer 50kg', 'Spreader', 'Protective gear'],
        instructions: [
          'Check weather conditions - avoid application before rain',
          'Apply 200kg per hectare',
          'Water lightly after application',
          'Keep livestock away for 24 hours'
        ],
        reminderSent: false
      },
      {
        id: 'task_2',
        title: 'Irrigation System Check',
        description: 'Inspect and test irrigation system',
        type: 'irrigation',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'pending',
        farmId,
        estimatedDuration: 90,
        requiredSupplies: ['Tools', 'Replacement parts'],
        instructions: [
          'Check all sprinkler heads',
          'Test water pressure',
          'Clean filters',
          'Check for leaks'
        ],
        reminderSent: false
      },
      {
        id: 'task_3',
        title: 'Pest Monitoring',
        description: 'Weekly pest inspection of tomato crops',
        type: 'monitoring',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'overdue',
        farmId,
        cropId: 'crop_2',
        estimatedDuration: 60,
        requiredSupplies: ['Magnifying glass', 'Notebook', 'Camera'],
        instructions: [
          'Check undersides of leaves',
          'Look for pest damage patterns',
          'Take photos of any issues',
          'Record findings in log'
        ],
        reminderSent: true
      }
    ];

    setTasks(mockTasks);
    onTaskUpdate(mockTasks);

    await offlineStorageService.storeOfflineData({
      id: `tasks_${farmId}`,
      type: 'farm',
      data: mockTasks
    });
  };

  const scheduleAutomaticTasks = async () => {
    const automaticTasks = [
      {
        title: 'Weekly Soil Moisture Check',
        type: 'monitoring' as const,
        frequency: 7,
        priority: 'medium' as const,
        duration: 30
      },
      {
        title: 'Monthly Equipment Maintenance',
        type: 'maintenance' as const,
        frequency: 30,
        priority: 'low' as const,
        duration: 180
      },
      {
        title: 'Bi-weekly Pest Inspection',
        type: 'monitoring' as const,
        frequency: 14,
        priority: 'medium' as const,
        duration: 45
      }
    ];

    for (const autoTask of automaticTasks) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + autoTask.frequency);

      await notificationService.scheduleNotification({
        id: `auto_task_${Date.now()}_${Math.random()}`,
        type: 'irrigation',
        title: autoTask.title,
        message: `Scheduled ${autoTask.title.toLowerCase()} is due`,
        scheduledDate: dueDate,
        farmId,
        priority: autoTask.priority,
        actionRequired: true,
        data: autoTask
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, status: newStatus };
        if (newStatus === 'completed') {
          updatedTask.completedAt = new Date();
        }
        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    onTaskUpdate(updatedTasks);

    await offlineStorageService.storeOfflineData({
      id: `task_update_${taskId}`,
      type: 'farm',
      data: { taskId, status: newStatus, updatedAt: new Date() }
    });

    if (newStatus === 'completed') {
      Alert.alert('Task Completed', 'Great job! Task has been marked as completed.');
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'today':
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate < tomorrow;
        });
      case 'overdue':
        return tasks.filter(task => task.status === 'overdue' || 
          (task.status === 'pending' && new Date(task.dueDate) < now));
      default:
        return tasks;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'overdue': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fertilizer': return '🌱';
      case 'irrigation': return '💧';
      case 'pesticide': return '🛡️';
      case 'harvest': return '🌾';
      case 'monitoring': return '🔍';
      case 'maintenance': return '🔧';
      default: return '📋';
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Task Scheduler</Text>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'today', 'overdue'].map(filterOption => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.activeFilterButton
            ]}
            onPress={() => setFilter(filterOption as any)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterOption && styles.activeFilterButtonText
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tasksContainer}>
        {filteredTasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskIcon}>{getTypeIcon(task.type)}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskBadges}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.badgeText}>{task.priority}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.badgeText}>{task.status}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>

            <View style={styles.taskDetails}>
              <Text style={styles.taskDueDate}>
                📅 Due: {task.dueDate.toLocaleDateString()} at {task.dueDate.toLocaleTimeString()}
              </Text>
              <Text style={styles.taskDuration}>
                ⏱️ Estimated: {task.estimatedDuration} minutes
              </Text>
            </View>

            {task.requiredSupplies && task.requiredSupplies.length > 0 && (
              <View style={styles.suppliesSection}>
                <Text style={styles.sectionTitle}>Required Supplies:</Text>
                {task.requiredSupplies.map((supply, index) => (
                  <Text key={index} style={styles.supplyItem}>• {supply}</Text>
                ))}
              </View>
            )}

            {task.instructions && task.instructions.length > 0 && (
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>Instructions:</Text>
                {task.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.instructionItem}>
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.taskActions}>
              {task.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => updateTaskStatus(task.id, 'in_progress')}
                  >
                    <Text style={styles.startButtonText}>Start Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => updateTaskStatus(task.id, 'completed')}
                  >
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                </>
              )}

              {task.status === 'in_progress' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => updateTaskStatus(task.id, 'completed')}
                >
                  <Text style={styles.completeButtonText}>Complete Task</Text>
                </TouchableOpacity>
              )}

              {task.status === 'overdue' && (
                <TouchableOpacity
                  style={styles.urgentButton}
                  onPress={() => updateTaskStatus(task.id, 'in_progress')}
                >
                  <Text style={styles.urgentButtonText}>Start Now</Text>
                </TouchableOpacity>
              )}

              {task.status === 'completed' && (
                <View style={styles.completedIndicator}>
                  <Text style={styles.completedText}>✅ Completed</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks found for the selected filter</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.addTaskButton}>
        <Text style={styles.addTaskButtonText}>+ Add New Task</Text>
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  tasksContainer: {
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskHeader: {
    marginBottom: 15,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  priorityBadge: {
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
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskDetails: {
    marginBottom: 15,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskDuration: {
    fontSize: 12,
    color: '#666',
  },
  suppliesSection: {
    marginBottom: 15,
  },
  instructionsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supplyItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  instructionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  urgentButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  urgentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  completedText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addTaskButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
