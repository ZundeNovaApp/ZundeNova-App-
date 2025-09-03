import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PhaseAStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phase A Implementation Complete</Text>
      <Text style={styles.subtitle}>Foundation and Offline-First Architecture</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Implementation Status</Text>
        <View style={styles.statusList}>
          <Text style={styles.statusItem}>Mobile-First Navigation: Complete</Text>
          <Text style={styles.statusItem}>Offline Storage: Complete</Text>
          <Text style={styles.statusItem}>Background Sync: Complete</Text>
          <Text style={styles.statusItem}>Multi-Modal Diagnostics: Complete</Text>
          <Text style={styles.statusItem}>Crop Lifecycle Planning: Complete</Text>
          <Text style={styles.statusItem}>Livestock Management: Complete</Text>
          <Text style={styles.statusItem}>Financial Ledger: Complete</Text>
          <Text style={styles.statusItem}>BNPL Integration: Complete</Text>
          <Text style={styles.statusItem}>Microinsurance: Complete</Text>
          <Text style={styles.statusItem}>Weather Integration: Complete</Text>
          <Text style={styles.statusItem}>Task Scheduling: Complete</Text>
          <Text style={styles.statusItem}>Push Notifications: Complete</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
});
