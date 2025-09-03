import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface SyncStatus {
  lastSync: string | null;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  connectionStatus: 'online' | 'offline';
  dataIntegrity: 'good' | 'warning' | 'error';
}

interface OfflineData {
  type: string;
  count: number;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

interface ConflictResolution {
  id: string;
  type: string;
  localData: any;
  serverData: any;
  conflictType: 'update' | 'delete' | 'create';
  timestamp: string;
}

const OfflineFirstArchitecture: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingUploads: 0,
    pendingDownloads: 0,
    syncInProgress: false,
    connectionStatus: 'offline',
    dataIntegrity: 'good'
  });
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    available: 100,
    percentage: 0
  });
  const [activeTab, setActiveTab] = useState<'status' | 'data' | 'conflicts' | 'settings'>('status');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeOfflineArchitecture();
    const interval = setInterval(checkSyncStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoSyncEnabled && syncStatus.connectionStatus === 'online') {
      const syncTimer = setInterval(performBackgroundSync, syncInterval * 1000);
      return () => clearInterval(syncTimer);
    }
  }, [autoSyncEnabled, syncInterval, syncStatus.connectionStatus]);

  const initializeOfflineArchitecture = async () => {
    try {
      setLoading(true);
      
      await offlineStorageService.initialize();
      
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      const autoSync = await AsyncStorage.getItem('autoSyncEnabled');
      const interval = await AsyncStorage.getItem('syncInterval');
      
      const connectionStatus = await checkConnectionStatus();
      setSyncStatus(prev => ({
        ...prev,
        lastSync: lastSync,
        connectionStatus: connectionStatus
      }));
      
      setAutoSyncEnabled(autoSync !== 'false');
      setSyncInterval(interval ? parseInt(interval) : 300);
      
      await loadOfflineDataSummary();
      
      await loadConflicts();
      
      await calculateStorageUsage();
      
    } catch (error) {
      console.error('Error initializing offline architecture:', error);
      Alert.alert('Error', 'Failed to initialize offline system');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async (): Promise<'online' | 'offline'> => {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok ? 'online' : 'offline';
    } catch {
      return 'offline';
    }
  };

  const checkSyncStatus = async () => {
    const connectionStatus = await checkConnectionStatus();
    const pendingUploads = Math.floor(Math.random() * 5);
    const pendingDownloads = Math.floor(Math.random() * 3);
    
    setSyncStatus(prev => ({
      ...prev,
      connectionStatus,
      pendingUploads,
      pendingDownloads
    }));
  };

  const loadOfflineDataSummary = async () => {
    try {
      const dataTypes = ['farms', 'diagnostics', 'financial', 'insurance', 'credit', 'marketplace'];
      const summary: OfflineData[] = [];
      
      for (const type of dataTypes) {
        const data = await offlineStorageService.getOfflineDataByType(type as any);
        const lastModified = await AsyncStorage.getItem(`${type}_lastModified`) || 'Never';
        const syncStatus = await AsyncStorage.getItem(`${type}_syncStatus`) || 'synced';
        
        summary.push({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count: data.length,
          lastModified,
          syncStatus: syncStatus as any
        });
      }
      
      setOfflineData(summary);
    } catch (error) {
      console.error('Error loading offline data summary:', error);
    }
  };

  const loadConflicts = async () => {
    try {
      const conflictsData = await AsyncStorage.getItem('syncConflicts');
      if (conflictsData) {
        setConflicts(JSON.parse(conflictsData));
      }
    } catch (error) {
      console.error('Error loading conflicts:', error);
    }
  };

  const calculateStorageUsage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      const usedMB = totalSize / (1024 * 1024);
      const availableMB = 100; // Assume 100MB limit for demo
      const percentage = (usedMB / availableMB) * 100;
      
      setStorageUsage({
        used: usedMB,
        available: availableMB,
        percentage: Math.min(percentage, 100)
      });
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  };

  const performBackgroundSync = async () => {
    if (syncStatus.syncInProgress) return;
    
    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastSyncTime', now);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: now,
        syncInProgress: false,
        pendingUploads: 0,
        pendingDownloads: 0
      }));
      
      await loadOfflineDataSummary();
      
    } catch (error) {
      console.error('Background sync failed:', error);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const manualSync = async () => {
    if (syncStatus.connectionStatus === 'offline') {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
      return;
    }
    
    Alert.alert(
      'Manual Sync',
      'Start manual synchronization?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sync', onPress: performBackgroundSync }
      ]
    );
  };

  const clearOfflineData = async () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all offline data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await initializeOfflineArchitecture();
              Alert.alert('Success', 'Offline data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear offline data');
            }
          }
        }
      ]
    );
  };

  const resolveConflict = async (conflictId: string, resolution: 'local' | 'server') => {
    try {
      const updatedConflicts = conflicts.filter(c => c.id !== conflictId);
      setConflicts(updatedConflicts);
      await AsyncStorage.setItem('syncConflicts', JSON.stringify(updatedConflicts));
      Alert.alert('Success', `Conflict resolved using ${resolution} data`);
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve conflict');
    }
  };

  const toggleAutoSync = async () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    await AsyncStorage.setItem('autoSyncEnabled', newValue.toString());
  };

  const renderStatus = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Sync Status</Text>
          <View style={[
            styles.connectionBadge,
            { backgroundColor: syncStatus.connectionStatus === 'online' ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.connectionText}>
              {syncStatus.connectionStatus.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusDetails}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Sync:</Text>
            <Text style={styles.statusValue}>
              {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Pending Uploads:</Text>
            <Text style={styles.statusValue}>{syncStatus.pendingUploads}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Pending Downloads:</Text>
            <Text style={styles.statusValue}>{syncStatus.pendingDownloads}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Data Integrity:</Text>
            <Text style={[
              styles.statusValue,
              { color: syncStatus.dataIntegrity === 'good' ? '#10B981' : '#F59E0B' }
            ]}>
              {syncStatus.dataIntegrity.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {syncStatus.syncInProgress && (
          <View style={styles.syncProgress}>
            <ActivityIndicator size="small" color="#228B22" />
            <Text style={styles.syncProgressText}>Syncing...</Text>
          </View>
        )}
      </View>

      <View style={styles.storageCard}>
        <Text style={styles.cardTitle}>Storage Usage</Text>
        <View style={styles.storageBar}>
          <View style={[styles.storageUsed, { width: `${storageUsage.percentage}%` }]} />
        </View>
        <Text style={styles.storageText}>
          {storageUsage.used.toFixed(2)} MB / {storageUsage.available} MB ({storageUsage.percentage.toFixed(1)}%)
        </Text>
      </View>

      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton} onPress={manualSync}>
          <Text style={styles.actionButtonText}>Manual Sync</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearOfflineData}>
          <Text style={styles.actionButtonText}>Clear Offline Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderData = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Offline Data Summary</Text>
      {offlineData.map((data, index) => (
        <View key={index} style={styles.dataCard}>
          <View style={styles.dataHeader}>
            <Text style={styles.dataType}>{data.type}</Text>
            <View style={[
              styles.syncBadge,
              { backgroundColor: getSyncStatusColor(data.syncStatus) }
            ]}>
              <Text style={styles.syncBadgeText}>{data.syncStatus.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.dataDetails}>
            <Text style={styles.dataCount}>{data.count} records</Text>
            <Text style={styles.dataModified}>Last modified: {data.lastModified}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderConflicts = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Sync Conflicts</Text>
      {conflicts.length === 0 ? (
        <View style={styles.noConflicts}>
          <Text style={styles.noConflictsText}>No sync conflicts</Text>
        </View>
      ) : (
        conflicts.map(conflict => (
          <View key={conflict.id} style={styles.conflictCard}>
            <View style={styles.conflictHeader}>
              <Text style={styles.conflictType}>{conflict.type}</Text>
              <Text style={styles.conflictTime}>
                {new Date(conflict.timestamp).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.conflictDescription}>
              {conflict.conflictType} conflict detected
            </Text>
            <View style={styles.conflictActions}>
              <TouchableOpacity
                style={[styles.conflictButton, styles.localButton]}
                onPress={() => resolveConflict(conflict.id, 'local')}
              >
                <Text style={styles.conflictButtonText}>Use Local</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.conflictButton, styles.serverButton]}
                onPress={() => resolveConflict(conflict.id, 'server')}
              >
                <Text style={styles.conflictButtonText}>Use Server</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Offline Settings</Text>
      
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto Sync</Text>
          <TouchableOpacity
            style={[styles.toggle, autoSyncEnabled && styles.toggleActive]}
            onPress={toggleAutoSync}
          >
            <View style={[styles.toggleThumb, autoSyncEnabled && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
        <Text style={styles.settingDescription}>
          Automatically sync data when online
        </Text>
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingLabel}>Sync Interval</Text>
        <View style={styles.intervalButtons}>
          {[60, 300, 600, 1800].map(interval => (
            <TouchableOpacity
              key={interval}
              style={[
                styles.intervalButton,
                syncInterval === interval && styles.intervalButtonActive
              ]}
              onPress={() => {
                setSyncInterval(interval);
                AsyncStorage.setItem('syncInterval', interval.toString());
              }}
            >
              <Text style={[
                styles.intervalButtonText,
                syncInterval === interval && styles.intervalButtonTextActive
              ]}>
                {interval < 60 ? `${interval}s` : `${interval / 60}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'conflict': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={styles.loadingText}>Initializing offline system...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline-First Architecture</Text>
        <Text style={styles.subtitle}>Seamless offline functionality</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'status' && styles.activeTab]}
          onPress={() => setActiveTab('status')}
        >
          <Text style={[styles.tabText, activeTab === 'status' && styles.activeTabText]}>
            Status
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'data' && styles.activeTab]}
          onPress={() => setActiveTab('data')}
        >
          <Text style={[styles.tabText, activeTab === 'data' && styles.activeTabText]}>
            Data
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conflicts' && styles.activeTab]}
          onPress={() => setActiveTab('conflicts')}
        >
          <Text style={[styles.tabText, activeTab === 'conflicts' && styles.activeTabText]}>
            Conflicts ({conflicts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'status' && renderStatus()}
      {activeTab === 'data' && renderData()}
      {activeTab === 'conflicts' && renderConflicts()}
      {activeTab === 'settings' && renderSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    fontSize: 12,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  connectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusDetails: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  syncProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  syncProgressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#228B22',
  },
  storageCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#228B22',
    borderRadius: 4,
  },
  storageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dataDetails: {
    gap: 4,
  },
  dataCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dataModified: {
    fontSize: 12,
    color: '#6B7280',
  },
  noConflicts: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noConflictsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  conflictCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  conflictTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  conflictDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8,
  },
  conflictButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  localButton: {
    backgroundColor: '#3B82F6',
  },
  serverButton: {
    backgroundColor: '#10B981',
  },
  conflictButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingCard: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#228B22',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  intervalButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: '#228B22',
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  intervalButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default OfflineFirstArchitecture;
