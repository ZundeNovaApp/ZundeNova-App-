import { offlineStorageService } from './OfflineStorageService';

export interface NotificationData {
  id: string;
  type: 'weather' | 'pest' | 'irrigation' | 'fertilizer' | 'harvest' | 'market' | 'expert';
  title: string;
  message: string;
  scheduledDate: Date;
  farmId: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  data?: any;
}

class NotificationService {
  private notifications: NotificationData[] = [];

  async scheduleNotification(notification: NotificationData): Promise<void> {
    this.notifications.push(notification);
    
    await offlineStorageService.storeOfflineData({
      id: `notification_${notification.id}`,
      type: 'farm',
      data: notification
    });

    console.log(`Notification scheduled: ${notification.title}`);
  }

  async scheduleWeatherAlert(farmId: string, weatherData: any): Promise<void> {
    if (weatherData.alerts && weatherData.alerts.length > 0) {
      for (const alert of weatherData.alerts) {
        await this.scheduleNotification({
          id: `weather_${Date.now()}_${Math.random()}`,
          type: 'weather',
          title: alert.title,
          message: alert.message,
          scheduledDate: new Date(),
          farmId,
          priority: alert.severity === 'severe' ? 'high' : 'medium',
          actionRequired: true,
          data: alert
        });
      }
    }
  }

  async scheduleIrrigationReminder(farmId: string, cropArea: string, scheduledTime: Date): Promise<void> {
    await this.scheduleNotification({
      id: `irrigation_${Date.now()}`,
      type: 'irrigation',
      title: 'Irrigation Reminder',
      message: `Time to irrigate ${cropArea}`,
      scheduledDate: scheduledTime,
      farmId,
      priority: 'medium',
      actionRequired: true,
      data: { cropArea }
    });
  }

  async scheduleFertilizerApplication(farmId: string, cropId: string, applicationDate: Date): Promise<void> {
    await this.scheduleNotification({
      id: `fertilizer_${Date.now()}`,
      type: 'fertilizer',
      title: 'Fertilizer Application Due',
      message: 'Time to apply fertilizer to your crops',
      scheduledDate: applicationDate,
      farmId,
      priority: 'high',
      actionRequired: true,
      data: { cropId }
    });
  }

  async schedulePestMonitoring(farmId: string, cropId: string): Promise<void> {
    const monitoringDate = new Date();
    monitoringDate.setDate(monitoringDate.getDate() + 3);

    await this.scheduleNotification({
      id: `pest_${Date.now()}`,
      type: 'pest',
      title: 'Pest Monitoring',
      message: 'Check your crops for pest activity',
      scheduledDate: monitoringDate,
      farmId,
      priority: 'medium',
      actionRequired: true,
      data: { cropId }
    });
  }

  async scheduleHarvestReminder(farmId: string, cropId: string, harvestDate: Date): Promise<void> {
    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    await this.scheduleNotification({
      id: `harvest_${Date.now()}`,
      type: 'harvest',
      title: 'Harvest Approaching',
      message: 'Your crops will be ready for harvest in 7 days',
      scheduledDate: reminderDate,
      farmId,
      priority: 'high',
      actionRequired: true,
      data: { cropId, harvestDate }
    });
  }

  async scheduleMarketPriceAlert(farmId: string, product: string, targetPrice: number): Promise<void> {
    await this.scheduleNotification({
      id: `market_${Date.now()}`,
      type: 'market',
      title: 'Price Alert',
      message: `${product} has reached your target price of $${targetPrice}`,
      scheduledDate: new Date(),
      farmId,
      priority: 'medium',
      actionRequired: false,
      data: { product, targetPrice }
    });
  }

  async getScheduledNotifications(farmId: string): Promise<NotificationData[]> {
    return this.notifications.filter(n => n.farmId === farmId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  async clearAllNotifications(farmId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.farmId !== farmId);
  }

  async scheduleActivityReminder(activityId: string, title: string, description: string, scheduledTime: Date): Promise<void> {
    await this.scheduleNotification({
      id: `activity_${activityId}_${scheduledTime.getTime()}`,
      type: 'harvest',
      title,
      message: description,
      scheduledDate: scheduledTime,
      farmId: 'default',
      priority: 'medium',
      actionRequired: true,
      data: { activityId }
    });
  }

  async scheduleVaccinationReminder(animalId: string, animalTag: string, vaccine: string, scheduledTime: Date): Promise<void> {
    await this.scheduleNotification({
      id: `vaccination_${animalId}_${scheduledTime.getTime()}`,
      type: 'harvest',
      title: 'Vaccination Due',
      message: `${vaccine} vaccination due for ${animalTag}`,
      scheduledDate: scheduledTime,
      farmId: 'default',
      priority: 'high',
      actionRequired: true,
      data: { animalId, animalTag, vaccine }
    });
  }
}

export const notificationService = new NotificationService();
