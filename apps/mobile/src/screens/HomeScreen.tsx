import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';
import { syncService } from '../services/SyncService';
import PhaseADashboard from '../components/PhaseADashboard';

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    await offlineStorageService.initialize();
    await syncService.initialize();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1F2937" />
      
      <PushNotificationService farmId="farm1" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/zundenova-logo.png')} style={styles.logo} />
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>☁️</Text>
            <Text style={styles.weatherText}>26°C</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>ZUNDENOVA</Text>
      </View>

      <PhaseADashboard 
        farmId="farm1" 
        onNavigate={(screen) => {
          if (screen === 'ai-scan') navigation.navigate('AI Scan' as never);
          else if (screen === 'weather') navigation.navigate('Farm' as never);
          else if (screen === 'marketplace') navigation.navigate('Market' as never);
          else if (screen === 'tasks') navigation.navigate('Farm' as never);
          else if (screen === 'finance') navigation.navigate('Farm' as never);
        }} 
      />
          <View style={styles.aiScanIcon}>
            <Text style={styles.aiScanIconText}>🌿</Text>
          </View>
          <Text style={styles.aiScanText}>AI SCAN</Text>
        </TouchableOpacity>

        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>☀️</Text>
            <Text style={styles.featureTitle}>28°</Text>
            <Text style={styles.featureSubtitle}>Sunny</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Market' as never)}
          >
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureTitle}>Market</Text>
            <Text style={styles.featureSubtitle}>Prices</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fertilizerBanner}>
          <Text style={styles.fertilizerIcon}>🌱</Text>
          <View>
            <Text style={styles.fertilizerTitle}>Magric Fertilizer</Text>
            <Text style={styles.fertilizerSubtitle}>CONTACT US TODAY!</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomGrid}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Farm' as never)}
          >
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Farm Records</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Community' as never)}
          >
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Community</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Market' as never)}
          >
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureTitle}>Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Chat' as never)}
          >
            <Text style={styles.featureIcon}>👨‍⚕️</Text>
            <Text style={styles.featureTitle}>Expert Help</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  weatherText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  aiScanCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiScanIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiScanIconText: {
    fontSize: 30,
  },
  aiScanText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  fertilizerBanner: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fertilizerIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  fertilizerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fertilizerSubtitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  bottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
});
