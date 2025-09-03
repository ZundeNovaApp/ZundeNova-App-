import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';
import { syncService } from '../services/SyncService';

interface OfflineSyncProps {
  onSyncComplete: () => void;
}

export default function OfflineSync({ onSyncComplete }: OfflineSyncProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    checkUnsyncedData();
  }, []);

  const checkUnsyncedData = async () => {
    try {
      const unsyncedData = await offlineStorageService.getUnsyncedData();
      setUnsyncedCount(unsyncedData.length);
    } catch (error) {
      console.error('Failed to check unsynced data:', error);
    }
  };

  const performSync = async () => {
    setSyncStatus('syncing');
    try {
      await syncService.syncData();
      setSyncStatus('complete');
      setUnsyncedCount(0);
      onSyncComplete();
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing data...';
      case 'complete':
        return 'Sync complete!';
      case 'error':
        return 'Sync failed. Try again.';
      default:
        return unsyncedCount > 0 ? `${unsyncedCount} items to sync` : 'All data synced';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return '#F59E0B';
      case 'complete':
        return '#10B981';
      case 'error':
        return '#dc3545';
      default:
        return unsyncedCount > 0 ? '#F59E0B' : '#10B981';
    }
  };

  if (unsyncedCount === 0 && syncStatus === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.syncCard}>
        <View style={styles.syncHeader}>
          <Text style={styles.syncTitle}>Data Sync</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getSyncStatusColor() }]} />
        </View>
        
        <Text style={styles.syncStatus}>{getSyncStatusText()}</Text>
        
        {(unsyncedCount > 0 || syncStatus === 'error') && syncStatus !== 'syncing' && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={performSync}
            disabled={false}
          >
            <Text style={styles.syncButtonText}>
              {syncStatus === 'error' ? 'Retry Sync' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  syncCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  syncStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  syncButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
