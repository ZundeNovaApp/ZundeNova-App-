import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface PWAFeatures {
  installPrompt: boolean;
  offlineReady: boolean;
  updateAvailable: boolean;
  backgroundSync: boolean;
  pushNotifications: boolean;
}

interface ServiceWorkerStatus {
  registration: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
}

export default function ProgressiveWebApp() {
  const [pwaFeatures, setPwaFeatures] = useState<PWAFeatures>({
    installPrompt: false,
    offlineReady: false,
    updateAvailable: false,
    backgroundSync: false,
    pushNotifications: false
  });

  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceWorkerStatus>({
    registration: false,
    active: false,
    waiting: false,
    installing: false
  });

  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    initializePWA();
    registerServiceWorker();
    setupInstallPrompt();
    checkInstallationStatus();
  }, []);

  const initializePWA = async () => {
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isStandalone);

      const features: PWAFeatures = {
        installPrompt: 'beforeinstallprompt' in window,
        offlineReady: 'serviceWorker' in navigator,
        updateAvailable: false,
        backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window
      };

      setPwaFeatures(features);
    } catch (error) {
      console.error('Failed to initialize PWA features:', error);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        setServiceWorkerStatus(prev => ({
          ...prev,
          registration: true,
          active: !!registration.active,
          waiting: !!registration.waiting,
          installing: !!registration.installing
        }));

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaFeatures(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_COMPLETE') {
            console.log('Background sync completed');
          }
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setPwaFeatures(prev => ({ ...prev, installPrompt: true }));
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
      setPwaFeatures(prev => ({ ...prev, installPrompt: false }));
    });
  };

  const checkInstallationStatus = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }
  };

  const handleInstallApp = async () => {
    if (installPromptEvent) {
      try {
        const result = await installPromptEvent.prompt();
        console.log('Install prompt result:', result);
        
        if (result.outcome === 'accepted') {
          setInstallPromptEvent(null);
          setPwaFeatures(prev => ({ ...prev, installPrompt: false }));
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
        Alert.alert('Installation Failed', 'Unable to install the app. Please try again.');
      }
    }
  };

  const handleUpdateApp = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('App update failed:', error);
        Alert.alert('Update Failed', 'Unable to update the app. Please try again.');
      }
    }
  };

  const enablePushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY
            });

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription)
            });

            setPwaFeatures(prev => ({ ...prev, pushNotifications: true }));
            Alert.alert('Success', 'Push notifications enabled!');
          }
        }
      } catch (error) {
        console.error('Push notification setup failed:', error);
        Alert.alert('Failed', 'Unable to enable push notifications.');
      }
    }
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && (registration as any).sync) {
          await (registration as any).sync.register('background-sync');
          Alert.alert('Sync Scheduled', 'Data will sync when connection is available.');
        }
      } catch (error) {
        console.error('Background sync failed:', error);
        Alert.alert('Sync Failed', 'Unable to schedule background sync.');
      }
    }
  };

  const clearAppData = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      await offlineStorageService.clearOfflineData();

      localStorage.clear();
      sessionStorage.clear();

      Alert.alert('Data Cleared', 'All app data has been cleared.');
    } catch (error) {
      console.error('Failed to clear app data:', error);
      Alert.alert('Clear Failed', 'Unable to clear app data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Progressive Web App</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Installation Status</Text>
        <Text style={styles.statusText}>
          {isInstalled ? '✅ App is installed' : '❌ App not installed'}
        </Text>
        
        {pwaFeatures.installPrompt && !isInstalled && (
          <TouchableOpacity style={styles.installButton} onPress={handleInstallApp}>
            <Text style={styles.buttonText}>📲 Install App</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Service Worker Status</Text>
        <Text style={styles.statusText}>
          Registration: {serviceWorkerStatus.registration ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Active: {serviceWorkerStatus.active ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Update Available: {pwaFeatures.updateAvailable ? '✅' : '❌'}
        </Text>
        
        {pwaFeatures.updateAvailable && (
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateApp}>
            <Text style={styles.buttonText}>🔄 Update App</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>PWA Features</Text>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>Offline Ready</Text>
          <Text style={styles.featureStatus}>
            {pwaFeatures.offlineReady ? '✅' : '❌'}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureText}>Background Sync</Text>
          <Text style={styles.featureStatus}>
            {pwaFeatures.backgroundSync ? '✅' : '❌'}
          </Text>
          {pwaFeatures.backgroundSync && (
            <TouchableOpacity style={styles.syncButton} onPress={triggerBackgroundSync}>
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureText}>Push Notifications</Text>
          <Text style={styles.featureStatus}>
            {pwaFeatures.pushNotifications ? '✅' : '❌'}
          </Text>
          {!pwaFeatures.pushNotifications && 'PushManager' in window && (
            <TouchableOpacity style={styles.enableButton} onPress={enablePushNotifications}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAppData}>
          <Text style={styles.clearButtonText}>🗑️ Clear App Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00684b',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  featureStatus: {
    fontSize: 14,
    marginRight: 10,
  },
  installButton: {
    backgroundColor: '#00684b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#007f82',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  syncButton: {
    backgroundColor: '#dbc600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  enableButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  syncButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  enableButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
