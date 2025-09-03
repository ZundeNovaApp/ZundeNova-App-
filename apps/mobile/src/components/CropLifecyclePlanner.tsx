import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { offlineStorageService } from '../services/OfflineStorageService';

interface CropLifecyclePlannerProps {
  cropId: string;
  onPlanUpdated: (plan: any) => void;
}

export default function CropLifecyclePlanner({ cropId, onPlanUpdated }: CropLifecyclePlannerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [currentStage, setCurrentStage] = useState('planning');
  const [tasks, setTasks] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  useEffect(() => {
    loadCropPlan();
  }, [cropId]);

  const loadCropPlan = async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Soil Preparation',
        description: 'Prepare soil with organic matter',
        type: 'preparation',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        completed: false,
        reminderSent: false
      },
      {
        id: '2',
        title: 'First Fertilizer Application',
        description: 'Apply NPK 15-15-15 fertilizer',
        type: 'fertilizer',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        reminderSent: false,
        products: ['NPK 15-15-15']
      },
      {
        id: '3',
        title: 'Irrigation Setup',
        description: 'Set up drip irrigation system',
        type: 'irrigation',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        completed: false,
        reminderSent: false
      }
    ];

    setTasks(mockTasks);
    setUpcomingTasks(mockTasks.filter(task => !task.completed));
  };

  const completeTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    setUpcomingTasks(updatedTasks.filter(task => !task.completed));

    await offlineStorageService.storeOfflineData({
      id: `task_completion_${taskId}`,
      type: 'farm',
      data: { taskId, completed: true, completedAt: new Date() }
    });

    Alert.alert('Task Completed', 'Task marked as completed successfully!');
  };

  const addCustomTask = () => {
    Alert.alert('Add Task', 'Custom task creation feature coming soon!');
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    tasks.forEach(task => {
      const dateString = task.dueDate.toISOString().split('T')[0];
      marked[dateString] = {
        marked: true,
        dotColor: task.completed ? '#10B981' : '#F59E0B',
        selectedColor: task.completed ? '#10B981' : '#F59E0B'
      };
    });

    return marked;
  };

  const renderTaskCard = (task: any) => (
    <View key={task.id} style={[styles.taskCard, task.completed && styles.completedTask]}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskType}>{task.type}</Text>
      </View>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <Text style={styles.taskDueDate}>
        Due: {task.dueDate.toLocaleDateString()}
      </Text>
      
      {task.products && (
        <View style={styles.productsContainer}>
          <Text style={styles.productsLabel}>Required Products:</Text>
          {task.products.map((product: string, index: number) => (
            <Text key={index} style={styles.productItem}>• {product}</Text>
          ))}
        </View>
      )}

      {!task.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => completeTask(task.id)}
        >
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crop Lifecycle Planner</Text>
      
      <View style={styles.stageIndicator}>
        <Text style={styles.stageText}>Current Stage: {currentStage}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '30%' }]} />
        </View>
      </View>

      <Calendar
        markedDates={getMarkedDates()}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#10B981',
          todayTextColor: '#10B981',
          arrowColor: '#10B981',
        }}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          <TouchableOpacity style={styles.addButton} onPress={addCustomTask}>
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingTasks.map(renderTaskCard)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Tasks</Text>
        {tasks.map(renderTaskCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    padding: 20,
    textAlign: 'center',
  },
  stageIndicator: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  stageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskType: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 10,
  },
  productsContainer: {
    marginBottom: 10,
  },
  productsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
