import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export interface OfflineData {
  id: string;
  type: 'farm' | 'diagnostic' | 'marketplace' | 'chat' | 'crop_plan' | 'livestock' | 'financial_record' | 'insurance_policy';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorageService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('zundenova_offline.db');
      await this.createTables();
      console.log('✅ Offline storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize offline storage:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_data (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS farm_data (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        size REAL,
        size_unit TEXT,
        soil_type TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        synced INTEGER DEFAULT 0
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS crop_data (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL,
        name TEXT NOT NULL,
        variety TEXT,
        planting_date INTEGER,
        expected_harvest_date INTEGER,
        area REAL,
        status TEXT,
        notes TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS diagnostic_data (
        id TEXT PRIMARY KEY,
        farm_id TEXT,
        type TEXT NOT NULL,
        image_uri TEXT,
        audio_uri TEXT,
        gps_location TEXT,
        questionnaire_data TEXT,
        ai_result TEXT,
        confidence REAL,
        timestamp INTEGER,
        synced INTEGER DEFAULT 0
      );
    `);
  }

  async storeOfflineData(data: Omit<OfflineData, 'timestamp' | 'synced'>): Promise<void> {
    try {
      const offlineData: OfflineData = {
        ...data,
        timestamp: Date.now(),
        synced: false
      };

      await AsyncStorage.setItem(`offline_${data.id}`, JSON.stringify(offlineData));

      if (this.db) {
        await this.db.runAsync(
          'INSERT OR REPLACE INTO offline_data (id, type, data, timestamp, synced) VALUES (?, ?, ?, ?, ?)',
          [data.id, data.type, JSON.stringify(data.data), offlineData.timestamp, 0]
        );
      }
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    try {
      if (!this.db) return [];

      const result = await this.db.getAllAsync(
        'SELECT * FROM offline_data WHERE synced = 0 ORDER BY timestamp ASC'
      );

      return result.map((row: any) => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        synced: Boolean(row.synced)
      }));
    } catch (error) {
      console.error('Failed to get unsynced data:', error);
      return [];
    }
  }

  async markAsSynced(id: string): Promise<void> {
    try {
      if (this.db) {
        await this.db.runAsync('UPDATE offline_data SET synced = 1 WHERE id = ?', [id]);
      }
      await AsyncStorage.removeItem(`offline_${id}`);
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  }

  async storeFarmData(farmData: any): Promise<void> {
    try {
      if (!this.db) return;

      await this.db.runAsync(`
        INSERT OR REPLACE INTO farm_data 
        (id, owner_id, name, latitude, longitude, address, size, size_unit, soil_type, created_at, updated_at, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        farmData.id,
        farmData.ownerId,
        farmData.name,
        farmData.location?.latitude,
        farmData.location?.longitude,
        farmData.location?.address,
        farmData.size,
        farmData.sizeUnit,
        farmData.soilType,
        Date.now(),
        Date.now(),
        0
      ]);
    } catch (error) {
      console.error('Failed to store farm data:', error);
    }
  }

  async getFarmData(ownerId: string): Promise<any[]> {
    try {
      if (!this.db) return [];

      const result = await this.db.getAllAsync(
        'SELECT * FROM farm_data WHERE owner_id = ?',
        [ownerId]
      );

      return result.map((row: any) => ({
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        location: {
          latitude: row.latitude,
          longitude: row.longitude,
          address: row.address
        },
        size: row.size,
        sizeUnit: row.size_unit,
        soilType: row.soil_type,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        synced: Boolean(row.synced)
      }));
    } catch (error) {
      console.error('Failed to get farm data:', error);
      return [];
    }
  }

  async storeDiagnosticData(diagnosticData: any): Promise<void> {
    try {
      if (!this.db) return;

      await this.db.runAsync(`
        INSERT OR REPLACE INTO diagnostic_data 
        (id, farm_id, type, image_uri, audio_uri, gps_location, questionnaire_data, ai_result, confidence, timestamp, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        diagnosticData.id,
        diagnosticData.farmId,
        diagnosticData.type,
        diagnosticData.imageUri,
        diagnosticData.audioUri,
        JSON.stringify(diagnosticData.gpsLocation),
        JSON.stringify(diagnosticData.questionnaireData),
        JSON.stringify(diagnosticData.aiResult),
        diagnosticData.confidence,
        Date.now(),
        0
      ]);
    } catch (error) {
      console.error('Failed to store diagnostic data:', error);
    }
  }

  async getOfflineDataByType(type: string): Promise<OfflineData[]> {
    try {
      if (!this.db) return [];

      const result = await this.db.getAllAsync(
        'SELECT * FROM offline_data WHERE type = ? ORDER BY timestamp ASC',
        [type]
      );

      return result.map((row: any) => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        synced: Boolean(row.synced)
      }));
    } catch (error) {
      console.error('Failed to get offline data by type:', error);
      return [];
    }
  }

  async getAllOfflineData(): Promise<OfflineData[]> {
    try {
      if (!this.db) return [];

      const result = await this.db.getAllAsync(
        'SELECT * FROM offline_data ORDER BY timestamp ASC'
      );

      return result.map((row: any) => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        synced: Boolean(row.synced)
      }));
    } catch (error) {
      console.error('Failed to get all offline data:', error);
      return [];
    }
  }

  async clearOfflineData(): Promise<void> {
    try {
      if (this.db) {
        await this.db.runAsync('DELETE FROM offline_data');
        await this.db.runAsync('DELETE FROM farm_data');
        await this.db.runAsync('DELETE FROM crop_data');
        await this.db.runAsync('DELETE FROM diagnostic_data');
      }
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }
}

export const offlineStorageService = new OfflineStorageService();
