import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import CropLifecyclePlanner from '../components/CropLifecyclePlanner';
import LivestockManagement from '../components/LivestockManagement';
import FinancialLedger from '../components/FinancialLedger';
import WeatherIntegration from '../components/WeatherIntegration';
import IrrigationPlanner from '../components/IrrigationPlanner';

export default function FarmScreen() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'crops' | 'livestock' | 'finance' | 'weather' | 'irrigation'>('overview');
  const [weatherData, setWeatherData] = useState<any>(null);

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.farmCard}>
        <Text style={styles.farmName}>Green Valley Farm</Text>
        <Text style={styles.farmDetails}>25 hectares • Mixed farming</Text>
        <Text style={styles.farmLocation}>📍 Nairobi, Kenya</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Active Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>120</Text>
          <Text style={styles.statLabel}>Livestock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>$2,450</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Health Score</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('crops')}>
          <Text style={styles.actionButtonText}>🌾 Manage Crops</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('livestock')}>
          <Text style={styles.actionButtonText}>🐄 Manage Livestock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('finance')}>
          <Text style={styles.actionButtonText}>💰 Financial Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💳 Apply for Financing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🛡️ Get Insurance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('weather')}>
          <Text style={styles.actionButtonText}>🌤️ Weather & Irrigation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderFinance = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Financial Overview</Text>
      
      <View style={styles.financeCard}>
        <Text style={styles.financeTitle}>Monthly Summary</Text>
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Income</Text>
          <Text style={styles.financeIncome}>+$3,200</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Expenses</Text>
          <Text style={styles.financeExpense}>-$1,850</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Net Profit</Text>
          <Text style={styles.financeProfit}>$1,350</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📊 View Detailed Reports</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>💳 Apply for Input Financing</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farm Management</Text>
      
      <View style={styles.tabBar}>
        {['overview', 'crops', 'livestock', 'finance', 'weather'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'crops' && <CropLifecyclePlanner cropId="crop1" onPlanUpdated={() => {}} />}
      {selectedTab === 'livestock' && <LivestockManagement livestockId="livestock1" onDataUpdated={() => {}} />}
      {selectedTab === 'finance' && <FinancialLedger farmId="farm1" onDataUpdated={() => {}} />}
      {selectedTab === 'weather' && (
        <WeatherIntegration 
          farmLocation={{ latitude: -1.2921, longitude: 36.8219 }}
          onWeatherUpdate={setWeatherData}
        />
      )}
    </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  farmCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  farmName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  farmDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  farmLocation: {
    fontSize: 14,
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  quickActions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  financeCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  financeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  financeLabel: {
    fontSize: 16,
    color: '#666',
  },
  financeIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  financeExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  financeProfit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
});
