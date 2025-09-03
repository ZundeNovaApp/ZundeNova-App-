import { offlineStorageService } from './OfflineStorageService';
import NetInfo from '@react-native-community/netinfo';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = false;

  async initialize() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.syncData();
      }
    });

    this.startPeriodicSync();
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 30000);
  }

  async syncData() {
    try {
      const unsyncedData = await offlineStorageService.getUnsyncedData();
      
      for (const data of unsyncedData) {
        try {
          await this.syncDataItem(data);
          await offlineStorageService.markAsSynced(data.id);
        } catch (error) {
          console.error(`Failed to sync data item ${data.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncDataItem(data: any) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    
    switch (data.type) {
      case 'farm':
        await fetch(`${apiUrl}/api/farms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.data)
        });
        break;
      
      case 'diagnostic':
        await fetch(`${apiUrl}/api/diagnostics/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.data)
        });
        break;
      
      case 'marketplace':
        await fetch(`${apiUrl}/api/marketplace/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.data)
        });
        break;
    }
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();
