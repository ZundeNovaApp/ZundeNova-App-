import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen() {

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#00684b" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌱</Text>
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>☁️</Text>
            <Text style={styles.weatherText}>26°C</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>ZUNDENOVA</Text>
        <Text style={styles.headerSubtitle}>Smart Care for Land, Livestock & Life</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.aiScanCard}>
          <View style={styles.aiScanIcon}>
            <Text style={styles.aiScanIconText}>🤖</Text>
          </View>
          <Text style={styles.aiScanText}>AI DIAGNOSTICS</Text>
          <Text style={styles.aiScanSubtext}>Scan crops & livestock</Text>
        </TouchableOpacity>

        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>☀️</Text>
            <Text style={styles.featureTitle}>Weather</Text>
            <Text style={styles.featureSubtitle}>28°C Sunny</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureTitle}>Market</Text>
            <Text style={styles.featureSubtitle}>Prices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Farm</Text>
            <Text style={styles.featureSubtitle}>Records</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureSubtitle}>Forum</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🛒</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Marketplace</Text>
              <Text style={styles.actionSubtitle}>Buy seeds, fertilizers & tools</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>👨‍⚕️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Expert Consultation</Text>
              <Text style={styles.actionSubtitle}>Chat with vets & agronomists</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💰</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Financial Services</Text>
              <Text style={styles.actionSubtitle}>Loans, insurance & payments</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#00684b',
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
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  aiScanCard: {
    backgroundColor: '#007f82',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  aiScanSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#00684b',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    color: '#00684b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureSubtitle: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00684b',
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00684b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
